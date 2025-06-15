// GunCard: การ์ดแสดงข้อมูลปืน
import React from 'react';
import { Link } from 'react-router-dom';

const GunCard = ({ gun }) => (
  <Link to={`/selectCatalogType/guns-catalog/gun-profile/${gun.id}`} className="bg-white rounded-lg shadow-sm p-3 flex flex-col items-center hover:shadow-md transition-shadow h-[280px] max-w-[210px] mx-auto w-full">
    <div className="w-28 h-28 mb-4">
      <img
        src={Array.isArray(gun.image) && gun.image.length > 0 ? gun.image[0] : '/placeholder-image.png'}
        alt={`${gun.brand} ${gun.model}`}
        className="w-full h-full object-contain"
        onError={(e) => {e.target.onerror = null; e.target.src='/placeholder-image.png'}}
      />
    </div>
    <div className="w-full flex-1 flex flex-col">
      <h3 className="font-semibold text-base mb-2 text-left line-clamp-2">{gun.brand} {gun.model}</h3>
      <p className="text-sm text-gray-600 text-left line-clamp-2">ยี่ห้อ: {gun.brand}</p>
      <p className="text-sm text-gray-600 text-left line-clamp-2">รุ่น: {gun.model}</p>
      <p className="text-sm text-gray-600 text-left line-clamp-2">ประเภท: {gun.subcategories}</p>
      <p className="text-sm text-gray-600 text-left line-clamp-2">กลไก: {gun.mechanism}</p>
    </div>
  </Link>
);

export default GunCard;