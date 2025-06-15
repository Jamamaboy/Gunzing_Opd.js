import React from 'react';
import { Plus } from 'lucide-react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableImage from './SortableImage';

const ImageUploadSection = ({ 
    images, 
    selectedThumb, 
    setSelectedThumb, 
    handleImageUpload, 
    handleRemoveImage, 
    handleDragEnd, 
    sensors 
}) => {
    return (
        <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-medium mb-4">อัพโหลดรูปภาพ</h2>
            
            {/* Main Preview */}
            <div className="bg-gray-50 rounded-md mb-5 shadow-inner overflow-hidden">
                {images.length > 0 ? (
                    <div className="relative w-full h-56">
                        <img
                            src={images[selectedThumb]}
                            alt="Selected preview"
                            className="w-full h-full object-contain rounded-md"
                        />
                    </div>
                ) : (
                    <div className="w-full h-56 bg-gray-100 rounded-md flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200">
                        <div className="mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <p>ยังไม่มีรูปภาพ</p>
                        <p className="text-xs mt-1">อัพโหลดรูปภาพด้านล่าง</p>
                    </div>
                )}
            </div>

            {/* Thumbnails Section */}
            <h3 className="text-sm font-medium text-gray-700 mb-3">รูปภาพทั้งหมด ({images.length})</h3>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={images} strategy={verticalListSortingStrategy}>
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                        {images.map((img, index) => (
                            <SortableImage
                                key={img}
                                id={img}
                                src={img}
                                isSelected={selectedThumb === index}
                                onSelect={() => setSelectedThumb(index)}
                                onRemove={() => handleRemoveImage(index)}
                            />
                        ))}
                        
                        {/* Upload Button */}
                        <label className="w-16 h-16 rounded border-2 border-dashed border-[#990000] flex flex-col items-center justify-center cursor-pointer hover:bg-red-50 transition-colors duration-300">
                            <Plus className="h-5 w-5 text-[#990000]" />
                            <span className="text-[10px] text-[#990000] mt-1">เพิ่มรูปภาพ</span>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                        </label>
                    </div>
                </SortableContext>
            </DndContext>
            
            {/* Helper Text */}
            {images.length > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                    *สามารถลากเพื่อจัดเรียงรูปภาพได้
                </p>
            )}
        </div>
    );
};

export default ImageUploadSection;