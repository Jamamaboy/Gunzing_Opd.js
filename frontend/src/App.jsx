import React from 'react';
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout';
import Layout2 from './components/Layout2';
import Home from "./pages/Home";
import CameraPage from './components/Camera/Camera';
import ImagePreview from './components/Camera/ImagePreview';
import Login from './pages/Login';
import EvidenceProfile from './pages/EvidenceProfile';
import SaveToHistory from './pages/SaveToHistory';
import Map from './pages/Map';
import History from './pages/History';
import SelectCatalogType from './pages/SelectCatalogType';
import GunCatalog from './components/EvidenceCatalog/GunCatalog';
import GunProfile from './components/EvidenceCatalog/GunProfile';
import DrugCatalog from './components/EvidenceCatalog/DrugCatalog';
import DrugProfile from './components/EvidenceCatalog/DrugProfile';
import HistoryTab from './components/EvidenceProfile/HistoryTab';
import Account from './pages/Account';

const App = () => {
  return (
    <Routes>
      {/* None Layout */}
      <Route path='/login' element={<Login />} />
      <Route path='/camera' element={<CameraPage />} />
      <Route path='/imagePreview' element={<ImagePreview />}/>

      {/* Layout */}
      <Route element={<Layout />}>
        <Route path='/home' element={<Home />} />
        <Route path='/map' element={<Map />} />
        <Route path="/account" element={<Account />} />
      </Route>

      {/* Layout 2 */}
      <Route element={<Layout2 />}>
        {/* Evidence Profile */}
        <Route path='/evidenceProfile' element={<EvidenceProfile />} />
        <Route path='/evidenceProfile/gallery' element={<EvidenceProfile />} />
        <Route path='/evidenceProfile/save-to-record' element={<SaveToHistory />} />
        <Route path='/evidenceProfile/history/:name' element={<EvidenceProfile />} />
        <Route path="/evidenceProfile/history" element={<HistoryTab />} />



        {/* Select Catalog Type */}
        <Route path='/selectCatalogType/' element={<SelectCatalogType />} />
        <Route path='/selectCatalogType/guns-catalog'element={<GunCatalog />} />
        <Route path='/selectCatalogType/guns-catalog/gun-profile/:id' element={<GunProfile />} />
        <Route path='/selectCatalogType/drugs-catalog' element={<DrugCatalog />} />
        <Route path='/selectCatalogType/drugs-catalog/drug-profile/:id' element={<DrugProfile />} />

        {/* History */}
        <Route path='/history' element={<History />} />
      </Route>
    </Routes>
  );
};

export default App;