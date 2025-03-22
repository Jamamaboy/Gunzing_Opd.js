import React from 'react';
import { Routes, Route } from 'react-router-dom'
import CameraPage from './components/Camera/Camera';
import ImagePreview from './components/Camera/ImagePreview';
import EvidenceProfile from './pages/EvidenceProfile';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<CameraPage />} />
      <Route path='/imagePreview' element={<ImagePreview />}/>
      <Route path="/evidenceProfile/*" element={<EvidenceProfile />} />
    </Routes>
  );
};

export default App;