import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaShareSquare } from 'react-icons/fa';
import { IoChevronBack, IoClose } from 'react-icons/io5';

const drugs = [
  {
    id: 1,
    image: [
      "/Img/ยาเสพติด/หีบห่อ/Lexus.png"
    ],
    title: "Lexus",
    description: "ประเภท: สารผสม",
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
    type: "สารผสม"
  },
  {
    id: 2,
    image: [
      "/Img/ยาเสพติด/หีบห่อ/ม้าลาย.png"
    ],
    title: "ตราหัวม้าลาย",
    description: "ประเภท: โคเคน",
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
    type: "โคเคน"
  },
  {
    id: 3,
    image: [
      "/Img/ยาเสพติด/หีบห่อ/Y1.png"
    ],
    title: "Y1",
    description: "ประเภท: เฮโรอีน",
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
    type: "เฮโรอีน"
  },
  {
    id: 4,
    image: [
      "/Img/ยาเสพติด/หีบห่อ/999_red.png"
    ],
    title: "999 ตราปั้มแดง",
    description: "ประเภท: เคตามีน",
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
    type: "เคตามีน"
  },
  {
    id: 5,
    image: [
      "/Img/ยาเสพติด/หีบห่อ/999_blue.png"
    ],
    title: "999 ตราปั่มน้ำเงิน",
    description: "ประเภท: สารผสม",
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
    type: "สารผสม"
  },
  {
    id: 6,
    image: [
      "/Img/ยาเสพติด/หีบห่อ/Chelsea Football Club.png"
    ],
    title: "เชลซี",
    description: "ประเภท: ยาอี",
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
    type: "ยาอี"
  },
  {
    id: 7,
    image: [
      "/Img/ยาเสพติด/หีบห่อ/Apple 999.png"
    ],
    title: "Apple 999",
    description: "ประเภท: วัตถุออกฤทธิ์อื่นๆ",
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
    type: "วัตถุออกฤทธิ์อื่นๆ"
  },
  {
    id: 8,
    image: [
      "/Img/ยาเสพติด/หีบห่อ/ลิเวอร์พูล.png"
    ],
    title: "ลิเวอร์พูล",
    description: "ประเภท: โคเคน",
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
    type: "โคเคน"
  },
  {
    id: 9,
    image: [
      "/Img/ยาเสพติด/หีบห่อ/Double Uoglobe Brand.png"
    ],
    title: "Double Uoglobe Brand",
    description: "ประเภท: วัตถุออกฤทธิ์อื่นๆ",
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
    type: "วัตถุออกฤทธิ์อื่นๆ"
  },
  {
    id: 10,
    image: [
      "/Img/ยาเสพติด/หีบห่อ/999_หลุยส์วิตตอง.png"
    ],
    title: "999 หลุยส์วิตตอง",
    description: "ประเภท: สารผสม",
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
    type: "สารผสม"
  },
  {
    id: 11,
    image: [
      "/Img/ยาเสพติด/หีบห่อ/Manchester United.png"
    ],
    title: "แมนยู",
    description: "ประเภท: ยาบ้า",
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
    type: "ยาบ้า"
  },
  {
    id: 12,
    image: [
      "/Img/ยาเสพติด/หีบห่อ/Lexus_AAA_5Star.png"
    ],
    title: "Lexus AAA 5 ดาว",
    description: "ประเภท: เคตามีน",
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
    type: "เคตามีน"
  },
  {
    id: 13,
    image: [
      "/Img/ยาเสพติด/หีบห่อ/กัญชา.png"
    ],
    title: "กัญชา",
    description: "ประเภท: เคตามีน",
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
    type: "เคตามีน"
  },
  {
    id: 14,
    image: [
      "/Img/ยาเสพติด/หีบห่อ/A 1ดาว.png"
    ],
    title: "A 1 ดาว",
    description: "ประเภท: เคตามีน",
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
    type: "เคตามีน"
  },
  {
    id: 15,
    image: [
      "/Img/ยาเสพติด/หีบห่อ/999_Rolex.png"
    ],
    title: "999 Rolex",
    description: "ประเภท: ยาบ้า",
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
    type: "ยาบ้า"
  },
  {
    id: 16,
    image: [
      "/Img/ยาเสพติด/หีบห่อ/Y1-Real Madrid-Red.png"
    ],
    title: "Y1 เรอัลมาดริด สีแดง",
    description: "ประเภท: สารผสม",
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
    type: "สารผสม"
  },
  ...Array.from({ length: 30 }, (_, i) => ({
      id: 17 + i,
      image: "/Img/ยาเสพติด/หีบห่อ/Lexus.png",
      title: `รายการที่ ${17 + i}`,
      description: "ประเภท: สารผสม",
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
      type: "สารผสม"
  }))
];

