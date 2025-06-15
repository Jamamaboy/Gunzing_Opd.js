import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCamera, FaImage, FaTrash, FaUpload } from 'react-icons/fa';
import { FiPlus } from 'react-icons/fi';
import apiConfig from '../../../config/api';

const DesktopLayout = ({ formData, handleChange, handleSubmit, handleCancel, roles, loading, handleImageChange, handleRemoveImage, profilePreview }) => {
  const [showImageMenu, setShowImageMenu] = useState(false);
  
  return (
  <div className="h-full flex flex-col">
    <div className="px-6 py-4 flex justify-between items-center flex-shrink-0">
      <h1 className="text-xl font-bold">เพิ่มผู้ใช้ใหม่</h1>
    </div>
    <div className="flex flex-1 items-center justify-center">
      <div className="max-w-4xl w-full bg-white rounded-lg shadow p-6 mb-16">
        <h2 className="text-lg font-medium mb-6">กรอกข้อมูล</h2>
        
        {/* Add profile image upload */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div 
              className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border border-gray-300"
            >
              {profilePreview ? (
                <img 
                  src={profilePreview} 
                  alt="Profile preview" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <FaImage className="text-gray-400 text-3xl" />
              )}
            </div>
            {/* Image Controls */}
            <div className="absolute bottom-0 right-0">
              <div className="relative">
                <button 
                  type="button"
                  onClick={() => setShowImageMenu(!showImageMenu)}
                  className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white"
                >
                  <FiPlus className="text-lg" />
                </button>
                
                {/* Image Menu Dropdown */}
                {showImageMenu && (
                  <div className="absolute top-10 right-0 bg-white shadow-lg rounded-md py-1 z-10 w-32">
                    <label className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                      <div className="flex items-center">
                        <FaUpload className="mr-2" size={12} />
                        <span>อัปโหลดรูป</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          handleImageChange(e);
                          setShowImageMenu(false);
                        }}
                      />
                    </label>
                    <label className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                      <div className="flex items-center">
                        <FaCamera className="mr-2" size={12} />
                        <span>ถ่ายรูป</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        capture="user"
                        className="hidden"
                        onChange={(e) => {
                          handleImageChange(e);
                          setShowImageMenu(false);
                        }}
                      />
                    </label>
                    {profilePreview && (
                      <button
                        type="button"
                        onClick={() => {
                          handleRemoveImage();
                          setShowImageMenu(false);
                        }}
                        className="w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 text-left"
                      >
                        <div className="flex items-center">
                          <FaTrash className="mr-2" size={12} />
                          <span>ลบรูปโปรไฟล์</span>
                        </div>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center">
            <label className="w-32 text-sm">คำนำหน้าชื่อ:</label>
            <div className="w-72 relative">
              <select 
                name="title"
                className="w-full border rounded px-3 py-2 appearance-none bg-white"
                value={formData.title}
                onChange={handleChange}
              >
                <option value="">เลือกคำนำหน้าชื่อ</option>
                <option value="นาย">นาย</option>
                <option value="นาง">นาง</option>
                <option value="นางสาว">นางสาว</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="w-1/2 flex items-center">
              <label className="w-32 text-sm">ชื่อจริง:</label>
              <input
                type="text"
                name="firstName"
                placeholder="ระบุชื่อจริง"
                className="flex-1 border rounded px-3 py-2"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>
            <div className="w-1/2 flex items-center">
              <label className="w-32 text-sm">นามสกุล:</label>
              <input
                type="text"
                name="lastName"
                placeholder="ระบุนามสกุล"
                className="flex-1 border rounded px-3 py-2"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="w-1/2 flex items-center">
              <label className="w-32 text-sm">อีเมล:</label>
              <input
                type="email"
                name="email"
                placeholder="ระบุอีเมล"
                className="flex-1 border rounded px-3 py-2"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="w-1/2 flex items-center">
              <label className="w-32 text-sm">รหัสผ่าน:</label>
              <input
                type="password"
                name="password"
                placeholder="ระบุรหัสผ่าน"
                className="flex-1 border rounded px-3 py-2"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="w-1/2 flex items-center">
              <label className="w-32 text-sm">ตำแหน่ง:</label>
              <div className="flex-1 relative">     
                <select
                  name="roleId"
                  className="w-full border rounded px-3 py-2 appearance-none text-black"
                  value={formData.roleId}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="">เลือกตำแหน่ง</option>
                  {roles.map(role => (
                    <option className='text-black' key={role.id} value={role.id}>{role.role_name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="w-1/2 flex items-center">
              <label className="w-32 text-sm">ประเภทผู้ใช้:</label>
              <div className="flex-1 relative">
                <select 
                  name="position"
                  className="w-full border rounded px-3 py-2 appearance-none bg-white"
                  value={formData.position}
                  onChange={handleChange}
                >
                  <option value="">เลือกประเภท</option>
                  <option value="เจ้าหน้าที่หน้างาน">เจ้าหน้าที่หน้างาน</option>
                  <option value="กลุ่มงานอาวุธปืน">กลุ่มงานอาวุธปืน</option>
                  <option value="กลุ่มงานยาเสพติด">กลุ่มงานยาเสพติด</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <button 
              type="button" 
              className="px-6 py-2 border border-red-500 text-red-500 rounded"
              onClick={handleCancel}
            >
              ยกเลิก
            </button>
            <button 
              type="submit" 
              className="px-6 py-2 bg-green-500 text-white rounded"
            >
              ยืนยัน
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  )
}

const MobileLayout = ({ formData, handleChange, handleSubmit, handleCancel, roles, loading, handleImageChange, handleRemoveImage, profilePreview }) => {
  const [showImageMenu, setShowImageMenu] = useState(false);
  
  return (
  <div className="h-full flex flex-col">
    <div className="flex justify-between items-center flex-shrink-0 px-6 py-3 border-b-2 bg-white">
      <h1 className="text-lg font-bold">เพิ่มผู้ใช้ใหม่</h1>
    </div>
    <div className="flex-1 flex flex-col items-center justify-center bg-white">
      {/* Add profile image upload */}
      <div className="w-full py-4 flex justify-center">
        <div className="relative">
          <div 
            className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border border-gray-300"
          >
            {profilePreview ? (
              <img 
                src={profilePreview} 
                alt="Profile preview" 
                className="w-full h-full object-cover"
              />
            ) : (
              <FaImage className="text-gray-400 text-3xl" />
            )}
          </div>
          <div className="absolute bottom-0 right-0">
            <div className="relative">
              <button 
                type="button"
                onClick={() => setShowImageMenu(!showImageMenu)}
                className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white"
              >
                <FiPlus className="text-lg" />
              </button>
              
              {/* Image Menu Dropdown */}
              {showImageMenu && (
                <div className="absolute top-10 right-0 bg-white shadow-lg rounded-md py-1 z-10 w-36">
                  <label className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                    <div className="flex items-center">
                      <FaUpload className="mr-2" size={14} />
                      <span>อัปโหลดรูป</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        handleImageChange(e);
                        setShowImageMenu(false);
                      }}
                    />
                  </label>
                  <label className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                    <div className="flex items-center">
                      <FaCamera className="mr-2" size={14} />
                      <span>ถ่ายรูป</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      capture="user"
                      className="hidden"
                      onChange={(e) => {
                        handleImageChange(e);
                        setShowImageMenu(false);
                      }}
                    />
                  </label>
                  {profilePreview && (
                    <button
                      type="button"
                      onClick={() => {
                        handleRemoveImage();
                        setShowImageMenu(false);
                      }}
                      className="w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 text-left"
                    >
                      <div className="flex items-center">
                        <FaTrash className="mr-2" size={14} />
                        <span>ลบรูปโปรไฟล์</span>
                      </div>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="w-full h-full max-w-md p-4 space-y-4">
        <div>
          <label className="block text-sm mb-1">คำนำหน้าชื่อ</label>
          <select
            name="title"
            className="w-full border rounded px-3 py-2 bg-white"
            value={formData.title}
            onChange={handleChange}
          >
            <option value="">เลือกคำนำหน้าชื่อ</option>
            <option value="นาย">นาย</option>
            <option value="นาง">นาง</option>
            <option value="นางสาว">นางสาว</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">ชื่อจริง</label>
          <input
            type="text"
            name="firstName"
            placeholder="ระบุชื่อจริง"
            className="w-full border rounded px-3 py-2"
            value={formData.firstName}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">นามสกุล</label>
          <input
            type="text"
            name="lastName"
            placeholder="ระบุนามสกุล"
            className="w-full border rounded px-3 py-2"
            value={formData.lastName}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">อีเมล</label>
          <input
            type="email"
            name="email"
            placeholder="ระบุอีเมล"
            className="w-full border rounded px-3 py-2"
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">รหัสผ่าน</label>
          <input
            type="password"
            name="password"
            placeholder="ระบุรหัสผ่าน"
            className="w-full border rounded px-3 py-2"
            value={formData.password}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">ตำแหน่ง</label>
          <select
            name="roleId"
            className="w-full border rounded px-3 py-2 appearance-none bg-white"
            value={formData.roleId}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="">เลือกตำแหน่ง</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>{role.role_name}</option>
              ))}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">ประเภทผู้ใช้</label>
          <select
            name="position"
            className="w-full border rounded px-3 py-2 bg-white"
            value={formData.position}
            onChange={handleChange}
          >
            <option value="">เลือกประเภทผู้ใช้</option>
            <option value="เจ้าหน้าที่หน้างาน">เจ้าหน้าที่หน้างาน</option>
            <option value="กลุ่มงานอาวุธปืน">กลุ่มงานอาวุธปืน</option>
            <option value="กลุ่มงานยาเสพติด">กลุ่มงานยาเสพติด</option>
          </select>
        </div>
        <div className="flex justify-end space-x-2 pt-2">
          <button
            type="button"
            className="px-4 py-2 border border-red-500 text-red-500 rounded text-sm"
            onClick={handleCancel}
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded text-sm"
          >
            ยืนยัน
          </button>
        </div>
      </form>
    </div>
  </div>
  )
}

const CreateUser = () => {
  const [formData, setFormData] = useState({
    idNumber: '',
    title: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    position: '',
    roleId: '',
  })
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [profileImage, setProfileImage] = useState(null)
  const [profilePreview, setProfilePreview] = useState(null)
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const API_PATH = '/api'

  useEffect(() => {
    // โหลด Role จาก API
    fetch(`${apiConfig.baseUrl}${API_PATH}/roles`)
      .then(res => res.json())
      .then(data => {
        setRoles(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // ใช้ useCallback เพื่อป้องกัน function สร้างใหม่ทุกครั้งที่ render
  const handleChange = React.useCallback((e) => {
    const { name, value } = e.target
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }))
  }, [])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setProfileImage(file)
      const reader = new FileReader()
      reader.onload = () => setProfilePreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setProfileImage(null)
    setProfilePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = React.useCallback(async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      // First, create FormData to handle file upload
      const formDataObj = new FormData()
      formDataObj.append('title', formData.title)
      formDataObj.append('firstname', formData.firstName)
      formDataObj.append('lastname', formData.lastName)
      formDataObj.append('email', formData.email)
      formDataObj.append('password', formData.password)
      formDataObj.append('role_id', formData.roleId)
      formDataObj.append('department', formData.position || '')
      
      if (profileImage) {
        formDataObj.append('profile_image', profileImage)
      }

      // Create user with profile image
      const res = await fetch(`${apiConfig.baseUrl}${API_PATH}/users/create`, {
        method: 'POST',
        body: formDataObj
      })
      
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.detail || data.message || 'เกิดข้อผิดพลาด')
      
      setSuccess('สร้างผู้ใช้สำเร็จ')
      setFormData({
        title: '',
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        department: '',
        roleId: '',
      })
      setProfileImage(null)
      setProfilePreview(null)
      
      // Navigate back after 2 seconds
      setTimeout(() => navigate('/userManagementTable'), 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [formData, profileImage, navigate])

  const handleCancel = () => {
    navigate(-1)
  }

  const layoutProps = useMemo(() => ({
    formData,
    handleChange,
    handleSubmit,
    handleCancel,
    roles,
    loading,
    handleImageChange,
    handleRemoveImage,
    profilePreview
  }), [formData, handleChange, handleSubmit, handleCancel, roles, loading, profilePreview])

  return (
    <div className="flex-1 overflow-auto h-full w-full">
      <div className="h-full w-full bg-gray-50 flex flex-col">
        <div className="hidden md:flex h-full flex-col">
          <DesktopLayout {...layoutProps} />
        </div>
        <div className="block md:hidden w-full h-full">
          <MobileLayout {...layoutProps} />
        </div>
        {error && <div className="text-red-500 p-2 text-center">{error}</div>}
        {success && <div className="text-green-500 p-2 text-center">{success}</div>}
      </div>
    </div>
  )
}

export default CreateUser