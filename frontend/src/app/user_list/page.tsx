"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getWithAuth, deleteWithAuth } from "@/utils/api";
import { canAccessUserList, getCurrentUser } from "@/utils/permissions";

interface User {
  user_code: string;
  user_fname: string;
  user_lname: string;
  user_login: string;
  user_createdate: string;
  user_updatedate: string;
  user_role: string;
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
    // Check if user has permission to access user list
    if (!canAccessUserList()) {
      const currentUser = getCurrentUser();
      if (currentUser?.user_login === 'admin') {
        // Special case: admin user but permission issue - allow access with warning
        setError("⚠️ ตรวจพบปัญหาสิทธิ์การเข้าถึง แต่อนุญาตให้เข้าถึงชั่วคราวเพื่อแก้ไขปัญหา");
      } else {
        setError("คุณไม่มีสิทธิ์เข้าถึงหน้าจัดการผู้ใช้งาน");
        setLoading(false);
        return;
      }
    }

    try {
      // Debug: Check if token exists
      const token = localStorage.getItem('token');
      const currentUser = getCurrentUser();
      console.log('=== DEBUG INFO ===');
      console.log('Token exists:', !!token);
      console.log('Token value:', token ? token.substring(0, 20) + '...' : 'null');
      console.log('Current user:', currentUser);
      console.log('Current user role:', currentUser?.user_role);
      
      const response = await getWithAuth("/users");
      console.log('>>> Fetch /users response:', response);
      console.log('Response status:', response.status);
      console.log('Response statusText:', response.statusText);
      if (!response.ok) {
        // Handle HTTP errors
        if (response.status === 403) {

          const currentUser = getCurrentUser();
          if (currentUser?.user_login === 'admin') {
            setError("⚠️ Admin user มีปัญหาสิทธิ์การเข้าถึง กรุณาใช้ปุ่ม 'แก้ไขสิทธิ์ Admin' ด้านล่าง");
          } else {
            setError("คุณไม่มีสิทธิ์เข้าถึงข้อมูลผู้ใช้งาน");
          }

        } else if (response.status === 401) {
          setError("กรุณาเข้าสู่ระบบใหม่อีกครั้ง");
        } else {
          setError(`เกิดข้อผิดพลาด: ${response.status} ${response.statusText}`);
        }

        return;
      }
      
      const data: User[] = await response.json();
      
      // Validate that the response is an array
      if (!Array.isArray(data)) {
        setError("ข้อมูลผู้ใช้งานไม่ถูกต้อง");
        return;
      }
      
      setUsers(data);
      // Clear error if successful
      setError(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error loading users";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const fixAdminRole = async () => {
    const currentUser = getCurrentUser();
    console.log('********************************')
    console.log('********************************')
    console.log('Attempting to fix admin role for user:', currentUser);
    console.log('Attempting to fix admin role for currentUser.user_login:', currentUser?.user_login);
    console.log('********************************')
    console.log('********************************')
    if (!currentUser || currentUser.user_login !== 'admin') {
      setError("เฉพาะ Admin เท่านั้นที่สามารถแก้ไขสิทธิ์ได้");
      return;
    }

    try {
      setLoading(true);
      setError("กำลังแก้ไขสิทธิ์ Admin...");
      
      // Try to call the fix-admin-role endpoint
      console.log('>>> Attempting to call /users/fix-admin-role...');
      let response = await getWithAuth("/users/fix-admin-role");
      console.log('>>> Fetch /users/fix-admin-role response:', response);
      
      // If the first endpoint fails with 404, try the alternative
      if (!response.ok && response.status === 404) {
        console.log('>>> First endpoint returned 404, trying alternative endpoint...');
        setError("กำลังลองวิธีการแก้ไขอื่น...");
        response = await getWithAuth("/users/fix-admin-role-alt");
        console.log('>>> Fetch /users/fix-admin-role-alt response:', response);
      }
      
      if (response.ok) {
        const result = await response.json();
        console.log('>>> Admin role fix result:', result);
        setError(`✅ ${result.message} กรุณาเข้าสู่ระบบใหม่อีกครั้ง`);
        // Clear localStorage and redirect to login
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('user_role');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        console.error('>>> Failed to fix admin role:', response.status, response.statusText);
        setError(`❌ ไม่สามารถแก้ไขสิทธิ์ Admin ได้ (Status: ${response.status}) กรุณาติดต่อผู้ดูแลระบบ`);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error fixing admin role";
      console.error('>>> Error fixing admin role:', err);
      setError(`❌ เกิดข้อผิดพลาด: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (user_code: string) => {
    if (!confirm("คุณแน่ใจว่าต้องการลบผู้ใช้งานนี้?")) {
      return;
    }

    try {
      await deleteWithAuth(`/users/${user_code}`);
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
              {error && error.includes('Admin') && (
                <button
                  onClick={fixAdminRole}
                  disabled={loading}
                  className="btn btn-danger"
                >
                  {loading ? 'กำลังแก้ไข...' : 'แก้ไขสิทธิ์ Admin'}
                </button>
              )}
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
                          <th scope="col">สิทธิ์ผู้ใช้งาน</th>
                          <th scope="col">วันที่สร้าง</th>
                          <th scope="col">วันที่อัปเดต</th>
                          <th scope="col">จัดการ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="text-center py-4">
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
                              <td>{user.user_role}                                
                              </td>
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