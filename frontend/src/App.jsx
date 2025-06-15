import React from 'react';
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout';
import Layout2 from './components/Layout2';
import Layout3 from './components/Layout3';
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
import EvidenceHistoryProfile from './pages/EvidenceHistoryProfile';
import CreateUser from './pages/admin/super admin/CreateUser';
import UserManagementTable from './pages/admin/super admin/UserManagementTable';
import UserProfile from './pages/admin/super admin/UserProfile';
import EditUserProfile from './pages/admin/super admin/EditUserProfile';
import EditGunHistoryProfile from './components/History/EditGunHistoryProfile';
import CandidateShow from './components/Camera/CandidateShow';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import SessionGuard from './components/SessionGuard';
import { SessionProvider } from './context/SessionContext';
import CreateGun from './pages/admin/firearm department/CreateGun';
import GunCatalogAdmin from './components/EvidenceCatalog/Admin/Firearms Department/GunCatalogAdmin';
import UnknownClassTable from './components/History/Admin/Firearm Department/UnknownClassTable';
import CreateNarcotic from './pages/admin/narcotic department/CreateNarcotic';
import Upload_Csv_File from './pages/admin/narcotic department/Upload_Csv_File';
import LabelGun from './pages/admin/firearm department/LabelGun';
import AdminGunCatalog from './components/EvidenceCatalog/Admin/Firearms Department/AdminGunCatalog';
import EditGun from './pages/admin/firearm department/EditGun';
import DrugCasesList from './pages/admin/narcotic department/DrugCasesList';
import EditNarcoticHistory from './components/History/Admin/Narcotic Department/EditNarcoticHistory';
import AdminNarcoticCatalog from './components/EvidenceCatalog/Admin/Narcotic Department/AdminNarcoticCatalog';
import EditNarcoticCatalog from './pages/admin/narcotic department/EditNarcoticCatalog';

const App = () => {
  return (
    <SessionProvider>
      <Routes>
        {/* None Layout */}
        <Route path='/login' element={<Login />} />
        <Route path='/camera' element={
          <ProtectedRoute>
            <CameraPage />
          </ProtectedRoute>
        } />
        <Route path='/imagePreview' element={
          <ProtectedRoute>
            <ImagePreview />
          </ProtectedRoute>
        }/>
        <Route path="/candidateShow" element={
          <ProtectedRoute>
            <SessionGuard path="/candidateShow">
              <CandidateShow />
            </SessionGuard>
          </ProtectedRoute>
        } />

        {/* Layout */}
        <Route element={
          <ProtectedRoute allowedRoles={[1, 2, 3]}>
            <Layout />
          </ProtectedRoute>
        }>
          <Route path='/home' element={<Home />} />
          <Route path='/admin/narcotics/case' element={<DrugCasesList />} />
        </Route>

        {/* Layout 2 */}
        <Route element={
          <ProtectedRoute>
            <Layout2 />
          </ProtectedRoute>
        }>
          {/* Super Admin Pages */}
          <Route path='/createUser' element={<CreateUser />} />
          <Route path='/userManagementTable' element={<UserManagementTable />} />
          <Route path='/user-profile/:id' element={<UserProfile />} />
          <Route path='/edit-user/:id' element={<EditUserProfile />} />

          {/* Firearm Admin Pages */}
          <Route path='/admin/guns/catalog-management' element={<AdminGunCatalog />} />
          <Route path='/admin/narcotics/catalog-management' element={<AdminNarcoticCatalog />} />
          <Route path='/admin/narcotics/edit-narcotic-profile/:id' element={<EditNarcoticCatalog />} />

          {/* Select Catalog Type */}
          <Route path='/selectCatalogType/' element={<SelectCatalogType />} />
          <Route path='/selectCatalogType/guns-catalog'element={<GunCatalog />} />
          <Route path='/selectCatalogType/guns-catalog/gun-profile/:id' element={<GunProfile />} />
          <Route path='/selectCatalogType/drugs-catalog' element={<DrugCatalog />} />
          <Route path='/selectCatalogType/drugs-catalog/drug-profile/:id' element={<DrugProfile />} />

          {/* Firearm Admin */}
          <Route path='/admin/guns/catalog' element={<GunCatalogAdmin />} />
          <Route path='/admin/guns/create-gun' element={<CreateGun />} />
          <Route path='/admin/guns/unknown-class-table' element={<UnknownClassTable />} />

          {/* Narcotic Admin */}
          <Route path='/admin/narcotics/create-narcotic' element={<CreateNarcotic />} />
          <Route path='/admin/narcotics/upload-narcotic-case' element={<Upload_Csv_File />} />

          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* History */}
          <Route path='/history' element={<History />} />
        </Route>

        {/* Layout 2 */}
        <Route element={
          <ProtectedRoute allowedRoles={[1]}>
            <Layout2 />
          </ProtectedRoute>
        }>
          {/* Super Admin Pages */}
          <Route path='/createUser' element={<CreateUser />} />
          <Route path='/userManagementTable' element={<UserManagementTable />} />
          <Route path='/user-profile/:id' element={<UserProfile />} />
          <Route path='/edit-user/:id' element={<EditUserProfile />} />
        </Route>

        <Route element={
          <ProtectedRoute>
            <Layout3 />
          </ProtectedRoute>
        }>
          {/* Evidence Profile */}
          <Route path='/evidenceProfile' element={
            <SessionGuard path="/evidenceProfile">
              <EvidenceProfile />
            </SessionGuard>
          } />
          <Route path='/evidenceProfile/gallery' element={
            <SessionGuard path="/evidenceProfile/gallery">
              <EvidenceProfile />
            </SessionGuard>
          } />
          <Route path='/evidenceProfile/save-to-record' element={
            <SessionGuard path="/evidenceProfile/save-to-record">
              <SaveToHistory />
            </SessionGuard>
          } />
          <Route path='/evidenceProfile/history' element={
            <SessionGuard path="/evidenceProfile/history">
              <EvidenceProfile />
            </SessionGuard>
          } />
          <Route path='/evidenceProfile/map' element={
            <SessionGuard path="/evidenceProfile/map">
              <EvidenceProfile />
            </SessionGuard>
          } />

          {/* History */}
          <Route path='/history/detail' element={<EvidenceHistoryProfile />} />
          <Route path='/history/edit/:id' element={<EditGunHistoryProfile />} />
          <Route path='/history/edit-narcotic/:id' element={<EditNarcoticHistory />} />

          {/* Gun Catalog */}

          <Route path='/map' element={<Map />} />
          <Route path='/admin/guns/label-gun' element={<LabelGun />} />
          <Route path='/admin/guns/edit-gun-proile/:gunId' element={<EditGun />} />
        </Route>
      </Routes>
    </SessionProvider>
  );
};

export default App;