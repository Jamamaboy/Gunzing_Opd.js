import React from 'react';
import { FiX } from "react-icons/fi";

const FilterTags = ({ labels, onRemove }) => {
    if (labels.length === 0) return null;
    
    return (
        <div className="flex flex-wrap gap-2 mb-4 px-4 md:px-6">
            {labels.map((item, index) => (
                <div key={`${item.type}-${item.value}-${index}`} className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm">
                    <span>{item.label}</span>
                    <button 
                      onClick={() => onRemove(item.type, item.value)} 
                      className="ml-2 text-gray-500 hover:text-red-500"
                    >
                      <FiX size={16} />
                    </button>
                </div>
            ))}
        </div>
    );
};

export default FilterTags;