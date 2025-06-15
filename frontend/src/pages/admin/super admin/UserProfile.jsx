import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiConfig from '../../../config/api';

const DesktopLayout = ({ user }) => {
  const navigate = useNavigate();
  const initial = user?.firstname ? user.firstname[0].toUpperCase() : '';
  const [fullScreen, setFullScreen] = useState(false);
  const hasProfileImage = !!user?.profile_image_url;

  return (
    <>
      <div className="h-full flex flex-col">
        <div className="px-6 py-4 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center mb-4">
            <div className="bg-gray-100 p-2 rounded-md mr-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20 21C20 18.8783 19.1571 16.8434 17.6569 15.3431C16.1566 13.8429 14.1217 13 12 13C9.87827 13 7.84344 13.8429 6.34315 15.3431C4.84285 16.8434 4 18.8783 4 21" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="text-base font-medium text-gray-800">โปรไฟล์</h1>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="max-w-4xl w-full bg-white rounded-lg shadow p-6 mb-24">
            <div className="p-4">
              <div className="flex items-center pb-4 border-b border-gray-200 mb-4">
                <div className="mr-4 relative">
                  {/* วงกลมโปรไฟล์ */}
                  {hasProfileImage ? (
                    <>
                      <img
                        src={user.profile_image_url}
                        alt="profile"
                        className="w-16 h-16 rounded-full object-cover border cursor-pointer"
                        onClick={() => setFullScreen(true)}
                        title="คลิกเพื่อดูรูปเต็ม"
                      />
                    </>
                  ) : (
                    <div
                      className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-600 border cursor-pointer"
                      onClick={() => setFullScreen(true)}
                      title="คลิกเพื่อดูรูปเต็ม"
                    >
                      {initial}
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-base font-medium text-gray-800">{user?.title} {user?.firstname} {user?.lastname}</h2>
                  <p className="text-gray-500 text-sm">{user?.email}</p>
                </div>
              </div>
              
              <div>
                <h2 className="text-base font-medium text-gray-700 mb-4">ข้อมูล</h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">คำนำหน้าชื่อ</label>
                      <input 
                        type="text" 
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none" 
                        value={user?.title || ''}
                        readOnly
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">ชื่อจริง</label>
                      <input 
                        type="text" 
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none" 
                        value={user?.firstname || ''}
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 mb-1">นามสกุล</label>
                      <input 
                        type="text" 
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none" 
                        value={user?.lastname || ''}
                        readOnly
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">อีเมล์</label>
                      <input 
                        type="email" 
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none" 
                        value={user?.email || ''}
                        readOnly
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 mb-1">รหัสผ่าน</label>
                      <input 
                        type="password"
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none" 
                        value="********"
                        readOnly
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">ระดับผู้ใช้</label>
                      <div className="relative">
                        <select 
                          className="w-full p-2 border border-gray-300 rounded-md appearance-none bg-white focus:outline-none"
                          value={user?.role?.role_name || ''}
                          disabled
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                          <option value="superadmin">Super Admin</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">แผนก</label>
                      <input 
                        type="text" 
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none" 
                        value={user?.department || ''}
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* ปุ่มย้อนกลับมุมขวาล่าง (เฉพาะ DesktopLayout) */}
        <button
          onClick={() => navigate(-1)}
          className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full shadow-lg transition z-50"
        >
          ย้อนกลับ
        </button>
      </div>
      {/* Full Screen Modal */}
      {fullScreen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50">
          {/* ปุ่มปิด Full Screen */}
          <button
            className="absolute top-4 right-4 text-white text-3xl p-2 bg-gray-800 rounded-full"
            onClick={() => setFullScreen(false)}
            aria-label="ปิด"
          >
            &times;
          </button>
          {hasProfileImage ? (
            <img
              src={user.profile_image_url}
              alt="profile-full"
              className="max-w-full max-h-[80vh] object-contain mb-4"
            />
          ) : (
            <div className="w-40 h-40 rounded-full bg-gray-200 flex items-center justify-center text-7xl font-bold text-gray-600 border mb-4">
              {initial}
            </div>
          )}
        </div>
      )}
    </>
  );
};

