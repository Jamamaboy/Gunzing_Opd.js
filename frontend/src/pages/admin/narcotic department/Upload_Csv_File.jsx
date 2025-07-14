import { useState, useCallback, useEffect, useRef } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import {
    Upload, X, FileSpreadsheet, AlertCircle, CheckCircle,
    Loader2, ChevronLeft, ChevronRight, Database,
    AlertTriangle, MapPin
} from 'lucide-react';
import { CSVUploadService } from '../../../services/csvUploadService';
import {
    searchProvinces,
    searchDistricts,
    searchSubdistricts
} from '../../../services/geographyService';
import { formatDateForDisplay } from '../../../utils/dateUtils';

const Upload_Csv_File = () => {
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const [allData, setAllData] = useState([]);
    const [processedData, setProcessedData] = useState([]);
    const [headers, setHeaders] = useState([]);
    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [uploadResults, setUploadResults] = useState(null);
    const [showInstructions, setShowInstructions] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [isProcessingGeography, setIsProcessingGeography] = useState(false);
    const [geographyStats, setGeographyStats] = useState(null);
    const rowsPerPage = 10;
    const fileInputRef = useRef(null);

    // ส่วนการแสดงผลข้อมูลใน Table - เพิ่ม columns สำหรับ Geography
    const columnsToDisplay = [
        'เลขที่คดี', 'รับของกลางจาก', 'ลำดับของกลาง', 'วันที่เกิดเหตุ',
        'สถานที่เกิดเหตุ', 'หมู่ที่', 'ตำบล', 'อำเภอ', 'จังหวัด',
        'เลขที่การตรวจ', 'จำนวน', 'หน่วย', 'สีของกลาง',
        'เส้นผ่านศูนย์ กลาง(มม.), หนา (มม.)', 'ขอบ (มม.)',
        'น้ำหนักต่อเม็ด(มก.)', 'รหัสตัวพิมพ์', 'กลุ่มยา (G)',
        'Meth', 'Amp', 'Caff', 'Para', 'Mdma', 'Mda', 'Ket', 'อื่น ๆ',
        'ผู้ต้องหา', 'ความชื้น (%)', 'สัญลักษณ์บนหีบห่อ', 'รูปแบบการห่อหุ้ม'
    ];

    // ✅ ฟังก์ชันสำหรับประมวลผลข้อมูล Geography - แก้ไขการเรียกใช้ฟังก์ชัน
    const processGeographyData = useCallback(async (data) => {
        if (!data || data.length === 0) return data;

        setIsProcessingGeography(true);
        console.log('🌍 เริ่มประมวลผลข้อมูล Geography...');

        try {
            const processedRows = [];
            const geographyMapping = new Map();
            const stats = {
                totalRows: data.length,
                foundSubdistricts: 0,
                notFoundSubdistricts: 0,
                errors: []
            };

            for (let i = 0; i < data.length; i++) {
                const row = data[i];
                const processedRow = { ...row };

                // ดึงข้อมูลที่อยู่จาก CSV
                const provinceName = row['จังหวัด']?.toString().trim();
                const districtName = row['อำเภอ']?.toString().trim();
                const subdistrictName = row['ตำบล']?.toString().trim();

                console.log(`📍 Row ${i + 1}:`, {
                    province: provinceName,
                    district: districtName,
                    subdistrict: subdistrictName
                });

                if (provinceName && districtName && subdistrictName) {
                    // สร้าง key สำหรับ mapping
                    const geoKey = `${provinceName}|${districtName}|${subdistrictName}`;

                    // ตรวจสอบว่าเคยค้นหาแล้วหรือไม่
                    if (geographyMapping.has(geoKey)) {
                        const cachedResult = geographyMapping.get(geoKey);
                        processedRow.subdistrict_id = cachedResult.subdistrict_id;
                        processedRow.district_id = cachedResult.district_id;
                        processedRow.province_id = cachedResult.province_id;

                        if (cachedResult.subdistrict_id) {
                            stats.foundSubdistricts++;
                        } else {
                            stats.notFoundSubdistricts++;
                        }
                    } else {
                        try {
                            // ✅ ค้นหาจังหวัด - ใช้ฟังก์ชันที่ import แล้ว
                            console.log(`🔍 ค้นหาจังหวัด: ${provinceName}`);
                            const provinceResult = await searchProvinces(provinceName);

                            if (provinceResult.success && provinceResult.data.length > 0) {
                                const province = provinceResult.data.find(p =>
                                    p.province_name.toLowerCase().includes(provinceName.toLowerCase()) ||
                                    provinceName.toLowerCase().includes(p.province_name.toLowerCase())
                                );

                                if (province) {
                                    console.log(`✅ พบจังหวัด:`, province);

                                    // ✅ ค้นหาอำเภอในจังหวัดนั้น - ใช้ฟังก์ชันที่ import แล้ว
                                    console.log(`🔍 ค้นหาอำเภอ: ${districtName} ในจังหวัด: ${province.province_name}`);
                                    const districtResult = await searchDistricts(districtName, province.id);

                                    if (districtResult.success && districtResult.data.length > 0) {
                                        const district = districtResult.data.find(d =>
                                            d.district_name.toLowerCase().includes(districtName.toLowerCase()) ||
                                            districtName.toLowerCase().includes(d.district_name.toLowerCase())
                                        );

                                        if (district) {
                                            console.log(`✅ พบอำเภอ:`, district);

                                            // ✅ ค้นหาตำบลในอำเภอนั้น - ใช้ฟังก์ชันที่ import แล้ว
                                            console.log(`🔍 ค้นหาตำบล: ${subdistrictName} ในอำเภอ: ${district.district_name}`);
                                            const subdistrictResult = await searchSubdistricts(subdistrictName, district.id);

                                            if (subdistrictResult.success && subdistrictResult.data.length > 0) {
                                                const subdistrict = subdistrictResult.data.find(s =>
                                                    s.subdistrict_name.toLowerCase().includes(subdistrictName.toLowerCase()) ||
                                                    subdistrictName.toLowerCase().includes(s.subdistrict_name.toLowerCase())
                                                );

                                                if (subdistrict) {
                                                    console.log(`✅ พบตำบล:`, subdistrict);

                                                    const geoData = {
                                                        subdistrict_id: subdistrict.id,
                                                        district_id: district.id,
                                                        province_id: province.id,
                                                        subdistrict_name: subdistrict.subdistrict_name,
                                                        district_name: district.district_name,
                                                        province_name: province.province_name
                                                    };

                                                    // เก็บใน cache
                                                    geographyMapping.set(geoKey, geoData);

                                                    // เพิ่มข้อมูลใน row
                                                    processedRow.subdistrict_id = subdistrict.id;
                                                    processedRow.district_id = district.id;
                                                    processedRow.province_id = province.id;

                                                    stats.foundSubdistricts++;

                                                    console.log(`🎯 Row ${i + 1} - Subdistrict ID: ${subdistrict.id}`);
                                                } else {
                                                    console.log(`❌ ไม่พบตำบล: ${subdistrictName}`);
                                                    stats.notFoundSubdistricts++;
                                                    stats.errors.push(`Row ${i + 1}: ไม่พบตำบล "${subdistrictName}"`);
                                                    geographyMapping.set(geoKey, { subdistrict_id: null });
                                                }
                                            } else {
                                                console.log(`❌ ไม่พบผลลัพธ์การค้นหาตำบล: ${subdistrictName}`);
                                                stats.notFoundSubdistricts++;
                                                stats.errors.push(`Row ${i + 1}: ไม่พบข้อมูลตำบล "${subdistrictName}"`);
                                                geographyMapping.set(geoKey, { subdistrict_id: null });
                                            }
                                        } else {
                                            console.log(`❌ ไม่พบอำเภอ: ${districtName}`);
                                            stats.notFoundSubdistricts++;
                                            stats.errors.push(`Row ${i + 1}: ไม่พบอำเภอ "${districtName}"`);
                                            geographyMapping.set(geoKey, { subdistrict_id: null });
                                        }
                                    } else {
                                        console.log(`❌ ไม่พบผลลัพธ์การค้นหาอำเภอ: ${districtName}`);
                                        stats.notFoundSubdistricts++;
                                        stats.errors.push(`Row ${i + 1}: ไม่พบข้อมูลอำเภอ "${districtName}"`);
                                        geographyMapping.set(geoKey, { subdistrict_id: null });
                                    }
                                } else {
                                    console.log(`❌ ไม่พบจังหวัด: ${provinceName}`);
                                    stats.notFoundSubdistricts++;
                                    stats.errors.push(`Row ${i + 1}: ไม่พบจังหวัด "${provinceName}"`);
                                    geographyMapping.set(geoKey, { subdistrict_id: null });
                                }
                            } else {
                                console.log(`❌ ไม่พบผลลัพธ์การค้นหาจังหวัด: ${provinceName}`);
                                stats.notFoundSubdistricts++;
                                stats.errors.push(`Row ${i + 1}: ไม่พบข้อมูลจังหวัด "${provinceName}"`);
                                geographyMapping.set(geoKey, { subdistrict_id: null });
                            }
                        } catch (geoError) {
                            console.error(`❌ Error processing geography for row ${i + 1}:`, geoError);
                            stats.notFoundSubdistricts++;
                            stats.errors.push(`Row ${i + 1}: เกิดข้อผิดพลาด - ${geoError.message}`);
                            geographyMapping.set(geoKey, { subdistrict_id: null });
                        }
                    }
                } else {
                    console.log(`⚠️ Row ${i + 1}: ข้อมูลที่อยู่ไม่ครบถ้วน`);
                    stats.notFoundSubdistricts++;
                    stats.errors.push(`Row ${i + 1}: ข้อมูลที่อยู่ไม่ครบถ้วน (จังหวัด: "${provinceName}", อำเภอ: "${districtName}", ตำบล: "${subdistrictName}")`);
                }

                processedRows.push(processedRow);

                // อัปเดต progress
                setUploadProgress(((i + 1) / data.length) * 50);
            }

            console.log('📊 สถิติการประมวลผล Geography:', stats);
            setGeographyStats(stats);

            return processedRows;

        } catch (error) {
            console.error('❌ Error in processGeographyData:', error);
            setError(`เกิดข้อผิดพลาดในการประมวลผลข้อมูล Geography: ${error.message}`);
            return data;
        } finally {
            setIsProcessingGeography(false);
        }
    }, []);

    const getCurrentPageData = useCallback(() => {
        const dataToUse = processedData.length > 0 ? processedData : allData;
        if (!dataToUse || dataToUse.length === 0) return [];
        const startIndex = (currentPage - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        return dataToUse.slice(startIndex, endIndex);
    }, [allData, processedData, currentPage]);

    const totalPages = () => {
        const dataToUse = processedData.length > 0 ? processedData : allData;
        return dataToUse ? Math.ceil(dataToUse.length / rowsPerPage) : 0;
    };

    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages()) return;
        setCurrentPage(page);
    };

    const resetState = useCallback(() => {
        setFile(null);
        setFileName('');
        setPreviewData(null);
        setAllData([]);
        setProcessedData([]);
        setHeaders([]);
        setError('');
        setUploading(false);
        setUploadProgress(0);
        setUploadSuccess(false);
        setUploadResults(null);
        setShowInstructions(true);
        setCurrentPage(1);
        setIsProcessingGeography(false);
        setGeographyStats(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, []);

    const processFile = useCallback(async (selectedFile) => {
        setFile(selectedFile);
        setFileName(selectedFile.name);
        setError('');
        setShowInstructions(false);

        const fileExtension = selectedFile.name.split('.').pop().toLowerCase();

        const handleFileData = async (filteredData) => {
            if (filteredData.length === 0) {
                setError("ไม่พบข้อมูลที่ถูกต้องในไฟล์");
                return;
            }

            // ✅ Pre-process วันที่สำหรับการแสดงผลใน Preview
            const preprocessedData = filteredData.map(row => {
                const processedRow = { ...row };

                // แปลงวันที่สำหรับการแสดงผล
                if (processedRow['วันที่เกิดเหตุ']) {
                    const originalDate = processedRow['วันที่เกิดเหตุ'];
                    const displayDate = formatDateForDisplay(originalDate);

                    // เก็บ original สำหรับ processing และ display สำหรับแสดงผล
                    processedRow._originalDate = originalDate;
                    processedRow['วันที่เกิดเหตุ'] = displayDate;

                    console.log(`📅 Date preprocessing: "${originalDate}" → "${displayDate}"`);
                }

                return processedRow;
            });

            const firstValidRow = preprocessedData.find((row, index) => {
                const hasRequiredData = row['เลขที่คดี'] || row['ผู้ต้องหา'];
                return hasRequiredData;
            });

            if (!firstValidRow) {
                setError('ไม่พบข้อมูลที่จำเป็น (เลขที่คดี หรือ ผู้ต้องหา) ในไฟล์');
                return;
            }

            const cleanHeaders = Object.keys(firstValidRow).map(h => h.trim());
            const filteredHeaders = cleanHeaders.filter(header =>
                columnsToDisplay.includes(header) && !header.startsWith('_')
            );

            setHeaders(filteredHeaders);
            setAllData(preprocessedData);
            setPreviewData(preprocessedData.slice(0, 10));

            // ประมวลผลข้อมูล Geography (ใช้ original data)
            console.log('🚀 เริ่มประมวลผลข้อมูล Geography...');
            const originalDataForProcessing = preprocessedData.map(row => {
                const originalRow = { ...row };

                // คืน original date สำหรับ processing
                if (originalRow._originalDate) {
                    originalRow['วันที่เกิดเหตุ'] = originalRow._originalDate;
                    delete originalRow._originalDate;
                }

                return originalRow;
            });

            const processedGeoData = await processGeographyData(originalDataForProcessing);
            setProcessedData(processedGeoData);

            console.log('✅ ประมวลผลข้อมูล Geography เสร็จสิ้น');
        };

        if (fileExtension === 'csv') {
            Papa.parse(selectedFile, {
                header: true,
                skipEmptyLines: true,
                dynamicTyping: true,
                delimitersToGuess: [',', '\t', '|', ';'],
                complete: async (results) => {
                    if (results.errors.length > 0) {
                        setError(`CSV parsing error: ${results.errors[0].message}`);
                        return;
                    }

                    const filteredData = results.data.filter(row =>
                        Object.values(row).some(value => value !== null && value !== '')
                    );

                    await handleFileData(filteredData);
                },
                error: (error) => {
                    setError(`File reading error: ${error.message}`);
                }
            });
        } else if (['xlsx', 'xls'].includes(fileExtension)) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const data = e.target.result;
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];

                    const rawData = XLSX.utils.sheet_to_json(worksheet, {
                        header: 1,
                        defval: null
                    });

                    if (rawData.length === 0) {
                        setError('ไฟล์ Excel ไม่มีข้อมูล');
                        return;
                    }

                    let headerRowIndex = -1;
                    let nameTHColumnIndex = -1;

                    for (let i = 0; i < rawData.length; i++) {
                        const row = rawData[i];
                        if (row) {
                            for (let j = 0; j < row.length; j++) {
                                if (row[j] && row[j].toString().trim() === 'เลขที่คดี') {
                                    headerRowIndex = i;
                                    nameTHColumnIndex = j;
                                    break;
                                }
                            }
                            if (headerRowIndex !== -1) break;
                        }
                    }

                    if (headerRowIndex === -1) {
                        setError('ไม่พบแถวที่มีคอลัมน์ "เลขที่คดี" ในไฟล์');
                        return;
                    }

                    const headerRow = rawData[headerRowIndex];
                    const filteredHeaderRow = headerRow.slice(nameTHColumnIndex);

                    const processedData = [];
                    for (let i = headerRowIndex + 1; i < rawData.length; i++) {
                        if (rawData[i] && rawData[i].some(cell => cell !== null && cell !== '')) {
                            const dataRow = {};
                            for (let j = nameTHColumnIndex; j < headerRow.length; j++) {
                                const headerName = headerRow[j]?.toString().trim() || `Column${j}`;
                                dataRow[headerName] = rawData[i][j];
                            }
                            processedData.push(dataRow);
                        }
                    }

                    if (processedData.length === 0) {
                        setError('ไม่พบข้อมูลหลังจากแถว header ที่มีคอลัมน์ "เลขที่คดี"');
                        return;
                    }

                    const filteredData = processedData.filter(row => {
                        return Object.values(row).some(value => value !== null && value !== '');
                    });

                    await handleFileData(filteredData);
                    setCurrentPage(1);
                } catch (error) {
                    setError(`Excel parsing error: ${error.message}`);
                }
            };
            reader.onerror = () => {
                setError('Error reading Excel file');
            };
            reader.readAsArrayBuffer(selectedFile);
        } else {
            setError('Unsupported file format. Please upload a CSV or Excel file.');
        }
    }, [processGeographyData]);

    useEffect(() => {
        const dataToUse = processedData.length > 0 ? processedData : allData;
        if (dataToUse && dataToUse.length > 0) {
            const currentData = getCurrentPageData();
            setPreviewData(currentData);
        }
    }, [currentPage, allData, processedData, getCurrentPageData]);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);

        const droppedFile = e.dataTransfer.files[0];
        if (!droppedFile) return;

        const fileExtension = droppedFile.name.split('.').pop().toLowerCase();
        if (!['csv', 'xlsx', 'xls'].includes(fileExtension)) {
            setError('Unsupported file format. Please upload a CSV or Excel file.');
            return;
        }

        processFile(droppedFile);
    }, [processFile]);

    const handleFileChange = useCallback((e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
        if (!['csv', 'xlsx', 'xls'].includes(fileExtension)) {
            setError('Unsupported file format. Please upload a CSV or Excel file.');
            return;
        }

        processFile(selectedFile);
    }, [processFile]);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleUpload = useCallback(async () => {
        const dataToUpload = processedData.length > 0 ? processedData : allData;
        if (!file || !dataToUpload || dataToUpload.length === 0) return;

        setUploading(true);
        setUploadProgress(50); // เริ่มที่ 50% เพราะใช้ไปแล้วใน geography processing
        setError('');

        try {
            // อัปเดต progress แบบ real-time
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) return prev;
                    return prev + Math.random() * 10;
                });
            }, 500);

            // เรียกใช้ CSVUploadService
            const result = await CSVUploadService.uploadCSVData(dataToUpload, fileName);

            clearInterval(progressInterval);
            setUploadProgress(100);

            if (result.success) {
                setUploadSuccess(true);
                setUploadResults(result.data);
                console.log('Upload successful:', result);

                // รีเซ็ตหลังจาก 5 วินาที
                setTimeout(() => {
                    resetState();
                }, 5000);
            } else {
                throw new Error(result.message || 'Upload failed');
            }

        } catch (error) {
            console.error('Upload error:', error);
            setError(`การอัปโหลดล้มเหลว: ${error.message}`);
            setUploadProgress(0);
        } finally {
            setUploading(false);
        }
    }, [file, allData, processedData, fileName, resetState]);

    const handleClearFile = useCallback(() => {
        resetState();
    }, [resetState]);

    // ✅ ลบปุ่มทดสอบ encoding ออก หรือปรับให้ทดสอบแบบง่ายๆ
    const handleTestCaseQuery = () => {
        console.log('🧪 Testing Case Query...');

        const testCases = ['1/2568', '2/2568', '3/2568'];
        testCases.forEach(async (caseId) => {
            try {
                const result = await CSVUploadService.testCaseIdQuery(caseId);
                console.log(`🧪 Test result for "${caseId}":`, result);
            } catch (error) {
                console.error(`🧪 Test failed for "${caseId}":`, error);
            }
        });
    };

    // ✅ อัปเดต return JSX - ลบปุ่มทดสอบ encoding หรือปรับให้เรียบง่าย
    return (
        <div className="flex flex-col w-full h-full bg-slate-50 overflow-auto">
            <div className="container mx-auto p-4 md:p-6 flex-grow">
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Database className="text-[#990000]" size={24} />
                        <h2 className="text-base font-semibold text-gray-800">
                            นำเข้าข้อมูลลงฐานข้อมูล CSV/Excel
                        </h2>
                    </div>

                    {!file && (
                    <div
                        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                        isDragging ? 'border-[#990000] bg-[#ffecec]' : 'border-gray-300 hover:border-[#990000]'
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current.click()}
                    >
                        <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileChange}
                        />
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm font-medium text-gray-600">
                        คลิกเพื่อเลือกไฟล์ หรือ ลากและวางไฟล์ที่นี่
                        </p>
                        <p className="text-xs text-gray-500">
                        รองรับรูปแบบไฟล์: CSV และ Excel (.xlsx, .xls)
                        </p>
                    </div>
                    )}

                    {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
                        <AlertCircle className="text-red-500 mr-2 flex-shrink-0" size={20} />
                        <p className="text-red-700 text-sm">{error}</p>
                    </div>
                    )}

                    {/* แสดงสถานะการประมวลผล Geography */}
                    {isProcessingGeography && (
                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                            <div className="flex items-center">
                                <MapPin className="animate-pulse mr-2 text-blue-600" size={20} />
                                <span className="font-medium text-blue-800">กำลังประมวลผลข้อมูลที่อยู่...</span>
                            </div>
                            <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                            </div>
                            <p className="text-sm text-blue-600 mt-1">กำลังค้นหาและจับคู่ข้อมูลจังหวัด อำเภอ และตำบล</p>
                        </div>
                    )}

                    {/* แสดงสถิติ Geography */}
                    {geographyStats && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                            <div className="flex items-center gap-2 mb-2">
                                <MapPin className="text-green-600" size={20} />
                                <h4 className="font-medium text-green-800">สถิติการประมวลผลข้อมูลที่อยู่</h4>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex justify-between">
                                    <span>ข้อมูลทั้งหมด:</span>
                                    <span className="font-medium">{geographyStats.totalRows} รายการ</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>จับคู่สำเร็จ:</span>
                                    <span className="text-green-600 font-medium">{geographyStats.foundSubdistricts} รายการ</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>ไม่พบข้อมูล:</span>
                                    <span className="text-red-600 font-medium">{geographyStats.notFoundSubdistricts} รายการ</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>อัตราสำเร็จ:</span>
                                    <span className="text-blue-600 font-medium">
                                        {((geographyStats.foundSubdistricts / geographyStats.totalRows) * 100).toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                            {geographyStats.errors.length > 0 && (
                                <details className="mt-3 cursor-pointer">
                                    <summary className="text-red-600 text-sm font-medium">
                                        รายละเอียดปัญหา ({geographyStats.errors.length} รายการ)
                                    </summary>
                                    <div className="mt-2 max-h-32 overflow-y-auto">
                                        {geographyStats.errors.slice(0, 10).map((error, index) => (
                                            <div key={index} className="text-xs text-red-600 bg-red-50 p-2 mb-1 rounded">
                                                {error}
                                            </div>
                                        ))}
                                        {geographyStats.errors.length > 10 && (
                                            <div className="text-xs text-gray-500 text-center p-2">
                                                และอีก {geographyStats.errors.length - 10} รายการ...
                                            </div>
                                        )}
                                    </div>
                                </details>
                            )}
                        </div>
                    )}

                    {file && !error && (
                    <div className="mt-4">
                        <div className="flex items-center justify-between p-3 bg-[#ffecec] border border-[#ffcccc] rounded-md">
                            <div className="flex items-center">
                                <FileSpreadsheet className="text-[#990000] mr-2" size={20} />
                                <span className="font-medium text-[#990000]">{fileName}</span>
                            </div>
                            <button
                                onClick={handleClearFile}
                                className="text-gray-500 hover:text-red-500 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>
                    )}

                    {previewData && headers.length > 0 && (
                    <div className="mt-6">
                        <h3 className="font-medium text-gray-700 mb-2">
                            แสดงข้อมูลไฟล์
                        </h3>
                        <div className="overflow-x-auto border border-gray-200 rounded-md">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {headers.map((header, index) => (
                                            columnsToDisplay.includes(header) && (
                                                <th
                                                    key={index}
                                                    className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                >
                                                    {header}
                                                </th>
                                            )
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {previewData.map((row, rowIndex) => (
                                        <tr key={rowIndex}>
                                            {headers.map((header, colIndex) => (
                                                columnsToDisplay.includes(header) && (
                                                    <td
                                                        key={`${rowIndex}-${colIndex}`}
                                                        className="px-4 py-2 text-sm text-gray-900 whitespace-nowrap"
                                                    >
                                                        <div title={`Raw: ${row[header]} | Display: ${formatDateForDisplay(row[header])}`}>
                                                            {formatDateForDisplay(row[header])}
                                                        </div>
                                                    </td>
                                                )
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {((processedData.length > 0 ? processedData : allData).length > rowsPerPage) && (
                            <div className="mt-4 flex items-center justify-between">
                                <p className="text-sm text-gray-500">
                                    แสดง {((currentPage - 1) * rowsPerPage) + 1} - {Math.min(currentPage * rowsPerPage, (processedData.length > 0 ? processedData : allData).length)} จากทั้งหมด {(processedData.length > 0 ? processedData : allData).length} รายการ
                                </p>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="p-1 rounded-md border border-gray-300 disabled:opacity-50"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <div className="text-sm">
                                        หน้า {currentPage} จาก {totalPages()}
                                    </div>
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages()}
                                        className="p-1 rounded-md border border-gray-300 disabled:opacity-50"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    )}

                    {file && !error && (
                        <div className="mt-6">
                            {uploadSuccess && uploadResults ? (
                                <div className="space-y-3">
                                    <div className="flex items-center text-green-600 bg-green-50 p-3 rounded-md">
                                        <CheckCircle className="mr-2" size={20} />
                                        <span>อัปโหลดข้อมูลลงฐานข้อมูลสำเร็จ!</span>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-md">
                                        <h4 className="font-medium text-gray-700 mb-2">สรุปผลการอัปโหลด:</h4>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div className="flex justify-between">
                                                <span>สำเร็จ:</span>
                                                <span className="text-green-600 font-medium">{uploadResults.successful} รายการ</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>ไม่สำเร็จ:</span>
                                                <span className="text-red-600 font-medium">{uploadResults.failed} รายการ</span>
                                            </div>
                                        </div>
                                        {uploadResults.errors && uploadResults.errors.length > 0 && (
                                            <div className="mt-3">
                                                <details className="cursor-pointer">
                                                    <summary className="text-red-600 text-sm font-medium">
                                                        รายละเอียดข้อผิดพลาด ({uploadResults.errors.length} รายการ)
                                                    </summary>
                                                    <div className="mt-2 max-h-32 overflow-y-auto">
                                                        {uploadResults.errors.map((error, index) => (
                                                            <div key={index} className="text-xs text-red-600 bg-red-50 p-2 mb-1 rounded">
                                                                {error.error}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </details>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : uploading ? (
                                <div className="space-y-3">
                                    <div className="flex items-center">
                                        <Loader2 className="animate-spin mr-2 text-[#990000]" size={20} />
                                        <span className="font-medium text-[#990000]">กำลังอัปโหลดข้อมูลลงฐานข้อมูล...</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div
                                            className="bg-[#990000] h-3 rounded-full transition-all duration-300"
                                            style={{ width: `${uploadProgress}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>กำลังประมวลผลข้อมูล...</span>
                                        <span>{Math.round(uploadProgress)}%</span>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={handleUpload}
                                    disabled={!previewData || isProcessingGeography}
                                    className="w-full px-4 py-3 bg-[#990000] text-white rounded-md hover:bg-[#7a0000] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                                >
                                    <Database size={20} />
                                    อัปโหลดข้อมูลลงฐานข้อมูล ({(processedData.length > 0 ? processedData : allData).length} รายการ)
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {showInstructions && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                            <AlertTriangle className="text-amber-500" size={20} />
                            คำแนะนำการใช้งาน
                        </h3>
                        <ol className="list-decimal pl-5 space-y-3 text-gray-600">
                            <li>อัปโหลดไฟล์ CSV หรือ Excel โดยคลิกที่พื้นที่อัปโหลด หรือลากไฟล์มาวาง</li>
                            <li>ตรวจสอบตัวอย่างข้อมูลเพื่อให้แน่ใจว่าข้อมูลถูกต้อง</li>
                            <li><strong>ระบบจะประมวลผลข้อมูลที่อยู่อัตโนมัติ</strong> เพื่อหา Subdistrict ID</li>
                            <li>คลิก "อัปโหลดข้อมูลลงฐานข้อมูล" เพื่อบันทึกข้อมูลลงระบบ</li>
                            <li>ระบบจะสร้าง Case, Defendant, และ Evidence โดยอัตโนมัติ</li>
                        </ol>
                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                            <h4 className="font-medium text-blue-900 mb-2">ข้อมูลที่จำเป็น:</h4>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• <strong>เลขที่คดี</strong> - จำเป็นสำหรับการสร้างคดี</li>
                                <li>• <strong>ผู้ต้องหา</strong> - จำเป็นสำหรับการสร้างข้อมูลจำเลย</li>
                                <li>• <strong>ลำดับของกลาง</strong> - สำหรับจัดเรียงของกลาง</li>
                                <li>• <strong>วันที่เกิดเหตุ</strong> - รูปแบบ DD/MM/YYYY หรือ YYYY-MM-DD</li>
                                <li>• <strong>จังหวัด, อำเภอ, ตำบล</strong> - ระบบจะแปลงเป็น ID อัตโนมัติ</li>
                            </ul>
                        </div>

                        <div className="mt-4 p-3 bg-[#ffecec] border border-[#ffcccc] rounded-md">
                            <p className="text-sm text-[#990000]">
                                <strong>หมายเหตุ:</strong> ระบบจะประมวลผลข้อมูลที่อยู่และแปลงเป็น ID โดยอัตโนมัติ
                                หากมีคดีหรือจำเลยที่มีอยู่แล้วในระบบ จะใช้ข้อมูลที่มีอยู่
                            </p>
                        </div>
                    </div>
                )}
                <div className="h-16 md:h-0"></div>
            </div>
        </div>
    )
}

export default Upload_Csv_File
