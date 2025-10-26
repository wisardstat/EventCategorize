"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FaArrowLeft, FaSpinner, FaSave, FaTimes } from "react-icons/fa";

type IdeaTank = {
    idea_seq: number;
    idea_code?: string | null;
    category_idea_type1?: string | null;
    idea_inno_type?: string | null;
    idea_name?: string | null;
    idea_subject?: string | null;
    idea_source?: string | null;
    customer_target?: string | null;
    idea_detail?: string | null;
    idea_finance_impact?: string | null;
    idea_nonfinance_impact?: string | null;
    idea_status?: string | null;
    idea_owner_empcode?: string | null;
    idea_owner_empname?: string | null;
    idea_owner_deposit?: string | null;
    idea_owner_contacts?: string | null;
    idea_keywords?: string | null;
    idea_comment?: string | null;
    idea_summary_byai?: string | null;
    create_datetime: string;
    update_datetime: string;
};

export default function IdeaTankDetailPage() {
    const params = useParams();
    const router = useRouter();
    const idea_seq = params.idea_seq as string;
    
    const [idea, setIdea] = useState<IdeaTank | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [summarizing, setSummarizing] = useState(false);
    const [authChecking, setAuthChecking] = useState(true);
    
    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [ideaStatus, setIdeaStatus] = useState<string>("");
    const [ideaComment, setIdeaComment] = useState<string>("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        checkAuthAndLoadIdea();
    }, [idea_seq]);

    const checkAuthAndLoadIdea = async () => {
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

            // Load idea data
            if (idea_seq) {
                setLoading(true);
                setError(null);
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ideas/${idea_seq}`);
                if (!res.ok) throw new Error("Failed to load idea details");
                const data: IdeaTank = await res.json();
                setIdea(data);
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Error loading idea details";
            setError(message);
        } finally {
            setLoading(false);
            setAuthChecking(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
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

    const handleBack = () => {
        router.push("/idea_tank");
    };

    const handleSummarize = async () => {
        if (!idea || !idea.idea_detail || idea.idea_detail.trim() === "-" || idea.idea_detail.trim() === "") {
            alert("ไม่มีข้อมูลรายละเอียดความคิดสร้างสรรค์ให้สรุป");
            return;
        }

        setSummarizing(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ideas/${idea_seq}/summarize`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error("Failed to summarize idea");
            }

            const updatedIdea: IdeaTank = await response.json();
            setIdea(updatedIdea);
            //  alert("AI สรุปและจัดรูปแบบข้อความเรียบร้อยแล้ว");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Error summarizing idea";
            alert(`เกิดข้อผิดพลาด: ${message}`);
        } finally {
            setSummarizing(false);
        }
    };

    const handleSaveEvaluation = async () => {
        if (!idea) return;
        
        setSaving(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ideas/${idea_seq}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    idea_status: ideaStatus,
                    idea_comment: ideaComment,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to save evaluation");
            }

            const updatedIdea: IdeaTank = await response.json();
            setIdea(updatedIdea);
            setShowModal(false);
           // alert("บันทึกผลการพิจารณาเรียบร้อยแล้ว");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Error saving evaluation";
            alert(`เกิดข้อผิดพลาด: ${message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleOpenModal = () => {
        if (idea) {
            setIdeaStatus(idea.idea_status || "");
            setIdeaComment(idea.idea_comment || "");
            setShowModal(true);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setIdeaStatus("");
        setIdeaComment("");
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString("th-TH", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (authChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <p className="mt-4 text-muted">กำลังตรวจสอบสิทธิ์...</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <p className="mt-4 text-muted">กำลังโหลดข้อมูล...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="alert alert-danger" role="alert">
                    <h4 className="alert-heading">เกิดข้อผิดพลาด!</h4>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    if (!idea) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="alert alert-warning" role="alert">
                    ไม่พบข้อมูลความคิดสร้างสรรค์
                </div>
            </div>
        );
    }

    return (
        <div className="page-body min-h-screen flex items-center justify-center">
            <div className="container-fluid">
                {/* Page Title */}
                <div className="page-title mb-4">

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-1">
                            <button
                                    onClick={handleBack}
                                    className="btn btn-light d-flex align-items-center gap-2"
                                    type="button"
                                >
                                    <FaArrowLeft />
                                    <span>กลับ</span>
                                </button>
                          
                        </div>
                        <div className="md:col-span-1">
                           <h3 className="mb-0 " > <span className="text-primary"> รายละเอียดความคิดสร้างสรรค์ </span></h3>
                        </div>
                        <div className="md:col-span-1 flex justify-end ">
                            {/* {currentUser && (
                                <div className="text-white d-flex align-items-center">
                                    ผู้ใช้งาน: {currentUser.user_fname} {currentUser.user_lname}
                                </div>
                            )} */}
                            <button
                                onClick={handleOpenModal}
                                className="btn btn-primary"
                            >
                               บันทึกผลการพิจารณา
                            </button>
                            
                        </div>
                    </div>

                </div>
 

                {/* Main Content */}
                <div className="row  ">
                    <div className="col-12">
                        {/* Basic Information Card */}
                        <div className="card mb-4">
                            <div className="card-header pb-0">
                                <h5>ข้อมูลพื้นฐาน (IDEA-Code : {idea.idea_code || "-"})</h5>
                            </div>
                            <div className="card-body">

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    

                                    <div className="col-span-1">
                                        <label className="form-label">ประเภทนวัตกรรม by AI</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            value={idea.category_idea_type1 || "-"} 
                                            readOnly 
                                        />
                                    </div>
                                     <div className="col-md-4">
                                        <label className="form-label">ประเภทของนวัตกรรม</label>
                                        <input 
                                            type="text" 
                                            className="form-control " 
                                            value={idea.idea_inno_type || "-"} 
                                            readOnly 
                                        />
                                    </div>

                                     <div className="col-span-1">
                                        <label className="form-label text-hilight">สถานะ</label>
                                        <input
                                            type="text"
                                            className={`form-control bg-green-500 ${
                                                idea.idea_status === 'ผ่านคัดเลือก' ? 'bg-green-100' :
                                                idea.idea_status === 'ไม่ผ่านคัดเลือก' ? 'bg-red-100' :
                                                'bg-gray-100'
                                            }`}
                                            value={idea.idea_status || "-"}
                                            readOnly
                                        />
                                    </div>
                                </div>
                                <div className="row g-3 ">  

                                    <div className="col-12">
                                        <label className="form-label text-hilight">  ชื่อความคิดสร้างสรรค์</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={idea.idea_name || "-"}
                                            readOnly
                                        />
                                    </div>

                                    <div className="col-12">
                                        <label className="form-label">หัวข้อ</label>
                                        <input 
                                            type="text"
                                            className="form-control"                                            
                                            value={idea.idea_subject || "-"} 
                                            readOnly 
                                        />
                                    </div>

                                    
                                </div>
                            </div>
                        </div>
 
                        {/* Detail Information Card */}
                        <div className="card mb-4">
                            <div className="card-header pb-0">
                                <h5>รายละเอียด</h5>
                            </div>
                            <div className="card-body">
                                <div className="row g-3">
                                    <div className="col-12">
                                        <label className="form-label">แหล่งที่มา</label>
                                        <textarea 
                                            className="form-control" 
                                            rows={2}
                                            value={idea.idea_source || "-"} 
                                            readOnly 
                                        />
                                    </div>

                                    <div className="col-12">
                                        <label className="form-label">กลุ่มลูกค้าเป้าหมาย</label>
                                        <textarea 
                                            className="form-control" 
                                            rows={2}
                                            value={idea.customer_target || "-"} 
                                            readOnly 
                                        />
                                    </div>

                                    <div className="col-12">
                                        <label className="form-label text-hilight">รายละเอียดความคิดสร้างสรรค์</label>
                                        <div className="relative">
                                            <textarea
                                                className="form-control"
                                                rows={15}
                                                value={idea.idea_detail || "-"}
                                                readOnly
                                            />                                           
                                        </div>                                        
                                    </div>

                                    <div className="col-12">
                                        <label className="form-label"></label>
                                        <div className="relative">

                                            <button
                                                className="absolute bottom-2 right-2 btn btn-primary btn-sm"
                                                type="button"
                                                onClick={handleSummarize}
                                                disabled={summarizing}
                                            >
                                                {summarizing ? (
                                                    <>
                                                        <FaSpinner className="animate-spin me-1" />
                                                        กำลังประมวลผล...
                                                    </>
                                                ) : (
                                                    "ให้ AI สรุปและจัดรูปแบบให้อ่านง่ายขึ้น"
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="col-12">
                                        <label className="form-label">สรุปโดย AI</label>
                                        <textarea 
                                            className="form-control" 
                                            rows={10}
                                            value={idea.idea_summary_byai || "-"} 
                                            readOnly 
                                        />
                                    </div>

                                     <div className="col-12">
                                        <label className="form-label">คีย์เวิร์ด</label> <br/>
                                        <label className="text-info"  
                                        >{(idea.idea_keywords || "-").replace(/,/g, " , ")} </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Impact Information Card */}
                        <div className="card mb-4">
                            <div className="card-header pb-0">
                                <h5>ผลกระทบ</h5>
                            </div>
                            <div className="card-body ">
                                <div className="row g-3 ">
                                    <div className="col-12 ">
                                        <label className="form-label">ผลกระทบด้านการเงิน</label>
                                        <textarea 
                                            className="form-control" 
                                            rows={2}
                                            value={idea.idea_finance_impact || "-"} 
                                            readOnly 
                                        />
                                    </div>

                                    <div className="col-12">
                                        <label className="form-label">ผลกระทบด้านอื่นๆ</label>
                                        <textarea 
                                            className="form-control" 
                                            rows={2}
                                            value={idea.idea_nonfinance_impact || "-"} 
                                            readOnly 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Owner Information Card */}
                        <div className="card mb-4">
                            <div className="card-header pb-0">
                                <h5>ข้อมูลเจ้าของไอเดีย</h5>
                            </div>
                            <div className="card-body">
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label">รหัสพนักงาน</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            value={idea.idea_owner_empcode || "-"} 
                                            readOnly 
                                        />
                                    </div>
                                    
                                    <div className="col-md-6">
                                        <label className="form-label text-hilight">แผนก/ฝ่าย</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            value={idea.idea_owner_deposit || "-"} 
                                            readOnly 
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label text-hilight">ชื่อพนักงาน</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            value={idea.idea_owner_empname || "-"} 
                                            readOnly 
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">ข้อมูลติดต่อ</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            value={idea.idea_owner_contacts || "-"} 
                                            readOnly 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Comments Card */}
                        <div className="card mb-4">
                            <div className="card-header pb-0">
                                <h5>ความคิดเห็น</h5>
                            </div>
                            <div className="card-body">
                                <div className="row g-3">
                                    <div className="col-12">
                                        <label className="form-label">ความคิดเห็นเพิ่มเติม</label>
                                        <textarea 
                                            className="form-control" 
                                            rows={4}
                                            value={idea.idea_comment || "-"} 
                                            readOnly 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Timestamp Information Card */}
                        <div className="card mb-4">
                            <div className="card-header pb-0">
                                <h5>ข้อมูลเวลา</h5>
                            </div>
                            <div className="card-body">
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label">วันที่สร้าง</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            value={formatDate(idea.create_datetime)} 
                                            readOnly 
                                        />
                                    </div>
                                    
                                    <div className="col-md-6">
                                        <label className="form-label">วันที่อัปเดต</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            value={formatDate(idea.update_datetime)} 
                                            readOnly 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Evaluation Modal */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 bg-black/50"
                            onClick={handleCloseModal}
                        ></div>
                        
                        {/* Modal Content */}
                        <div className="relative z-10 bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h5 className="text-xl font-semibold">บันทึกผลการพิจารณา</h5>
                                    <button
                                        onClick={handleCloseModal}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <FaTimes />
                                    </button>
                                </div>
                                
                                {/* Modal Body */}
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="ideaStatus" className="block text-sm font-medium text-gray-700 mb-1">
                                            สถานะ
                                        </label>
                                        <select
                                            id="ideaStatus"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={ideaStatus}
                                            onChange={(e) => setIdeaStatus(e.target.value)}
                                        >
                                            <option value="">เลือกสถานะ</option>
                                            <option value="ส่งแนวคิด">ส่งแนวคิด</option>
                                            <option value="ผ่านคัดเลือก">ผ่านคัดเลือก</option>
                                            <option value="ไม่ผ่านคัดเลือก">ไม่ผ่านคัดเลือก</option>
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="ideaComment" className="block text-sm font-medium text-gray-700 mb-1">
                                            ความคิดเห็นเพิ่มเติม
                                        </label>
                                        <textarea
                                            id="ideaComment"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            rows={4}
                                            value={ideaComment}
                                            onChange={(e) => setIdeaComment(e.target.value)}
                                            placeholder="กรอกความคิดเห็นเพิ่มเติม..."
                                        />
                                    </div>
                                </div>
                                
                                {/* Modal Footer */}
                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        onClick={handleCloseModal}
                                        className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 flex items-center gap-2"
                                    >
                                        <FaTimes />
                                        ยกเลิก
                                    </button>
                                    <button
                                        onClick={handleSaveEvaluation}
                                        disabled={saving || !ideaStatus}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {saving ? (
                                            <>
                                                <FaSpinner className="animate-spin" />
                                                กำลังบันทึก...
                                            </>
                                        ) : (
                                            <>
                                                <FaSave />
                                                บันทึกผล
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}