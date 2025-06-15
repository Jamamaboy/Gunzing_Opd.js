export const dataURLtoFile = (dataurl, filename) => {
    if (!dataurl) {
        console.error('Data URL is null or undefined');
        return null;
    }
    
    const arr = dataurl.split(',');
    if (!arr || arr.length < 2) {
        console.error('Invalid data URL format:', dataurl.substring(0, 20) + '...');
        return null;
    }
    
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch || !mimeMatch[1]) {
        console.error('Could not extract MIME type from data URL');
        return null;
    }
    
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new File([u8arr], filename, { type: mime });
};

export const isPillForm = (evidenceType) => {
    const pillTypes = ['เม็ด', 'เม็ดยา', 'ยาเม็ด', 'แคปซูล', 'ยาแคปซูล'];
    return pillTypes.includes(evidenceType);
};

export const isPackageForm = (evidenceType) => {
    const packageTypes = ['หีบห่อ', 'ซอง', 'บรรจุภัณฑ์', 'แพคเกจ'];
    return packageTypes.includes(evidenceType);
};