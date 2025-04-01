import { useState } from "react";
import { FaShareSquare } from "react-icons/fa";

const drugData = {
  name: "WY",
  details: [
    { label: "กลุ่มยา(G)", value: "xxxxxxxx" },
    { label: "แหล่งผลิต", value: "xxxxxxxx" },
    { label: "หน่วย", value: "xxxxxxx" },
    { label: "สีของยา", value: "แดง" },
    { label: "เส้นผ่าศูนย์กลาง (มม.)", value: "xxxxxxx" },
    { label: "หนา (มม.)", value: "xxxxxx" },
    { label: "ขอบ (มม.)", value: "xxxxx" },
    { label: "น้ำหนักต่อเม็ด (มก.)", value: "xxxxxxx" },
  ],
  image: "/images/DrugCatalog.png",
};

export default function DrugDetail() {
  return (
    <div className="relative flex flex-col md:flex-row items-center p-6 bg-white h-full">
      <div className="absolute left-0 top-0 w-1/3 h-full bg-gradient-to-r from-[#990000] to-[#330000] rounded-r-full z-0 hidden md:block"></div>
      
      <div className="relative md:w-1/2 flex flex-col items-center z-10">
        <img
          src={drugData.image}
          alt="Drug"
          className="relative w-full max-w-md mx-auto object-contain rounded"
        />
      </div>
      
      <div className="md:w-1/3 p-6 text-gray-900 z-10">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-4xl font-bold">{drugData.name}</h1>
          <FaShareSquare className="text-gray-500 cursor-pointer" size={30} />
        </div>
        <div className="mt-4">
          {drugData.details.map((item, index) => (
            <p key={index} className="text-black mt-1">
              <span className="font-semibold">{item.label}:</span> {item.value}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
