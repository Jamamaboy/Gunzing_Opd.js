export const checkUserRole = (user, allowedRoles) => {
    if (!user || !user.role) {
        return false;
    }
    
    const userRole = user.role.role_name?.toLowerCase() || '';
    const normalizedAllowedRoles = allowedRoles.map(role => role.toLowerCase());
    
    return normalizedAllowedRoles.includes(userRole);
};

export const getUserRole = (user) => {
    return user?.role?.role_name || null;
};

export const getUserDepartment = (user) => {
    return user?.department || null;
};

export const isAdmin = (user) => {
    const userRole = getUserRole(user)?.toLowerCase();
    return userRole === 'admin';
};

// ✅ เพิ่มฟังก์ชันตรวจสอบทั้ง role และ department
export const hasFirearmAccess = (user) => {
    if (!user || !user.role) {
        return false;
    }
    
    const userRole = user.role.role_name?.toLowerCase() || '';
    const userDepartment = user.department || '';
    
    // ตรวจสอบ role ที่อนุญาต
    const allowedRoles = ['admin'];
    const hasValidRole = allowedRoles.includes(userRole);
    
    // ตรวจสอบ department ที่อนุญาต (เฉพาะสำหรับ admin)
    const allowedDepartments = ['กลุ่มงานอาวุธปืน'];
    const hasValidDepartment = allowedDepartments.includes(userDepartment);
    
    // สำหรับ Admin: ต้องมีทั้ง role และ department ที่ถูกต้อง
    if (userRole === 'admin') {
        return hasValidRole && hasValidDepartment;
    }
    
    return false;
};

// ✅ เพิ่มฟังก์ชันตรวจสอบเฉพาะ department
export const hasFirearmDepartmentAccess = (user) => {
    if (!user) return false;
    
    const userDepartment = user.department || '';
    const allowedDepartments = ['กลุ่มงานอาวุธปืน'];
    
    return allowedDepartments.includes(userDepartment);
};

// ✅ เพิ่มฟังก์ชันตรวจสอบแยกแต่ละส่วน
export const canAccessFirearmManagement = (user) => {
    const hasRole = checkUserRole(user, ['admin']);
    const hasDepartment = hasFirearmDepartmentAccess(user);
    
    return {
        hasRole,
        hasDepartment,
        canAccess: hasRole && hasDepartment,
        reason: !hasRole ? 'ไม่มีสิทธิ์ในระดับ Admin' : 
                !hasDepartment ? 'ไม่ได้อยู่ในกลุ่มงานอาวุธปืน' : 
                'อนุญาต'
    };
};