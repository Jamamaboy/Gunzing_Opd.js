import { api } from "../config/api";
import { parseDate } from '../utils/dateUtils';

export class CSVUploadService {
    static async uploadCSVData(csvData, fileName) {
        try {
            const processedData = this.processCSVData(csvData);
            
            // ✅ เพิ่มการตรวจสอบ Geography data
            const validationResult = this.validateGeographyData(processedData);
            if (!validationResult.isValid) {
                console.warn('Geography validation warnings:', validationResult.warnings);
            }
            
            // อัปโหลดข้อมูลเป็น batch
            const results = {
                successful: 0,
                failed: 0,
                errors: [],
                geography_processed: validationResult.geography_processed || null
            };

            for (const batch of this.createBatches(processedData, 10)) {
                try {
                    await this.uploadBatch(batch);
                    results.successful += batch.length;
                } catch (error) {
                    results.failed += batch.length;
                    results.errors.push({
                        batch: batch,
                        error: error.message
                    });
                }
            }

            return {
                success: true,
                data: results,
                message: `อัปโหลดสำเร็จ ${results.successful} รายการ, ไม่สำเร็จ ${results.failed} รายการ`
            };

        } catch (error) {
            console.error('CSV Upload Error:', error);
            return {
                success: false,
                error: error.message,
                message: 'เกิดข้อผิดพลาดในการอัปโหลดข้อมูล'
            };
        }
    }

    static processCSVData(csvData) {
        const columnMapping = {
            'เลขที่คดี': 'case_id',
            'รับของกลางจาก': 'seized_from',
            'วันที่เกิดเหตุ': 'occurrence_date',
            'สถานที่เกิดเหตุ': 'occurrence_place',
            'บ้านเลขที่': 'house_number',
            'หมู่ที่': 'moo',
            'ซอย': 'soi',
            'ถนน': 'street',
            'ตำบล': 'subdistrict_name',
            'อำเภอ': 'district_name',
            'จังหวัด': 'province_name',
            'เลขที่การตรวจ': 'inspection_number',
            'ลำดับของกลาง': 'sequence_number',
            'จำนวน': 'quantity',
            'หน่วย': 'unit',
            'สีของกลาง': 'color',
            'เส้นผ่านศูนย์ กลาง(มม.), หนา (มม.)': 'diameter_thickness',
            'ขอบ (มม.)': 'edge_shape',
            'น้ำหนักต่อเม็ด(มก.)': 'weight',
            'กลุ่มยา (G)': 'drug_type',
            'ผู้ต้องหา': 'defendant_name',
            'รหัสตัวพิมพ์': 'characteristics'
        };

        const processedData = [];
        const caseIdIssues = [];

        csvData.forEach((row, index) => {
            try {
                // แปลงข้อมูลตาม mapping
                const mappedRow = {};
                Object.keys(row).forEach(key => {
                    const mappedKey = columnMapping[key];
                    if (mappedKey && row[key] !== null && row[key] !== '') {
                        mappedRow[mappedKey] = row[key];
                    }
                });

                // ✅ เพิ่มการประมวลผล Geography IDs จาก processed data
                if (row.subdistrict_id) {
                    mappedRow.subdistrict_id = row.subdistrict_id;
                }
                if (row.district_id) {
                    mappedRow.district_id = row.district_id;
                }
                if (row.province_id) {
                    mappedRow.province_id = row.province_id;
                }

                // ✅ ตรวจสอบ Case ID
                if (mappedRow.case_id) {
                    const validation = this.validateCaseId(mappedRow.case_id);
                    
                    if (!validation.isValid) {
                        caseIdIssues.push({
                            row: index + 1,
                            caseId: mappedRow.case_id,
                            error: validation.error
                        });
                    } else if (validation.warnings.length > 0) {
                        console.warn(`⚠️ Row ${index + 1} Case ID "${mappedRow.case_id}": ${validation.warnings.join(', ')}`);
                    }
                }

                // แยกข้อมูล diameter และ thickness (เหมือนเดิม)
                if (mappedRow.diameter_thickness) {
                    const parts = String(mappedRow.diameter_thickness).split(',');
                    if (parts.length >= 2) {
                        mappedRow.diameter_mm = this.parseNumber(parts[0]);
                        mappedRow.thickness_mm = this.parseNumber(parts[1]);
                    }
                    delete mappedRow.diameter_thickness;
                }

                // แปลงข้อมูลเป็น type ที่ถูกต้อง (เหมือนเดิม)
                if (mappedRow.sequence_number) {
                    mappedRow.sequence_number = parseInt(mappedRow.sequence_number);
                }
                if (mappedRow.quantity) {
                    mappedRow.quantity = parseInt(mappedRow.quantity);
                }
                if (mappedRow.weight) {
                    mappedRow.weight = this.parseNumber(mappedRow.weight);
                }
                
                // ✅ ใช้ parseDate จาก dateUtils แทน
                if (mappedRow.occurrence_date) {
                    mappedRow.occurrence_date = parseDate(mappedRow.occurrence_date);
                }

                processedData.push({
                    rowIndex: index + 1,
                    data: mappedRow
                });

            } catch (error) {
                console.error(`Error processing row ${index + 1}:`, error);
            }
        });

        // ✅ แสดงสรุปปัญหา Case ID
        if (caseIdIssues.length > 0) {
            console.warn('🚨 Case ID Issues Found:', caseIdIssues);
        }

        return processedData;
    }

