import React from 'react';
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout';
import Home from "./pages/Home";
import CameraPage from './components/Camera/Camera';
import EvidenceBasicInform from './pages/EvidenceBasicInform';

const App = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
      </Route>
      <Route path="/evidenceBasicInform/*" element={<EvidenceBasicInform />} />
      <Route path="/camera" element={<CameraPage />} />
    </Routes>
  );
};

export default App;