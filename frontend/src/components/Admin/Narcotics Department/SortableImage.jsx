import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { X } from 'lucide-react';

const SortableImage = ({ id, src, onSelect, onRemove, isSelected }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        border: isSelected ? '2px solid #990000' : '2px solid #E5E7EB',
        borderRadius: '0.375rem',
        overflow: 'hidden',
        cursor: 'pointer'
    };
    return (
        <div className="relative group">
            <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="w-16 h-16">
                <img
                    src={src}
                    alt="thumb"
                    onClick={onSelect}
                    className="w-full h-full object-contain"
                />
                {/* เพิ่ม overlay effect เมื่อ hover */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
            </div>
            <button
                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-700 shadow-md"
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                }}
                type="button"
                aria-label="ลบรูปภาพ"
            >
                <X size={12} />
            </button>
        </div>
    );
};

export default SortableImage;