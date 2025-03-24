import { FaGun } from "react-icons/fa6";
import { GiPill } from "react-icons/gi";

export default function Content() {
  const items = [
    { id: 1, icon: <FaGun size={40} className="text-red-800" />, label: "อาวุธปืน" },
    { id: 2, icon: <GiPill size={40} className="text-red-800" />, label: "ยาเสพติด" },
  ];

  const handleClick = (label) => {
    alert(`คุณเลือก: ${label}`);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-6 p-4 overflow-hidden">
      <h1 className="text-xl font-bold">รายการวัตถุพยาน</h1>
      <div className="flex flex-col items-center gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => handleClick(item.label)}
            className="w-40 h-40 flex items-center justify-center border border-red-800 cursor-pointer hover:shadow-2xl transition duration-300 ease-in-out rounded-lg"
          >
            <div className="flex flex-col items-center justify-center gap-2 p-4">
              {item.icon}
              <span className="text-red-800 font-medium">{item.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
