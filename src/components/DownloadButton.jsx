import { FaDownload } from "react-icons/fa";
import html2canvas from "html2canvas";

export default function DownloadButton() {
  const handleDownload = async () => {
    console.log("Download initiated");
    const element = document.getElementById("capture-area");
    if (!element) {
      console.error("Element not found");
      return;
    }
    console.log("Element found", element);

    try {
      const canvas = await html2canvas(element, {
        logging: true,
        useCORS: true, // Important for cross-origin images
        allowTaint: true,
        scale: 2 // Higher quality
      });
      console.log("Canvas created successfully");

      const dataUrl = canvas.toDataURL("image/png");
      console.log("Data URL created", dataUrl.substring(0, 50) + "...");

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "gun-detail.png";
      document.body.appendChild(link);
      console.log("Link created, triggering click");
      link.click();
      document.body.removeChild(link);
      console.log("Download complete");

      // Alert user about where to find the download
      alert("Image downloaded to your Downloads folder. Check there if it's not in Photos.");
    } catch (error) {
      console.error("Error during download:", error);
    }
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
