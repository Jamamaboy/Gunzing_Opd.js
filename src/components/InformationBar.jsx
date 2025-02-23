import { Link, useLocation } from "react-router-dom";

function InformationBar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="border-b bg-white p-4 flex justify-center space-x-4 text-gray-700">
      {[
        { path: "/", label: "ข้อมูลอาวุธ" },
        { path: "/images", label: "คลังภาพ" },
        { path: "/bullets", label: "กระสุน" },
        { path: "/history", label: "ประวัติ" },
        { path: "/map", label: "แผนที่" },
      ].map(({ path, label }) => (
        <Link
          key={path}
          to={path}
          className={`w-36 text-center pb-2 transition-all ${
            isActive(path) ? "border-b-2 border-red-800 font-semibold" : ""
          }`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}

export default InformationBar;