const DrugProfile = () => {
  const { id } = useParams();
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [fullScreen, setFullScreen] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const drug = drugs.find(g => g.id === parseInt(id));
      if (drug) {
        setSelectedDrug(drug);
        setSelectedImage(drug.image[0]);
      } else {
        setError("Drug not found");
      }
    } catch (err) {
      setError("An error occurred while loading the drug profile.");
    }
  }, [id]);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!selectedDrug) {
    return <div>Loading...</div>;
  }

  return (
    <div className='flex-1 h-full overflow-auto bg-white'>
      {/* Mobile Design */}
      <div className="md:hidden">
        {/* Header with dark red background */}
        <div className="relative bg-[#800000] rounded-b-full h-96">
          {/* Back Button */}
          <button 
            className="absolute top-4 left-4 z-20 text-white"
            onClick={() => navigate(-1)}
          >
            <IoChevronBack size={28} />
          </button>

          {/* Drug Images */}
          <div className="relative md:w-1/2 flex flex-col items-center z-10 p-6">
            <img
              src={selectedImage}
              alt={`${selectedDrug.title}`}
              className="relative w-full max-w-md mx-auto object-contain"
              onClick={() => setFullScreen(true)}
            />
          </div>

          {/* Thumbnails */}
          <div className="flex gap-2 mt-4 px-4 overflow-x-auto py-2">
            {selectedDrug.image.map((img, index) => (
              <button
                key={index}
                className={`w-16 h-16 rounded flex-shrink-0 ${
                  selectedImage === img ? 'border-2 border-black' : 'border border-gray-300'
                }`}
                onClick={() => setSelectedImage(img)}
              >
                <img 
                  src={img} 
                  alt="Thumbnail" 
                  className="w-full h-full object-contain bg-white p-1" 
                />
              </button>
            ))}
          </div>

          {/* Full Screen Modal */}
          {fullScreen && (
            <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50">
              {/* ปุ่มปิด Full Screen */}
              <button 
                className="absolute top-4 right-4 text-white text-3xl p-2 bg-gray-800 rounded-full"
                onClick={() => setFullScreen(false)}
              >
                <IoClose />
              </button>
              
              {/* ภาพที่ขยายเต็มจอ */}
              <img src={selectedImage} alt="Full Screen" className="max-w-full max-h-[80vh] object-contain mb-4 px-4" />

              {/* Thumbnail ใน Full Screen (Swipe ได้) */}
              <div className="flex overflow-x-auto space-x-2 p-4 bg-gray-900 bg-opacity-50 rounded-lg scrollbar-hide">
                {selectedDrug.image.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    className={`w-16 h-16 object-contain bg-white border-2 rounded-lg cursor-pointer ${img === selectedImage ? 'border-red-500' : 'border-gray-300'}`}
                    onClick={() => setSelectedImage(img)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Drug Details */}
          <div className="px-4 mt-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl uppercase font-bold mt-1">
                {selectedDrug.title}
              </h1>
              <FaShareSquare className="text-gray-500" size={20} />
            </div>

            <h2 className="text-gray-500 font-medium">
              {selectedDrug.description}
            </h2>

            {selectedDrug.details.map((item, index) => (
                <p key={index} className="text-black mt-1">
                  <span className="font-semibold">{item.label}:</span> {item.value}
                </p>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop Design */}
      <div className="hidden md:flex flex-col relative md:flex-row items-center p-6 bg-white h-full">
        {/* Back Button */}
        <button 
          className="absolute top-4 left-4 z-20 text-white md:block"
          onClick={() => navigate(-1)}
        >
          <IoChevronBack size={28} />
        </button>

        {/* Half Circle Background - Made it larger and more curved */}
        <div className="absolute left-0 top-0 w-1/3 h-full bg-gradient-to-r from-[#990000] to-[#330000] rounded-r-full z-0 hidden md:block"></div>

        {/* Drug Images */}
        <div className="relative md:w-1/2 flex flex-col items-center z-10 p-6">
          <img
            src={selectedImage}
            alt={`${selectedDrug.title}`}
            className="relative w-full max-w-md mx-auto object-contain"
            onClick={() => setFullScreen(true)}
          />

          {/* Thumbnails */}
          <div className="flex gap-2 mt-4 justify-center">
            {selectedDrug.image.map((img, index) => (
              <button
                key={index}
                className={`w-16 h-16 border-2 rounded ${
                  selectedImage === img ? "border-red-500" : "border-white"
                }`}
                onClick={() => setSelectedImage(img)}
              >
                <img src={img} alt="Thumbnail" className="w-full h-full object-contain bg-white" />
              </button>
            ))}
          </div>
        </div>

        {/* Full Screen Modal */}
        {fullScreen && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50">
            {/* ปุ่มปิด Full Screen */}
            <button 
              className="absolute top-4 right-4 text-white text-3xl p-2 bg-gray-800 rounded-full"
              onClick={() => setFullScreen(false)}
            >
              <IoClose />
            </button>
            
            {/* ภาพที่ขยายเต็มจอ */}
            <img src={selectedImage} alt="Full Screen" className="max-w-full max-h-[80vh] object-contain mb-4" />

            {/* Thumbnail ใน Full Screen */}
            <div className="flex justify-center space-x-2 p-4 bg-gray-900 bg-opacity-50 rounded-lg">
              {selectedDrug.image.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Thumbnail ${index + 1}`}
                  className={`w-16 h-16 object-contain bg-white border-2 rounded-lg cursor-pointer ${img === selectedImage ? 'border-red-500' : 'border-gray-300'}`}
                  onClick={() => setSelectedImage(img)}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Right Section - Drug Details */}
        <div className="md:w-1/3 p-6 text-gray-900 z-10 md:pl-10 pr-32 pb-16">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-4xl font-bold">{selectedDrug.title}</h1>
            <FaShareSquare className="text-gray-500 cursor-pointer" size={30} />
          </div>
          <div className="mt-4">
            <p className="text-black mt-1">
              <span className="font-semibold">{selectedDrug.description}</span>
            </p>
            {selectedDrug.details.map((item, index) => (
                <p key={index} className="text-black mt-1">
                  <span className="font-semibold">{item.label}:</span> {item.value}
                </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DrugProfile
