import React from 'react';
import { Routes, Route } from 'react-router-dom'
import EvidenceCatalog from './pages/EvidenceCatalog';

const App = () => {
  return (
    <Routes>
      <Route path="/evidenceCatalog/*" element={<EvidenceCatalog />} />
    </Routes>
  );
};

export default App;