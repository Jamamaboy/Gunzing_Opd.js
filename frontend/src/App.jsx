import React from 'react';
import { Routes, Route } from 'react-router-dom'
import Layout2 from './components/Layout2';
import SelectCatalogType from './pages/SelectCatalogType';
import GunCatalog from './components/EvidenceCatalog/GunCatalog';
import GunProfile from './components/EvidenceCatalog/GunProfile';
import DrugCatalog from './components/EvidenceCatalog/DrugCatalog';
import DrugProfile from './components/EvidenceCatalog/DrugProfile';

const App = () => {
  return (
    <Routes>
      {/* Layout 2 */}
      <Route element={<Layout2 />}>
        {/* Select Catalog Type */}
        <Route path='/selectCatalogType/' element={<SelectCatalogType />} />
        <Route path='/selectCatalogType/guns-catalog'element={<GunCatalog />} />
        <Route path='/selectCatalogType/guns-catalog/gun-profile/:id' element={<GunProfile />} />
        <Route path='/selectCatalogType/drugs-catalog' element={<DrugCatalog />} />
        <Route path='/selectCatalogType/drugs-catalog/drug-profile/:id' element={<DrugProfile />} />
      </Route>
    </Routes>
  );
};

export default App;