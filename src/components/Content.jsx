import { FaShareSquare } from "react-icons/fa";

function Content() {
  return (
    <div className="p-6 h-[80vh] flex justify-center items-center relative">
      <div className="flex w-3/4">
        <img
          src="https://oyster.ignimgs.com/mediawiki/apis.ign.com/battlefield-3/4/43/G18.png"
          alt="ปืน"
          className="w-96 h-60 object-cover rounded-lg shadow"
        />

        
        <div className="ml-10 flex-1 flex justify-between items-start">
          
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-semibold">ปืน-ยี่ห้อ-รุ่น</h1>
              <FaShareSquare className="text-gray-500 cursor-pointer text-3xl hover:text-gray-700 transition" />
            </div>

            <div className="mt-6 space-y-2">
              <p className="text-gray-600 font-semibold text-lg">รายละเอียด</p>
              <p className="text-gray-700 text-lg">ประเภท: พก</p>
              <p className="text-gray-700 text-lg">ยี่ห้อ:XXXXXXXX</p>
              <p className="text-gray-700 text-lg">รุ่น:XXXXXXXXXX</p>
              <p className="text-gray-700 text-lg">จุดสังเกตเลขประจำปืน:XXXXXXXXXXXXXX</p>
            </div>
          </div>

          
          <div className="flex flex-col items-center ml-10">
            <div className="relative w-20 h-20">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                  className="text-gray-300 stroke-current"
                  strokeWidth="4"
                  d="M18 2a16 16 0 1 1 0 32 16 16 0 1 1 0-32"
                  fill="none"
                />
                <path
                  className="text-red-800 stroke-current"
                  strokeWidth="4"
                  strokeDasharray="100"
                  strokeDashoffset="22"
                  d="M18 2a16 16 0 1 1 0 32 16 16 0 1 1 0-32"
                  fill="none"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-lg font-semibold">
                78%
              </span>
            </div>
            <p className="mt-2 text-gray-700 text-lg">ความมั่นใจ</p>
          </div>
        </div>
      </div>

      
      <div className="absolute bottom-14 right-8 flex space-x-4">
        <button className="px-6 py-3 border border-gray-400 text-gray-700 rounded-lg hover:bg-gray-100 transition text-lg w-36">
          ถ่ายใหม่
        </button>
        <button className="px-6 py-3 bg-red-800 text-white rounded-lg hover:bg-red-900 transition text-lg w-36">
          บันทึกประวัติ
        </button>
      </div>
    </div>
  );
}

export default Content;
