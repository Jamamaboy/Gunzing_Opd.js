import { FaShareSquare } from "react-icons/fa";

function Content() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-4 bg-white border border-[#800000] rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-center text-gray-800">เข้าสู่ระบบ</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="username">รหัสประจำตัว</label>
            <input
              id="username"
              type="text"
              className="w-full px-3 py-2 mt-1 text-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#800000]"
              placeholder="รหัสประจำตัว"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="password">รหัสผ่าน</label>
            <input
              id="password"
              type="password"
              className="w-full px-3 py-2 mt-1 text-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#800000]"
              placeholder="รหัสผ่าน"
            />
          </div>
        </div>

        <button className="w-full px-4 py-2 mt-4 font-semibold text-white bg-[#800000] rounded-md hover:bg-red-700 focus:outline-none">
          ลงชื่อเข้าใช้
        </button>

        <div className="flex flex-col items-left mt-4 text-sm text-blue-800">
          <a href="#" className="hover:underline">ลืมรหัสผ่าน ?</a>
        </div>
      </div>
    </div>
  );
}

export default Content;
