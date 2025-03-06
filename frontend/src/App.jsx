import React from 'react';
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout';
import Home from "./pages/Home";
import CameraPage from './components/Camera/Camera';
import ImagePreview from './components/Camera/ImagePreview';
import Login from './pages/Login';
import EvidenceProfile from './pages/EvidenceProfile';

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Layout />}>
        <Route path="/home" element={<Home />} />
      </Route>
      <Route path="/camera" element={<CameraPage />} />
      <Route path='/imagePreview' element={<ImagePreview />}/>
      <Route path="/evidenceProfile/*" element={<EvidenceProfile />} />
    </Routes>
  );
};

export default App;