import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import CameraPage from "./components/Camera/Camera";
import EvidenceBasicInform from "./pages/EvidenceBasicInform";
import History from "./components/History/History"; // ✅ ตรวจสอบ Path ให้ถูกต้อง

const App = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/history" element={<History />} /> {/* ✅ ตรวจสอบว่ามีอยู่ */}
      </Route>
      <Route path="/evidenceBasicInform/*" element={<EvidenceBasicInform />} />
      <Route path="/camera" element={<CameraPage />} />
    </Routes>
  );
};

export default App;
