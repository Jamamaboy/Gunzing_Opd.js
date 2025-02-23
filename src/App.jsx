import React from 'react';
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout';
import Content from "./components/Content";
import CameraPage from './components/Camera';

const App = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Content />} />
      </Route>
      <Route path="/camera" element={<CameraPage />} />
    </Routes>
  );
};

export default App;