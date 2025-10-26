"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface UserFormData {
  user_code: string;
  user_fname: string;
  user_lname: string;
  user_login: string;
  user_password: string;
}

export default function UserCreatePage() {
  const [formData, setFormData] = useState<UserFormData>({
    user_code: "",
    user_fname: "",
    user_lname: "",
    user_login: "",
    user_password: "",
  });
  const [loading, setLoading] = useState(false);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateUserCode = async () => {
    setGeneratingCode(true);
    setError(null);
    
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/generate-code`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to generate user code");
      }

      const data = await response.json();
      setFormData(prev => ({
        ...prev,
        user_code: data.user_code
      }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error generating user code";
      setError(message);
    } finally {
      setGeneratingCode(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validate required fields (excluding user_code as it's auto-generated)
    if (!formData.user_fname || !formData.user_lname || !formData.user_login || !formData.user_password) {
      setError("กรุณากรอกข้อมูลให้ครบถ้วน");
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to create user");
      }

      setSuccess("สร้างผู้ใช้งานสำเร็จ");
      
      // Reset form
      setFormData({
        user_code: "",
        user_fname: "",
        user_lname: "",
        user_login: "",
        user_password: "",
      });

      // Redirect to user list after 2 seconds
      setTimeout(() => {
        router.push("/user_list");
      }, 2000);

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error creating user";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/user_list");
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
    // Generate user code when component mounts
    generateUserCode();
  }, []);

  return (
    <div className="page-body">
      <div className="container-fluid">
        {/* Page Title */}
        <div className="page-title mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <h3><span className="text-primary">เพิ่มผู้ใช้งาน</span></h3>
            </div>
            <div className="md:col-span-1">
              {/* Middle column - can be used for additional controls */}
            </div>
            <div className="md:col-span-1 flex justify-end gap-2">
              
              
            </div>
          </div>
        </div>

        {/* User Info
        {currentUser && (
          <div className="alert alert-info mb-4">
            ผู้ใช้งานปัจจุบัน: {currentUser.user_fname} {currentUser.user_lname} ({currentUser.user_login})
          </div>
        )} */}

        {/* Main Content */}
        <div className="row">
          <div className="col-12">
            <div className="card rounded-lg">
              <div className="card-header">
                <h5>ข้อมูลผู้ใช้งาน</h5>
                <p className="f-m-light mt-1">
                  กรอกข้อมูลผู้ใช้งานใหม่
                </p>
              </div>
              <div className="card-body">
                {error && (
                  <div className="alert alert-danger" role="alert">
                    <h4 className="alert-heading">เกิดข้อผิดพลาด!</h4>
                    <p>{error}</p>
                  </div>
                )}

                {success && (
                  <div className="alert alert-success" role="alert">
                    <h4 className="alert-heading">สำเร็จ!</h4>
                    <p>{success}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-12">
                      <label htmlFor="user_code" className="form-label">รหัสผู้ใช้งาน</label>
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control"
                          id="user_code"
                          name="user_code"
                          value={formData.user_code}
                          onChange={handleChange}
                          readOnly
                          placeholder="รหัสผู้ใช้งาน (สร้างอัตโนมัติ)"
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={generateUserCode}
                          disabled={generatingCode}
                        >
                          {/* {generatingCode ? "กำลังสร้าง..." : "สร้างใหม่"} */}
                        </button>
                      </div>
                      {/* <small className="form-text text-muted">รหัสผู้ใช้งานจะถูกสร้างอัตโนมัติ</small> */}
                    </div>
                     
                    <div className="col-md-6">
                      <label htmlFor="user_fname" className="form-label">ชื่อ *</label>
                      <input
                        type="text"
                        className="form-control"
                        id="user_fname"
                        name="user_fname"
                        value={formData.user_fname}
                        onChange={handleChange}
                        required
                        placeholder="ชื่อผู้ใช้งาน"
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="user_lname" className="form-label">นามสกุล *</label>
                      <input
                        type="text"
                        className="form-control"
                        id="user_lname"
                        name="user_lname"
                        value={formData.user_lname}
                        onChange={handleChange}
                        required
                        placeholder="นามสกุลผู้ใช้งาน"
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="user_login" className="form-label">ชื่อผู้ใช้งาน (Login) *</label>
                      <input
                        type="text"
                        className="form-control"
                        id="user_login"
                        name="user_login"
                        value={formData.user_login}
                        onChange={handleChange}
                        required
                        placeholder="ชื่อผู้ใช้งานสำหรับ login"
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="user_password" className="form-label">รหัสผ่าน *</label>
                      <input
                        type="password"
                        className="form-control"
                        id="user_password"
                        name="user_password"
                        value={formData.user_password}
                        onChange={handleChange}
                        required
                        placeholder="รหัสผ่าน"
                      />
                    </div>
                  </div>

                  <div className="row mt-4">
                    <div className="col-12">
                      <div className="d-flex gap-2">
                        <button
                          type="submit"
                          disabled={loading}
                          className="btn btn-primary"
                        >
                          {loading ? "กำลังบันทึก..." : "บันทึก/Save"}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancel}
                          className="btn btn-light"
                        >
                          ยกเลิก/Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}