const MobileLayout = ({ user }) => {
  const navigate = useNavigate();
  const [fullScreen, setFullScreen] = useState(false);
  const initial = user?.firstname ? user.firstname[0].toUpperCase() : '';
  const hasProfileImage = !!user?.profile_image_url;
  const API_PATH = '/api';

  return (
    <div className="bg-white min-h-screen pb-16">
      {/* Header */}
      <div className="bg-white p-4 flex items-center justify-between shadow-sm relative">
        <button 
          onClick={() => navigate(-1)}
          className="text-gray-700 absolute left-4"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <h1 className="text-lg font-medium text-center w-full">โปรไฟล์</h1>
      </div>

      {/* Profile Photo Section */}
      <div className="flex justify-center mt-6 mb-8">
        <div className="relative">
          <div 
            onClick={() => setFullScreen(true)}
            className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center cursor-pointer overflow-hidden"
          >
            {hasProfileImage ? (
              <img 
                src={user.profile_image_url} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-blue-500">{initial}</span>
            )}
          </div>
        </div>
      </div>
      
      {/* User Name and Email */}
      <div className="px-4 mb-4 text-center">
        <h2 className="text-base font-medium text-gray-800">{user?.title} {user?.firstname} {user?.lastname}</h2>
        <p className="text-gray-500 text-sm">{user?.email}</p>
      </div>

      {/* Profile Information */}
      <div className="px-4">
        <div className="bg-white rounded-lg shadow-sm mb-4">
          <div className="p-4 border-b">
            <p className="text-sm text-gray-500">คำนำหน้าชื่อ</p>
            <div className="flex items-center mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 mr-3">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <p className="text-gray-800">{user?.title || ""}</p>
            </div>
          </div>

          <div className="p-4 border-b">
            <p className="text-sm text-gray-500">ชื่อจริง</p>
            <div className="flex items-center mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 mr-3">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <p className="text-gray-800">{user?.firstname || ""}</p>
            </div>
          </div>

          <div className="p-4 border-b">
            <p className="text-sm text-gray-500">นามสกุล</p>
            <div className="flex items-center mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 mr-3">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <p className="text-gray-800">{user?.lastname || ""}</p>
            </div>
          </div>

          <div className="p-4 border-b">
            <p className="text-sm text-gray-500">อีเมล์</p>
            <div className="flex items-center mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 mr-3">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <p className="text-gray-800">{user?.email || ""}</p>
            </div>
          </div>

          <div className="p-4 border-b">
            <p className="text-sm text-gray-500">รหัสผ่าน</p>
            <div className="flex items-center mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 mr-3">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <p className="text-gray-800">********</p>
            </div>
          </div>

          <div className="p-4 border-b">
            <p className="text-sm text-gray-500">ระดับผู้ใช้</p>
            <div className="flex items-center mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 mr-3">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <p className="text-gray-800">{user?.role?.role_name || ""}</p>
            </div>
          </div>

          <div className="p-4">
            <p className="text-sm text-gray-500">แผนก</p>
            <div className="flex items-center mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 mr-3">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
              <p className="text-gray-800">{user?.department || ""}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Full Screen Profile Image Modal */}
      {fullScreen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <button 
            onClick={() => setFullScreen(false)}
            className="absolute top-4 right-4 text-white text-3xl"
          >
            ×
          </button>
          <div className="w-4/5 h-4/5 flex items-center justify-center">
            {hasProfileImage ? (
              <img 
                src={user.profile_image_url} 
                alt="Profile" 
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <div className="w-64 h-64 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-6xl font-bold text-blue-500">{initial}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const UserProfile = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_PATH = '/api';

  useEffect(() => {
    setLoading(true);
    fetch(`${apiConfig.baseUrl}${API_PATH}/users/${id}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch user details');
        }
        return res.json();
      })
      .then(userData => {
        setUser(userData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching user details:', err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="p-8 text-center">กำลังโหลดข้อมูล...</div>;
  if (!user) return <div className="p-8 text-center text-red-500">ไม่พบข้อมูลผู้ใช้</div>;

  return (
    <div className="flex-1 overflow-auto h-full w-full relative">
      <div className="h-full w-full bg-gray-50 flex flex-col">
        <div className="hidden md:flex h-full flex-col">
          <DesktopLayout user={user} />
        </div>
        <div className="md:hidden h-full">
          <MobileLayout user={user} />
        </div>
      </div>
    </div>
  );
};

export default UserProfile;