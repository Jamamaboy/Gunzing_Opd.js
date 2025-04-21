import { useState } from "react";
import DownloadButton from "./DownloadButton";

const allCalibers = ["9 มม.", "38", "39", "40", "41"];

const gunData = [
  {
    id: 1,
    code: "CZ-75C-TH01",
    brand: "CZ",
    manufacturer: "CZ(สาธารณรัฐเช็ค)",
    model: "75 COMPACT",
    series: "COMPACT Series",
    type: "ปืนพก",
    calibers: ["39"],
    magazineCapacity: "15 นัด",
    serialImage: "/images/NumberGun.jpg",
    images: ["/images/gun1.png", "/images/gun2.png"]
  }
];

export default function GunDetail() {
  const [selectedGun, setSelectedGun] = useState(gunData[0]);
  const [selectedImage, setSelectedImage] = useState(selectedGun.images[0]);

  return (
    <div id="capture-area" className="relative flex flex-col md:flex-row items-center p-6 bg-white h-full">
      {/* Half Circle Background */}
      <div className="absolute left-0 top-0 w-1/3 h-full bg-gradient-to-r from-[#990000] to-[#330000] rounded-r-full z-0 hidden md:block"></div>

      {/* Left Section - Gun Images */}
      <div className="relative md:w-1/2 flex flex-col items-center z-10">
        <img
          src={selectedImage}
          alt="Gun"
          className="relative w-full max-w-md mx-auto object-contain rounded"
        />
        <div className="flex gap-2 mt-4 justify-center">
          {selectedGun.images.map((img, index) => (
            <button
              key={index}
              className={`w-16 h-16 border-4 rounded ${
                selectedImage === img ? "border-red-500" : "border-white"
              }`}
              onClick={() => setSelectedImage(img)}
            >
              <img src={img} alt="Thumbnail" className="w-full h-full object-cover bg-white" />
            </button>
          ))}
        </div>
      </div>

      {/* Right Section - Gun Details */}
      <div className="md:w-1/3 p-6 text-gray-900 z-10">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">{selectedGun.brand}</h2>
          <DownloadButton />
        </div>
        <h1 className="text-4xl font-bold mt-2">{selectedGun.model}</h1>
        <p className="text-gray-600 mt-1">รหัสปืน: {selectedGun.code}</p>
        <p className="text-gray-600 mt-1">ผู้ผลิต: {selectedGun.manufacturer}</p>
        <p className="text-gray-600 mt-1">ซีรี่ย์: {selectedGun.series}</p>
        <p className="text-gray-600 mt-1">ประเภท: {selectedGun.type}</p>
        <p className="text-gray-600 mt-1">ความจุซองกระสุน: {selectedGun.magazineCapacity}</p>

        <h3 className="font-semibold mt-4">กระสุนที่ใช้ร่วมกัน</h3>
        <div className="flex gap-2 mt-2 flex-wrap">
          {allCalibers.map((caliber, index) => (
            <button
              key={index}
              className={`px-4 py-2 border rounded-lg ${
                selectedGun.calibers.includes(caliber)
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {caliber}
            </button>
          ))}
        </div>

        {/* Serial Number Location Image */}
        <div className="mt-6">
          <h4 className="font-semibold mb-2">ตำแหน่งหมายเลขประจำปืน</h4>
          <p className="text-gray-700 text-sm mb-2">
            มักอยู่ที่โครงปืนด้านหน้าเหนือโกร่งไก 
          </p>
          <img
            src={selectedGun.serialImage}
            alt="ตำแหน่งหมายเลขประจำปืน"
            className="w-full max-w-sm rounded border"
          />
        </div>
      </div>
    </div>
  );
}
