"use client";

import { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { useRouter } from "next/navigation";

type IdeaTank = {
    idea_seq: number;
    idea_code?: string | null;
    category_idea_type1?: string | null;
    idea_inno_type?: string | null;
    idea_name?: string | null;
    idea_status?: string | null;
    idea_owner_empname?: string | null;
    idea_owner_deposit?: string | null;
    idea_detail?: string | null;
    idea_keywords?: string | null;
    create_datetime: string;
    update_datetime: string;
};

export default function IdeaTankPage() {
    const [ideas, setIdeas] = useState<IdeaTank[]>([]);
    const [filteredIdeas, setFilteredIdeas] = useState<IdeaTank[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [uniqueDepartments, setUniqueDepartments] = useState<string[]>([]);
    const [authChecking, setAuthChecking] = useState(true);
    const router = useRouter();
    
    // Calculate status counts
    const getStatusCounts = () => {
        const totalCount = ideas.length;
        const passedCount = ideas.filter(idea => idea.idea_status === 'ผ่านคัดเลือก').length;
        const notPassedCount = ideas.filter(idea => idea.idea_status === 'ไม่ผ่านคัดเลือก').length;
        const submittedCount = ideas.filter(idea => idea.idea_status === 'ส่งแนวคิด').length;
        
        return {
            total: totalCount,
            passed: passedCount,
            notPassed: notPassedCount,
            submitted: submittedCount
        };
    };
    
    const statusCounts = getStatusCounts();
    
    // Filter states
    const [ideaName, setIdeaName] = useState<string>("");
    const [categoryIdeaType1, setCategoryIdeaType1] = useState<string>("");
    const [ideaStatus, setIdeaStatus] = useState<string>("");
    const [ideaCode, setIdeaCode] = useState<string>("");
    const [ideaOwnerDeposit, setIdeaOwnerDeposit] = useState<string>("");
    const [ideaKeywords, setIdeaKeywords] = useState<string>("");

    useEffect(() => {
        checkAuthAndLoad();
    }, []);

    const checkAuthAndLoad = async () => {
        setAuthChecking(true);
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }

        try {
            // Verify token by making a simple API call
            const authRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`);
            if (!authRes.ok) {
                localStorage.removeItem("user");
                localStorage.removeItem("token");
                router.push("/login");
                return;
            }

            // Load ideas data
            setLoading(true);
            setError(null);
            // Include keyword in the API request if provided
            const params = new URLSearchParams();
            // For initial load, we don't have keyword filters yet, so we load all data
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ideas`);
            if (!res.ok) throw new Error("Failed to load ideas");
            const data: IdeaTank[] = await res.json();
            setIdeas(data);
            setFilteredIdeas(data); // Initialize with filtered data from backend
            
            // Extract unique departments
            const departmentValues = data.map(idea => idea.idea_owner_deposit).filter(Boolean) as string[];
            const departments = [...new Set(departmentValues.filter(deposit => deposit.trim() !== ""))];
            setUniqueDepartments(departments.sort());
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Error loading ideas";
            setError(message);
        } finally {
            setLoading(false);
            setAuthChecking(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        
        // Dispatch custom event to notify other components of authentication change
        window.dispatchEvent(new Event('auth-change'));
        
        router.push("/login");
    };

    const getUser = () => {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            return JSON.parse(userStr);
        }
        return null;
    };

    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        setCurrentUser(getUser());
    }, []);

    // Filter function
    const filterIdeas = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Build query parameters
            const params = new URLSearchParams();
            
            // Add keyword parameter if provided
            if (ideaKeywords) {
                params.append('keyword', ideaKeywords);
            }
            
            // For other filters, we'll still use client-side filtering for now
            // In a full implementation, these would also be backend filters
            const queryString = params.toString();
            const url = `${process.env.NEXT_PUBLIC_API_URL}/ideas${queryString ? `?${queryString}` : ''}`;
            
            const res = await fetch(url);
            if (!res.ok) throw new Error("Failed to load ideas");
            const data: IdeaTank[] = await res.json();
            
            // Apply client-side filters for the remaining fields
            const filtered = data.filter(idea => {
                const matchesIdeaName = !ideaName || idea.idea_name?.toLowerCase().includes(ideaName.toLowerCase());
                const matchesCategory = !categoryIdeaType1 || idea.category_idea_type1?.toLowerCase().includes(categoryIdeaType1.toLowerCase());
                const matchesStatus = !ideaStatus || idea.idea_status?.toLowerCase().includes(ideaStatus.toLowerCase());
                const matchesIdeaCode = !ideaCode || idea.idea_code?.toLowerCase().includes(ideaCode.toLowerCase());
                const matchesOwnerDeposit = !ideaOwnerDeposit || idea.idea_owner_deposit?.toLowerCase().includes(ideaOwnerDeposit.toLowerCase());
                
                return matchesIdeaName && matchesCategory && matchesStatus && matchesIdeaCode && matchesOwnerDeposit;
            });
            
            setFilteredIdeas(filtered);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Error loading ideas";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    // Reset filters
    const resetFilters = async () => {
        setIdeaName("");
        setCategoryIdeaType1("");
        setIdeaStatus("");
        setIdeaCode("");
        setIdeaOwnerDeposit("");
        setIdeaKeywords("");
        // Trigger a new search with no filters
        try {
            setLoading(true);
            setError(null);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ideas`);
            if (!res.ok) throw new Error("Failed to load ideas");
            const data: IdeaTank[] = await res.json();
            setIdeas(data);
            setFilteredIdeas(data);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Error loading ideas";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    // Generate Keywords for ideas lacking them
    const generateKeywords = async () => {
        try {
            // Call backend API to generate keywords for all ideas lacking them
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ideas/generate-keywords`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Keyword generation failed", errorText);
                alert("เกิดข้อผิดพลาดขณะสร้างคีย์เวิร์ด");
                return;
            }

            const data = await response.json();
            
            // Show success message
            alert(data.message);
            
            // Refresh ideas after updates
            // Include keyword in the API request if provided
            const keywordParam = ideaKeywords ? `?keyword=${encodeURIComponent(ideaKeywords)}` : '';
            const refreshedRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ideas${keywordParam}`);
            if (refreshedRes.ok) {
                const refreshedData: IdeaTank[] = await refreshedRes.json();
                setIdeas(refreshedData);
                setFilteredIdeas(refreshedData);
            }
            
            // Log processing details for debugging
            console.log("Keyword generation completed:", {
                processed_count: data.processed_count,
                skipped_count: data.skipped_count,
                errors: data.errors
            });
            
        } catch (err) {
            console.error(err);
            alert("เกิดข้อผิดพลาดขณะสร้างคีย์เวิร์ด");
        }
    };

    // Auto-filter when filter values change
    useEffect(() => {
        filterIdeas();
    }, [ideaName, categoryIdeaType1, ideaStatus, ideaCode, ideaOwnerDeposit, ideaKeywords, ideas]);

    return (
        <div className="page-body">
            <div className="container-fluid">
                {/* Page Title */}
                <div className="page-title mb-4">

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-1">
                            <h3> <span className="text-primary"> IDEA TANK </span></h3>
                        </div>
                        <div className="md:col-span-1">
                            {/* {currentUser && (
                                <div className="text-white">
                                    ผู้ใช้งาน: {currentUser.user_fname} {currentUser.user_lname}
                                </div>
                            )} */}
                        </div>
                        <div className="md:col-span-1 flex justify-end gap-2">
                            <a
                                href="/idea_tank_import"
                                className="btn btn-primary"
                            >
                                นำเข้าข้อมูลจาก Excel
                            </a>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={generateKeywords}
                                disabled={loading}
                            >
                                Generate Keywords
                            </button>
                        </div>
                    </div>

                </div>

                {/* Main Content */}
                <div className="row">
                    <div className="col-sm-12">
                        
                        {/* Filter Card */}
                        <div className="card rounded-lg mb-4">
                            <div className="card-header">
                                <h5>คัดกรองข้อมูล</h5>
                            </div>
                            <div className="card-body">

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

                                    <div className="col-span-1">
                                        <label htmlFor="ideaName" className="form-label">ชื่อความคิดสร้างสรรค์</label>
                                        <input
                                            type="text"
                                            id="ideaName"
                                            className="form-control"
                                            placeholder="ค้นหาชื่อความคิดสร้างสรรค์..."
                                            value={ideaName}
                                            onChange={(e) => setIdeaName(e.target.value)}
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <label htmlFor="categoryIdeaType1" className="form-label">ประเภทนวัตกรรม by AI</label>
                                        <input
                                            type="text"
                                            id="categoryIdeaType1"
                                            className="form-control"
                                            placeholder="ค้นหาประเภทนวัตกรรม..."
                                            value={categoryIdeaType1}
                                            onChange={(e) => setCategoryIdeaType1(e.target.value)}
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <label htmlFor="ideaStatus" className="form-label">สถานะ</label>
                                        <select
                                            id="ideaStatus"
                                            className="form-select"
                                            value={ideaStatus}
                                            onChange={(e) => setIdeaStatus(e.target.value)}
                                        >
                                            <option value="">ทั้งหมด</option>
                                            <option value="ส่งแนวคิด">ส่งแนวคิด</option>
                                            <option value="ผ่านคัดเลือก">ผ่านคัดเลือก</option>
                                            <option value="ไม่ผ่านคัดเลือก">ไม่ผ่านคัดเลือก</option>
                                        </select>
                                    </div>
                                    
                                    <div className="col-span-1">
                                        <label htmlFor="ideaOwnerDeposit" className="form-label">หน่วยงานเจ้าของไอเดีย</label>
                                        <select
                                            id="ideaOwnerDeposit"
                                            className="form-select"
                                            value={ideaOwnerDeposit}
                                            onChange={(e) => setIdeaOwnerDeposit(e.target.value)}
                                        >
                                            <option value="">ทั้งหมด</option>
                                            {uniqueDepartments.map((department, index) => (
                                                <option key={index} value={department}>
                                                    {department}
                                                </option>
                                            ))}
                                        </select>
                                    </div> 
                                    <div className="col-span-1">
                                        <label htmlFor="ideaCode" className="form-label">รหัสไอเดีย</label>
                                        <input
                                            type="text"
                                            id="ideaCode"
                                            className="form-control"
                                            placeholder="ค้นหารหัสไอเดีย..."
                                            value={ideaCode}
                                            onChange={(e) => setIdeaCode(e.target.value)}
                                        />
                                    </div>

                                     <div className="col-span-1">
                                        <label htmlFor="ideaKeywords" className="form-label">คำสำคัญ</label>
                                        <input
                                            type="text"
                                            id="ideaKeywords"
                                            className="form-control"
                                            placeholder="ค้นหาคำสำคัญ..."
                                            value={ideaKeywords}
                                            onChange={(e) => setIdeaKeywords(e.target.value)}
                                        />
                                    </div>
                                </div>
                               

                                <div className="row mt-3">
                                    <div className="col-12">
                                        <div className="d-flex gap-2">
                                            <button
                                                type="button"
                                                className="btn btn-primary"
                                                onClick={filterIdeas}
                                            >
                                                ค้นหา
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                onClick={resetFilters}
                                            >
                                                เริ่มใหม่
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            {/* Total Count Card - Gray Background */}
                            <div className="card  rounded-lg" style={{ backgroundColor: '#f8f9fa', padding: '1px' }}>
                                <div className="card-body text-center" style={{  padding: '10px' }} >
                                    <h2 className="mb-3"> <span style={{ fontSize:'16px'}}>สรุปจำนวนรายการ<br/>ทั้งหมด   </span>  </h2>
                                    <div className="display-4 fw-bold text-dark">{statusCounts.total}</div>
                                    <p className="text-muted mb-0">รายการ</p>
                                </div>
                            </div>
                            
                            {/* Passed Count Card - Green Background */}
                            <div className="card rounded-lg" style={{ backgroundColor: '#d4edda', padding: '1px' }}>
                                <div className="card-body text-center" style={{  padding: '10px' }} >
                                    <h5 className="mb-3">  <span style={{ fontSize:'16px'}}> สรุปจำนวนรายการ  ที่มีสถานะ <br/>  ผ่านคัดเลือก </span>  </h5>
                                    <div className="display-4 fw-bold text-success">{statusCounts.passed}</div>
                                    <p className="text-muted mb-0">รายการ</p>
                                </div>
                            </div>
                            
                            {/* Not Passed Count Card - Red Background */}
                            <div className="card rounded-lg" style={{ backgroundColor: '#f8d7da', padding: '1px' }}>
                                <div className="card-body text-center"  style={{  padding: '10px' }} >
                                    <h5 className=" mb-3">  <span style={{ fontSize:'16px'}}>  สรุปจำนวนรายการ ที่มีสถานะ <br/>  ไม่ผ่านคัดเลือก  </span></h5>
                                    <div className="display-4 fw-bold text-danger">{statusCounts.notPassed}</div>
                                    <p className="text-muted mb-0">รายการ</p>
                                </div>
                            </div>
                            
                            {/* Submitted Count Card - Purple Background */}
                            <div className="card rounded-lg" style={{ backgroundColor: '#e2d9f3', padding: '1px' }}>
                                <div className="card-body text-center"  style={{  padding: '10px' }} >
                                    <h5 className=" mb-3"> <span style={{ fontSize:'16px'}}>  สรุปจำนวนรายการ ที่มีสถานะ <br/>  ส่งแนวคิด  </span></h5>
                                    <div className="display-4 fw-bold" style={{ color: '#7721ef' }}>{statusCounts.submitted}</div>
                                    <p className="text-muted mb-0">รายการ</p>
                                </div>
                            </div>
                        </div>

                        <div className="card rounded-lg">
                            <div className="card-header">
                                <h5>ระบบคลังความคิดสร้างสรรค์ (Idea-Tank) </h5>
                                <p className="f-m-light mt-1">
                                    ระบบคลังความคิดสร้างสรรค์ (Idea Tank) เป็นแพลตฟอร์มที่รวบรวมและจัดการ
                                    ความคิดสร้างสรรค์จากพนักงานในองค์กร เพื่อส่งเสริมการนำนวัตกรรมใหม่ๆ มาใช้ในการพัฒนา
                                    และปรับปรุงกระบวนการทำงาน รวมถึงผลิตภัณฑ์และบริการต่างๆ ขององค์กร
                                </p>
                            </div>
                            <div className="card-body">
                                {authChecking ? (
                                    <div className="text-center py-5">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">กำลังตรวจสอบสิทธิ์...</span>
                                        </div>
                                        <p className="mt-3 text-muted">กำลังตรวจสอบสิทธิ์...</p>
                                    </div>
                                ) : loading ? (
                                    <div className="text-center py-5">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">กำลังโหลดข้อมูล...</span>
                                        </div>
                                        <p className="mt-3 text-muted">กำลังโหลดข้อมูล...</p>
                                    </div>
                                ) : error ? (
                                    <div className="alert alert-danger" role="alert">
                                        <h4 className="alert-heading">เกิดข้อผิดพลาด!</h4>
                                        <p>{error}</p>
                                    </div>
                                ) : (
                                    <div className="table-responsive custom-scrollbar">
                                        <table className="table">                                            
                                            <thead>
                                                <tr>
                                                    <th scope="col">รหัส</th>
                                                    <th scope="col">ประเภทนวัตกรรม</th>
                                                    <th scope="col">ประเภทของนวัตกรรม</th>
                                                    <th scope="col">ชื่อความคิดสร้างสรรค์</th>
                                                    <th scope="col">keywords</th>
                                                    <th scope="col">สถานะ</th>
                                                    <th scope="col">เจ้าของไอเดีย</th>
                                                    <th scope="col"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredIdeas.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={8} className="text-center py-4">
                                                            {ideas.length === 0 ? "ไม่มีข้อมูล" : "ไม่พบข้อมูลที่ตรงกับเงื่อนไข"}
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    filteredIdeas.map((idea) => (
                                                        <tr key={idea.idea_seq}>
                                                            <th scope="row">{idea.idea_code || "-"}</th>
                                                            <td>{idea.category_idea_type1 || "-"}</td>
                                                            <td>{idea.idea_inno_type || "-"}</td>
                                                            <td className="whitespace-pre-wrap">{idea.idea_name || "-"}
                                                               
                                                            </td>
                                                            <td className="whitespace-pre-wrap">{idea.idea_keywords || "-"}</td>
                                                            <td>
                                                                {idea.idea_status ? (
                                                                    <span className={`badge ${
                                                                        idea.idea_status === 'ผ่านคัดเลือก' ? 'badge-light-primary' :
                                                                        idea.idea_status === 'ไม่ผ่านคัดเลือก' ? 'badge-light-danger' :
                                                                        'badge-light-info'
                                                                    }`}>
                                                                        {idea.idea_status}
                                                                    </span>
                                                                ) : (
                                                                    "-"
                                                                )}
                                                            </td>
                                                            <td>
                                                                {idea.idea_owner_deposit || "-"}
                                                                {idea.idea_owner_empname && (
                                                                    <>
                                                                        <br />
                                                                        {idea.idea_owner_empname}
                                                                    </>
                                                                )}
                                                            </td>
                                                            <td>
                                                                <a
                                                                    href={`/idea_tank_detail/${idea.idea_seq}`}
                                                                    className="btn btn-sm btn-primary"
                                                                    title="ดูรายละเอียด"
                                                                >
                                                                    <FaSearch className="me-1" />
                                                                    
                                                                </a>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}