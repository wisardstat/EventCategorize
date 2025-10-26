"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

interface UserFormData {
  user_code: string;
  user_fname: string;
  user_lname: string;
  user_login: string;
  user_password: string;
}

interface UserData {
  user_code: string;
  user_fname: string;
  user_lname: string;
  user_login: string;
  user_createdate: string;
  user_updatedate: string;
}

export default function UserModifyPage() {
  const [formData, setFormData] = useState<UserFormData>({
    user_code: "",
    user_fname: "",
    user_lname: "",
    user_login: "",
    user_password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const user_code = params.user_code as string;

  useEffect(() => {
    loadUserData();
  }, [user_code]);

  const loadUserData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${user_code}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }
        throw new Error("Failed to load user data");
      }

      const data: UserData = await response.json();
      setFormData({
        user_code: data.user_code,
        user_fname: data.user_fname,
        user_lname: data.user_lname,
        user_login: data.user_login,
        user_password: "", // Don't pre-fill password
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error loading user data";
      setError(message);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validate required fields
    if (!formData.user_code || !formData.user_fname || !formData.user_lname || !formData.user_login) {
      setError("กรุณากรอกข้อมูลให้ครบถ้วน");
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${user_code}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update user");
      }

      setSuccess("อัปเดตผู้ใช้งานสำเร็จ");

      // Redirect to user list after 2 seconds
      setTimeout(() => {
        router.push("/user_list");
      }, 2000);

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error updating user";
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
  }, []);

  if (initialLoading) {
    return (
      <div className="page-body">
        <div className="container-fluid">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">กำลังโหลดข้อมูล...</span>
            </div>
            <p className="mt-3 text-muted">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-body">
      <div className="container-fluid">
        {/* Page Title */}
        <div className="page-title mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <h3><span className="text-primary">แก้ไขผู้ใช้งาน</span></h3>
            </div>
            <div className="md:col-span-1">
              {/* Middle column - can be used for additional controls */}
            </div>
            <div className="md:col-span-1 flex justify-end gap-2">
              <button
                onClick={handleCancel}
                className="btn btn-secondary"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>

        {/* User Info */}
        {currentUser && (
          <div className="alert alert-info mb-4">
            ผู้ใช้งานปัจจุบัน: {currentUser.user_fname} {currentUser.user_lname} ({currentUser.user_login})
          </div>
        )}

        {/* Main Content */}
        <div className="row">
          <div className="col-sm-12">
            <div className="card rounded-lg">
              <div className="card-header">
                <h5>แก้ไขข้อมูลผู้ใช้งาน</h5>
                <p className="f-m-light mt-1">
                  แก้ไขข้อมูลผู้ใช้งาน: {formData.user_fname} {formData.user_lname}
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
                    <div className="col-md-6">
                      <label htmlFor="user_code" className="form-label">รหัสผู้ใช้งาน *</label>
                      <input
                        type="text"
                        className="form-control"
                        id="user_code"
                        name="user_code"
                        value={formData.user_code}
                        onChange={handleChange}
                        required
                        placeholder="รหัสผู้ใช้งาน"
                        readOnly
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
                      <label htmlFor="user_password" className="form-label">รหัสผ่าน</label>
                      <input
                        type="password"
                        className="form-control"
                        id="user_password"
                        name="user_password"
                        value={formData.user_password}
                        onChange={handleChange}
                        placeholder="เว้นว่างไว้หากไม่ต้องการเปลี่ยนรหัสผ่าน"
                      />
                      <small className="form-text text-muted">เว้นว่างไว้หากไม่ต้องการเปลี่ยนรหัสผ่าน</small>
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
                          {loading ? "กำลังบันทึก..." : "บันทึก"}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancel}
                          className="btn btn-secondary"
                        >
                          ยกเลิก
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