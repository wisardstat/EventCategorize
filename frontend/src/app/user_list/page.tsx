"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  user_code: string;
  user_fname: string;
  user_lname: string;
  user_login: string;
  user_createdate: string;
  user_updatedate: string;
}

export default function UserListPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuthAndLoadUsers();
  }, []);

  const checkAuthAndLoadUsers = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
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
        throw new Error("Failed to load users");
      }

      const data: User[] = await response.json();
      setUsers(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error loading users";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (user_code: string) => {
    if (!confirm("คุณแน่ใจว่าต้องการลบผู้ใช้งานนี้?")) {
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${user_code}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      // Refresh the user list
      checkAuthAndLoadUsers();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error deleting user";
      setError(message);
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

  return (
    <div className="page-body">
      <div className="container-fluid">
        {/* Page Title */}
        <div className="page-title mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <h3><span className="text-primary">จัดการผู้ใช้งาน</span></h3>
            </div>
            <div className="md:col-span-1">
              {/* Middle column - can be used for additional controls */}
            </div>
            <div className="md:col-span-1 flex justify-end gap-2">
              <a
                href="/user_create"
                className="btn btn-primary"
              >
                เพิ่มผู้ใช้งาน
              </a>
              
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
          <div className="col-12">
            <div className="card rounded-lg">
              <div className="card-header">
                <h5>รายชื่อผู้ใช้งาน</h5>
                <p className="f-m-light mt-1">
                  จัดการข้อมูลผู้ใช้งานในระบบ
                </p>
              </div>
              <div className="card-body">
                {loading ? (
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
                          <th scope="col">รหัสผู้ใช้งาน</th>
                          <th scope="col">ชื่อ</th>
                          <th scope="col">นามสกุล</th>
                          <th scope="col">ชื่อผู้ใช้งาน (Login)</th>
                          <th scope="col">วันที่สร้าง</th>
                          <th scope="col">วันที่อัปเดต</th>
                          <th scope="col">จัดการ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="text-center py-4">
                              ไม่มีข้อมูลผู้ใช้งาน
                            </td>
                          </tr>
                        ) : (
                          users.map((user) => (
                            <tr key={user.user_code}>
                              <th scope="row">{user.user_code}</th>
                              <td>{user.user_fname}</td>
                              <td>{user.user_lname}</td>
                              <td>{user.user_login}</td>
                              <td>{new Date(user.user_createdate).toLocaleDateString('th-TH')}</td>
                              <td>{new Date(user.user_updatedate).toLocaleDateString('th-TH')}</td>
                              <td>
                                <div className="d-flex gap-1">
                                  <a
                                    href={`/user_modify/${user.user_code}`}
                                    className="btn btn-sm btn-primary"
                                    title="แก้ไข"
                                  >
                                    แก้ไข
                                  </a>
                                  <button
                                    onClick={() => handleDelete(user.user_code)}
                                    className="btn btn-sm btn-danger"
                                    title="ลบ"
                                    disabled={user.user_code === currentUser?.user_code}
                                  >
                                    ลบ
                                  </button>
                                </div>
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