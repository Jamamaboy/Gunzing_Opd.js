import React from 'react';
import { X, Send, RotateCcw } from 'lucide-react';

const ImagePreview = ({ imageData, mode, onRetake, onSubmit, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Header */}
      <div className="relative p-4 flex justify-between items-center bg-black/80">
        <button 
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-800/50 transition-colors"
        >
          <X className="w-6 h-6 text-white" />
        </button>
        <span className="text-white font-medium">ตรวจสอบภาพ</span>
        <div className="w-10" /> {/* Spacer for alignment */}
      </div>

      {/* Image Preview */}
      <div className="flex-1 relative">
        <img 
          src={imageData} 
          alt="Preview" 
          className="w-full h-full object-contain"
        />
        <div className="absolute top-4 right-4">
          <span className="px-4 py-2 rounded-full bg-black/50 text-white text-sm">
            {mode === 'ยาเสพติด' ? '🔍 ตรวจจับยาเสพติด' : '🔍 ตรวจจับอาวุธปืน'}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-6 bg-black/80 space-y-4">
        <button
          onClick={onSubmit}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 rounded-full text-white font-medium flex items-center justify-center space-x-2 transition-colors"
        >
          <Send className="w-5 h-5" />
          <span>ส่งภาพให้ AI วิเคราะห์</span>
        </button>
        
        <button
          onClick={onRetake}
          className="w-full py-4 bg-gray-800 hover:bg-gray-700 rounded-full text-white font-medium flex items-center justify-center space-x-2 transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
          <span>ถ่ายภาพใหม่</span>
        </button>
      </div>
    </div>
  );
};

export default ImagePreview;