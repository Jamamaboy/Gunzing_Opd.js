import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ImagePreview from './components/Camera/ImagePreview';

// Create a simple Home component if you don't have one
const Home = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">หน้าหลัก</h1>
      <p>ยินดีต้อนรับสู่ระบบตรวจจับวัตถุ</p>
    </div>
  );
};

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/home" replace />} />
        <Route path="home" element={<Home />} />
        <Route path="imagePreview" element={<ImagePreview />} />
        {/* Add a catch-all route to redirect to home */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Route>
    </Routes>
  );
};

export default App;
