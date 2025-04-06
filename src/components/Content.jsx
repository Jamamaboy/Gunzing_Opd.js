import React, { useState } from "react";
import { FaArrowCircleLeft } from 'react-icons/fa';

const Content = () => {
  const [password, setPassword] = useState("");

  const userInfo = {
    name: "ด.ต. สมชาย ใจดี",
    role: "admin",
    department: "แผนกยาเสพติด",
    userId: "admin001",
    image: "/images/profile.png",
  };

  const generatePassword = () => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$";
    let newPassword = "";
    for (let i = 0; i < 8; i++) {
      newPassword += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setPassword(newPassword);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(password);
  };

  const goBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-full bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md relative">

        {/* 🔙 Icon ย้อนกลับ */}
        <button
          onClick={goBack}
          className="absolute top-4 left-4 text-gray-500 hover:text-red-700"
          title="ย้อนกลับ"
        >
          <FaArrowCircleLeft  size={22} />
        </button>


        <h1 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          สุ่มรหัสผ่านให้ผู้ใช้งาน
        </h1>

        {/* 🔹 ข้อมูลผู้ใช้ */}
        <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-start gap-4">
          <img
            src={userInfo.image}
            alt="User"
            className="w-20 h-20 object-cover rounded-lg border"
          />
          <div className="flex-1">
            <div className="mb-2">
              <span className="font-semibold text-gray-700">ชื่อ:</span>{" "}
              {userInfo.name}
            </div>
            <div className="mb-2">
              <span className="font-semibold text-gray-700">ตำแหน่ง:</span>{" "}
              {userInfo.role}
            </div>
            <div className="mb-2">
              <span className="font-semibold text-gray-700">ประเภทการใช้งาน:</span>{" "}
              {userInfo.department}
            </div>
            <div>
              <span className="font-semibold text-gray-700">User ID:</span>{" "}
              {userInfo.userId}
            </div>
          </div>
        </div>

        {/* 🔐 กล่องรหัสผ่าน */}
        <div className="mb-6">
          <label className="block text-gray-600 text-sm mb-2">รหัสผ่านที่สุ่มได้</label>
          <div className="flex items-center bg-gray-100 rounded-lg px-4 py-2 justify-between">
            <span className="text-gray-800 break-all">{password || "—"}</span>
            {password && (
              <button
                onClick={copyToClipboard}
                className="text-blue-500 font-medium hover:underline ml-4"
              >
                คัดลอก
              </button>
            )}
          </div>
        </div>

        <button
          onClick={generatePassword}
          className="w-full bg-red-700 text-white font-semibold py-2 rounded-xl hover:bg-red-900 transition"
        >
          สุ่มรหัสผ่านใหม่
        </button>
      </div>
    </div>
  );
};

export default Content;
