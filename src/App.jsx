import React from 'react';
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout';
import Home from "./pages/Home";
import CameraPage from './components/Camera/Camera';
import EvidenceBasicInform from './pages/EvidenceBasicInform';
import Login from './pages/Login';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route element={<Layout />}>
        <Route path="/home" element={<Home />} />
      </Route>
      <Route path="/evidenceBasicInform/*" element={<EvidenceBasicInform />} />
      <Route path="/camera" element={<CameraPage />} />
    </Routes>
  );
};

export default App;