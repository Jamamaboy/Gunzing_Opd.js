import React from 'react';
import DrugFormDropdown from './DrugFormDropdown';

const DrugFormSection = ({ formData, setFormData, setEvidenceType, drugForms, isLoadingDrugForms }) => {
    return (
        <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-medium mb-5">รูปแบบยาเสพติดพยาน</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="relative">
                    <DrugFormDropdown 
                        value={formData.formId}
                        options={drugForms}
                        isLoading={isLoadingDrugForms}
                        onChange={(value) => {
                            setFormData({...formData, formId: value});
                            
                            const selectedForm = drugForms.find(form => form.id.toString() === value);
                            if (selectedForm) {
                                setEvidenceType(selectedForm.name);
                            } else {
                                setEvidenceType("");
                            }
                        }}
                        placeholder="เลือกรูปแบบยา"
                    />
                </div>
            </div>
        </div>
    );
};

export default DrugFormSection;