    // ✅ เพิ่มฟังก์ชันตรวจสอบ Geography data
    static validateGeographyData(processedData) {
        let geography_processed = 0;
        const warnings = [];

        processedData.forEach(item => {
            if (item.data.subdistrict_id) {
                geography_processed++;
            } else if (item.data.subdistrict_name || item.data.district_name || item.data.province_name) {
                warnings.push(`Row ${item.rowIndex}: มีข้อมูลที่อยู่แต่ไม่สามารถแปลงเป็น ID ได้`);
            }
        });

        return {
            isValid: true,
            geography_processed,
            warnings
        };
    }

    // ✅ เพิ่มฟังก์ชันตรวจสอบ Case ID format (ลบ needsEncoding และ encodeCaseId)
    static validateCaseId(caseId) {
        if (!caseId || typeof caseId !== 'string') {
            return {
                isValid: false,
                error: 'Case ID is required and must be a string',
                warnings: []
            };
        }

        // ตรวจสอบความยาว
        if (caseId.length > 50) {
            return {
                isValid: false,
                error: 'Case ID must be 50 characters or less',
                warnings: []
            };
        }

        // ตรวจสอบ special characters ที่อาจทำให้เกิดปัญหาร้ายแรง
        const problematicChars = /[\<\>\"\'\\\`\0]/;
        if (problematicChars.test(caseId)) {
            return {
                isValid: false,
                error: 'Case ID contains dangerous characters (< > " \' \\ ` null)',
                warnings: []
            };
        }

        // ตรวจสอบ SQL injection patterns
        const sqlPatterns = /(\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bUNION\b)/i;
        if (sqlPatterns.test(caseId)) {
            return {
                isValid: false,
                error: 'Case ID contains SQL keywords',
                warnings: []
            };
        }

        return {
            isValid: true,
            warnings: []
        };
    }

    // ✅ เพิ่มฟังก์ชัน validate ข้อมูลทั่วไป
    static validateData(csvData) {
        const errors = [];
        const warnings = [];

        csvData.forEach((row, index) => {
            const rowNumber = index + 1;

            // ตรวจสอบข้อมูลที่จำเป็น
            if (!row['เลขที่คดี']) {
                errors.push(`แถว ${rowNumber}: ไม่มีเลขที่คดี`);
            }

            // ตรวจสอบข้อมูล Geography
            const hasProvince = row['จังหวัด'];
            const hasDistrict = row['อำเภอ'];
            const hasSubdistrict = row['ตำบล'];
            const hasSubdistrictId = row.subdistrict_id;

            if (hasProvince || hasDistrict || hasSubdistrict) {
                if (!hasSubdistrictId) {
                    warnings.push(`แถว ${rowNumber}: มีข้อมูลที่อยู่แต่ไม่สามารถแปลงเป็น ID ได้`);
                }
                
                // ตรวจสอบความครบถ้วนของข้อมูลที่อยู่
                if (!hasProvince || !hasDistrict || !hasSubdistrict) {
                    warnings.push(`แถว ${rowNumber}: ข้อมูลที่อยู่ไม่ครบถ้วน (ต้องมีจังหวัด อำเภอ และตำบล)`);
                }
            }

            // ตรวจสอบรูปแบบวันที่
            if (row['วันที่เกิดเหตุ']) {
                const parsedDate = this.parseDate(row['วันที่เกิดเหตุ']);
                if (!parsedDate) {
                    warnings.push(`แถว ${rowNumber}: รูปแบบวันที่ไม่ถูกต้อง`);
                }
            }

            // ตรวจสอบข้อมูลตัวเลข
            if (row['จำนวน'] && isNaN(parseInt(row['จำนวน']))) {
                warnings.push(`แถว ${rowNumber}: จำนวนไม่เป็นตัวเลข`);
            }

            if (row['น้ำหนักต่อเม็ด(มก.)'] && isNaN(parseFloat(row['น้ำหนักต่อเม็ด(มก.)']))) {
                warnings.push(`แถว ${rowNumber}: น้ำหนักไม่เป็นตัวเลข`);
            }

            // ✅ เพิ่มการตรวจสอบ Case ID
            if (row['เลขที่คดี']) {
                const caseIdValidation = this.validateCaseId(row['เลขที่คดี']);
                if (!caseIdValidation.isValid) {
                    errors.push(`แถว ${rowNumber}: ${caseIdValidation.error}`);
                } else if (caseIdValidation.warnings.length > 0) {
                    warnings.push(`แถว ${rowNumber}: ${caseIdValidation.warnings.join(', ')}`);
                }
            }
        });

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    static async findOrCreateCase(caseData) {
        try {
            console.log(`🔍 findOrCreateCase called with case_id: "${caseData.case_id}"`);
            
            // ลองหา Case ที่มีอยู่แล้ว
            try {
                // ✅ ใช้ Query Parameter แทน Path Parameter - ไม่ต้อง encode!
                const apiUrl = `/api/cases/by-case-id?case_id=${caseData.case_id}`;
                console.log(`🌐 API URL (Query Parameter): ${apiUrl}`);
                
                const existingResponse = await api.get(apiUrl);
                
                if (existingResponse.data && existingResponse.data.success) {
                    console.log(`✅ พบ Case ที่มีอยู่แล้ว: ${caseData.case_id}`);
                    return existingResponse.data.data;
                }
            } catch (error) {
                console.log(`🌐 API Request URL in error:`, error.config?.url);
                if (error.response?.status !== 404) {
                    console.error(`❌ Error finding case ${caseData.case_id}:`, error);
                    throw error;
                } else {
                    console.log(`📝 ไม่พบ Case ${caseData.case_id}, จะสร้างใหม่`);
                }
            }

            // สร้าง Case ใหม่
            const casePayload = {
                case_id: caseData.case_id,
                seized_from: caseData.seized_from,
                occurrence_date: caseData.occurrence_date,
                occurrence_place: caseData.occurrence_place,
                house_number: caseData.house_number,
                moo: caseData.moo,
                soi: caseData.soi,
                street: caseData.street,
                subdistrict_id: caseData.subdistrict_id || null,
                inspection_number: caseData.inspection_number
            };

            console.log(`🆕 สร้าง Case ใหม่:`, casePayload);
            const createResponse = await api.post('/api/cases/', casePayload);
            
            if (createResponse.data && createResponse.data.success) {
                console.log(`✅ สร้าง Case สำเร็จ: ${caseData.case_id}`);
                return createResponse.data.data;
            } else {
                throw new Error('Failed to create case: Invalid response');
            }

        } catch (error) {
            console.error(`❌ Error in findOrCreateCase for ${caseData.case_id}:`, error);
            throw new Error(`Case operation failed: ${error.response?.data?.detail || error.message}`);
        }
    }

    // ✅ เพิ่มฟังก์ชันทดสอบ Query Parameter
    static async testCaseIdQuery(caseId) {
        try {
            console.log(`🧪 Testing Case ID with Query Parameter: "${caseId}"`);
            
            // ทดสอบ debug endpoint
            const debugUrl = `/api/cases/debug/by-case-id?case_id=${caseId}`;
            console.log(`🧪 Debug URL: ${debugUrl}`);
            
            const debugResponse = await api.get(debugUrl);
            console.log(`🧪 Debug Response:`, debugResponse.data);
            
            // ทดสอบ case lookup
            const caseUrl = `/api/cases/by-case-id?case_id=${caseId}`;
            console.log(`🧪 Case URL: ${caseUrl}`);
            
            const caseResponse = await api.get(caseUrl);
            console.log(`🧪 Case Response:`, caseResponse.data);
            
            return {
                success: true,
                debug: debugResponse.data,
                case: caseResponse.data
            };
            
        } catch (error) {
            console.error(`🧪 Test failed:`, error);
            return {
                success: false,
                error: error.message,
                response: error.response?.data
            };
        }
    }

    // ฟังก์ชันอื่นๆ เหมือนเดิม...
    static async uploadBatch(batch) {
        const promises = batch.map(async (item) => {
            try {
                // 1. สร้างหรือหา Case
                let caseData = null;
                if (item.data.case_id) {
                    // ✅ ส่งข้อมูล Geography ไปด้วย
                    caseData = await this.findOrCreateCase({
                        case_id: item.data.case_id,
                        seized_from: item.data.seized_from,
                        occurrence_date: item.data.occurrence_date,
                        occurrence_place: item.data.occurrence_place,
                        house_number: item.data.house_number,
                        moo: item.data.moo,
                        soi: item.data.soi,
                        street: item.data.street,
                        
                        // ✅ ส่ง subdistrict_id แทน subdistrict string
                        subdistrict_id: item.data.subdistrict_id,
                        
                        inspection_number: item.data.inspection_number
                    });
                }

                // 2. สร้างหรือหา Defendant (เหมือนเดิม)
                let defendantData = null;
                if (item.data.defendant_name) {
                    defendantData = await this.findOrCreateDefendant(item.data.defendant_name);
                }

                // 3. สร้าง Evidence (เหมือนเดิม)
                if (caseData) {
                    const evidenceData = {
                        case_id: caseData.id,
                        sequence_number: item.data.sequence_number,
                        quantity: item.data.quantity,
                        unit: item.data.unit,
                        color: item.data.color,
                        diameter_mm: item.data.diameter_mm,
                        thickness_mm: item.data.thickness_mm,
                        edge_shape: item.data.edge_shape,
                        weight: item.data.weight,
                        characteristics: item.data.characteristics,
                        drug_type: item.data.drug_type,
                        defendant_id: defendantData?.id || null
                    };

                    await this.createEvidence(evidenceData);
                }

            } catch (error) {
                console.error(`Error uploading row ${item.rowIndex}:`, error);
                throw error;
            }
        });

        await Promise.all(promises);
    }

    static async findOrCreateDefendant(fullname) {
        try {
            // ลองหา Defendant ที่มีอยู่แล้ว
            try {
                const existingResponse = await api.get(`/api/defendants/search?name=${encodeURIComponent(fullname)}`);
                if (existingResponse.data && existingResponse.data.success && existingResponse.data.data.length > 0) {
                    return existingResponse.data.data[0];
                }
            } catch (error) {
                if (error.response?.status !== 404) {
                    throw error;
                }
            }

            // สร้าง Defendant ใหม่
            const nameParts = fullname.trim().split(' ');
            const defendantPayload = {
                first_name: nameParts[0] || '',
                last_name: nameParts.slice(1).join(' ') || '',
                fullname: fullname
            };

            const createResponse = await api.post('/api/defendants/', defendantPayload);
            
            if (createResponse.data && createResponse.data.success) {
                return createResponse.data.data;
            } else {
                throw new Error('Failed to create defendant: Invalid response');
            }

        } catch (error) {
            console.error('Error in findOrCreateDefendant:', error);
            throw new Error(`Defendant operation failed: ${error.response?.data?.detail || error.message}`);
        }
    }

    static async createEvidence(evidenceData) {
        try {
            const response = await api.post('/api/evidences/', evidenceData);
            
            if (response.data && response.data.success) {
                return response.data.data;
            } else {
                throw new Error('Failed to create evidence: Invalid response');
            }

        } catch (error) {
            console.error('Error creating evidence:', error);
            throw new Error(`Evidence creation failed: ${error.response?.data?.detail || error.message}`);
        }
    }

    static createBatches(data, batchSize) {
        const batches = [];
        for (let i = 0; i < data.length; i += batchSize) {
            batches.push(data.slice(i, i + batchSize));
        }
        return batches;
    }

    static parseNumber(value) {
        if (value === null || value === undefined || value === '') return null;
        const num = parseFloat(String(value).replace(/,/g, ''));
        return isNaN(num) ? null : num;
    }

    // ✅ ลบ parseDate, parseExcelDate, testDateParsing ออก - ใช้จาก dateUtils แทน

    static async checkApiConnection() {
        try {
            const response = await api.get('/api/health');
            return response.data;
        } catch (error) {
            console.error('API connection error:', error);
            return { success: false, error: error.message };
        }
    }

    static async getStatistics() {
        try {
            const response = await api.get('/api/statistics');
            return response.data;
        } catch (error) {
            console.error('Statistics error:', error);
            return { success: false, error: error.message };
        }
    }
}