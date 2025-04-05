import { useState } from "react";
import { FaShareSquare } from "react-icons/fa";

function Content() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Login successful
        console.log('Login successful:', data);
        alert("เข้าสู่ระบบสำเร็จ!");
        // Later you can add navigation or state updates here
      } else {
        // Show error message
        setError(data.detail || 'Login failed');
      }
    } catch (error) {
      setError('Error connecting to server');
      console.error('Error:', error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-4 bg-white border border-[#800000] rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-center text-gray-800">เข้าสู่ระบบ</h2>

        {error && (
          <div className="p-2 text-sm text-white bg-red-500 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="username">รหัสประจำตัว</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 mt-1 text-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#800000]"
              placeholder="รหัสประจำตัว"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="password">รหัสผ่าน</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 text-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#800000]"
              placeholder="รหัสผ่าน"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 mt-4 font-semibold text-white bg-[#800000] rounded-md hover:bg-red-700 focus:outline-none"
          >
            ลงชื่อเข้าใช้
          </button>
        </form>

        <div className="flex flex-col items-left mt-4 text-sm text-blue-800">
          <a href="#" className="hover:underline">ลืมรหัสผ่าน ?</a>
        </div>
      </div>
    </div>
  );
}

export default Content;
