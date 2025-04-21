
import { FaDownload } from "react-icons/fa";
import html2canvas from "html2canvas";

export default function DownloadButton() {
  const handleDownload = async () => {
    const element = document.getElementById("capture-area");
    if (!element) return;

    const canvas = await html2canvas(element);
    const dataUrl = canvas.toDataURL("image/png");

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "gun-detail.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleDownload}
      title="ดาวน์โหลดภาพหน้าจอ"
      className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition"
    >
      <FaDownload size={20} />
      <span className="text-sm font-medium">ดาวน์โหลด</span>
    </button>
  );
}
