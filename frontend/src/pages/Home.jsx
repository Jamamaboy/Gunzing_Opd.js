import { useAuth } from '../context/AuthContext';
import SuperAdminHome from '../components/Home/SuperAdminHome';
import FirearmAdminHome from '../components/Home/FirearmAdminHome';
import NarcoticsAdminHome from '../components/Home/NarcoticsAdminHome';
import UserHome from '../components/Home/UserHome';

const Home = () => {
  const { user } = useAuth();

  if (user?.role.id === 1) {
    return <SuperAdminHome />;
  }
  if (user?.role.id === 2) {
    if (user.department === "กลุ่มงานอาวุธปืน") return <FirearmAdminHome />;
    else if (user?.department === "กลุ่มงานยาเสพติด") return <NarcoticsAdminHome />;
  }
  if (user?.role.id === 3) {
    return <UserHome />;
  }
  return <div>ไม่มีสิทธิ์เข้าถึง</div>;
};

export default Home;