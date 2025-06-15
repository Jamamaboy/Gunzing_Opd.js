import React, { useState } from 'react';
import { ChevronLeft, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableImage = ({ id, src, onSelect, onRemove, isSelected }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        border: isSelected ? '2px solid #34D399' : '2px solid #E5E7EB',
        borderRadius: '0.375rem',
        overflow: 'hidden',
        cursor: 'pointer',
        position: 'relative'
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="w-16 h-16">
            <img
                src={src}
                alt="thumb"
                onClick={onSelect}
                className="w-full h-full object-cover"
            />
            <button
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                onClick={onRemove}
                type="button"
            >
                <X size={14} />
            </button>
        </div>
    );
};

const CreateGun = () => {
    const navigate = useNavigate();
    const handleGoBack = () => navigate(-1);

    const [images, setImages] = useState([]);
    const [selectedThumb, setSelectedThumb] = useState(0);

    const sensors = useSensors(useSensor(PointerSensor));

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const imageUrls = files.map(file => URL.createObjectURL(file));
        setImages(prev => [...prev, ...imageUrls]);
    };

    const handleRemoveImage = (index) => {
        setImages(prev => {
            const updated = [...prev];
            updated.splice(index, 1);
            if (selectedThumb >= updated.length) {
                setSelectedThumb(Math.max(0, updated.length - 1));
            }
            return updated;
        });
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            const oldIndex = images.findIndex(img => img === active.id);
            const newIndex = images.findIndex(img => img === over.id);
            setImages(prev => arrayMove(prev, oldIndex, newIndex));
            setSelectedThumb(newIndex);
        }
    };

    return (
        <div className="flex flex-col w-full bg-gray-100 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between w-full py-4 pl-5">
                <button className="flex items-center text-[#990000] font-medium" onClick={handleGoBack}>
                    <ChevronLeft className="h-5 w-5 mr-1" />
                    ย้อนกลับ
                </button>
            </div>

            {/* Title */}
            <div className="flex items-center justify-between w-full px-6">
                <h1 className="text-xl font-bold mb-4">เพิ่มอาวุธปืน</h1>
            </div>

            {/* Content */}
            <div className="px-6 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-8 bg-white rounded-lg p-6">
                        <h2 className="text-lg font-medium mb-6">ข้อมูลทั่วไป</h2>
                        {/* Input fields skipped for brevity */}
                    </div>

                    {/* Image Upload Section */}
                    <div className="md:col-span-4">
                        <div className="bg-white rounded-lg p-6 mb-4">
                            <h2 className="text-lg font-medium mb-6">อัพโหลดรูปภาพ</h2>

                            {/* Main Preview */}
                            <div className="bg-gray-50 rounded-md mb-4">
                                {images.length > 0 ? (
                                    <img
                                        src={images[selectedThumb]}
                                        alt="Selected preview"
                                        className="w-full h-auto object-cover rounded-md"
                                    />
                                ) : (
                                    <div className="w-full h-[200px] bg-gray-200 rounded-md flex items-center justify-center text-gray-500">
                                        ไม่มีภาพ
                                    </div>
                                )}
                            </div>

                            {/* Thumbnails */}
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext items={images} strategy={verticalListSortingStrategy}>
                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
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
                                        <label className="w-16 h-16 rounded border-2 border-dashed border-green-400 flex items-center justify-center cursor-pointer hover:bg-green-50">
                                            <Plus className="h-5 w-5 text-green-500" />
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
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateGun;
