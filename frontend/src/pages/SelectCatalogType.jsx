import React from 'react';
import { useNavigate } from 'react-router-dom';

const SelectCatalogType = ({ onSelect = () => {} }) => {
  const navigate = useNavigate();
  
  const items = [
    { id: 1, image: "/Img/icon/gunLogo.png", label: "อาวุธปืน", path: "/selectCatalogType/guns-catalog" },
    { id: 2, image: "/Img/icon/drugLogo.png", label: "ยาเสพติด", path: "/selectCatalogType/drugs-catalog" },
  ];
  
  const handleClick = (item) => {
    onSelect(item.label);
    navigate(item.path);
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="h-full w-full bg-[#F8F9FA] flex flex-col overflow-hidden">
        <div className="px-6 py-4 flex justify-between items-center flex-shrink-0">
          <h1 className="text-xl font-bold">รายการวัตถุพยาน</h1>
        </div>
        <div className="flex-1 overflow-y-auto px-6">
          <div className="flex-1 h-full flex flex-col justify-center items-center gap-6 -mt-8 pb-8">
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => handleClick(item)}
                className="w-40 h-40 flex items-center justify-center border border-red-800 cursor-pointer 
                hover:shadow-2xl hover:scale-105 hover:border-2 hover:bg-red-50
                transition-all duration-300 ease-in-out rounded-lg"
              >
                <div className="flex flex-col items-center justify-center gap-2 p-4">
                  <img src={item.image} alt={item.label} className="w-16 h-16 object-contain" />
                  <span className="text-red-800 font-medium">{item.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectCatalogType;