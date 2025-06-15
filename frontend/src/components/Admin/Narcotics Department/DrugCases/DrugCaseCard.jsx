import React from 'react';

const DrugCaseCard = ({ caseData, onEdit, onDelete }) => {
  return (
    <div className="border rounded-lg p-4 shadow-md">
      <h3 className="text-lg font-semibold">{caseData.title}</h3>
      <p className="text-gray-600">Date: {caseData.date}</p>
      <p className="text-gray-600">Description: {caseData.description}</p>
      <p className="text-gray-600">Status: {caseData.status}</p>
      <div className="mt-4">
        <button 
          className="bg-blue-500 text-white px-3 py-1 rounded mr-2"
          onClick={() => onEdit(caseData.id)}
        >
          Edit
        </button>
        <button 
          className="bg-red-500 text-white px-3 py-1 rounded"
          onClick={() => onDelete(caseData.id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default DrugCaseCard;