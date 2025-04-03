import React from 'react';
import { Routes, Route } from 'react-router-dom'
import EvidenceProfile from './pages/EvidenceProfile';

const App = () => {
  return (
    <Routes>
      <Route path="/*" element={<EvidenceProfile />} />
    </Routes>
  );
};

export default App;