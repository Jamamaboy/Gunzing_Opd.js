import React from 'react';
import { useAuth } from '../hooks/useAuth';
import AdminHistory from '../components/History/SuperAdmin/History';
import UserHistory from '../components/History/User/History';
import FirearmsDepHistory from '../components/History/Admin/Firearm Department/History';
import NarcoticDepHistory from '../components/History/Admin/Narcotic Department/History';

const History = () => {
  const { user } = useAuth();

  console.log(user);
  

  if (user?.role.id === 1) {
    return <AdminHistory />;
  }
  if (user?.role.id === 2) {
    if (user?.department === "กลุ่มงานอาวุธปืน") return <FirearmsDepHistory />;
    if (user?.department === "กลุ่มงานยาเสพติด") return <NarcoticDepHistory />;
  }
  if (user?.role.id === 3) {
    return <UserHistory />;
  }
  return <div>ไม่มีสิทธิ์เข้าถึง</div>;
};

export default History;
