import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const DrugIcon = ({ size = 24, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path fill="currentColor" d="M28.987 7.898c-1.618-2.803-5.215-3.779-8.010-2.146-9.273 5.417-6.35 3.666-15.822 9.135v0c-2.803 1.618-3.764 5.207-2.146 8.010s5.214 3.777 8.010 2.146c9.447-5.512 6.518-3.772 15.822-9.135 2.804-1.616 3.765-5.207 2.146-8.010zM26.544 15.141l-7.751 4.475c0.424-0.245 0.679-0.623 0.796-1.089 1.068-0.623 2.463-1.428 5.298-3.054 0.834-0.478 1.459-1.163 1.851-1.969l-0-0c0.654-1.343 0.644-2.99-0.153-4.376-0.115-0.2-0.262-0.368-0.401-0.544 0.679 2.050-0.15 4.373-2.097 5.489-2.236 1.282-3.578 2.057-4.571 2.636-0.417-1.701-1.638-3.688-2.945-4.926-1.888 1.115-2.616 1.559-7.348 4.271-1.921 1.101-2.752 3.377-2.122 5.407-0.023-0.012-0.046-0.024-0.069-0.036-0.109-0.135-0.217-0.27-0.306-0.426-0.797-1.387-0.807-3.033-0.153-4.376l-0-0c0.392-0.806 1.017-1.49 1.851-1.969 4.175-2.393 5.228-3.010 6.71-3.88-0.534-0.23-1.037-0.262-1.455-0.017l7.751-4.475c5.215-3.011 10.413 5.8 5.115 8.859z"></path>
  </svg>
);

const UploadIcon = ({ size = 24, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 266 266"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path fill="currentColor" d="M235.829,213.645c-0.038-0.676-0.088-1.35-0.153-2.018c-0.008-0.078-0.012-0.157-0.021-0.236
	c-0.075-0.731-0.17-1.455-0.277-2.176c-0.029-0.195-0.06-0.389-0.091-0.583c-0.097-0.607-0.204-1.211-0.323-1.811
	c-0.026-0.131-0.048-0.263-0.075-0.394c-0.144-0.695-0.305-1.384-0.477-2.068c-0.05-0.197-0.103-0.393-0.155-0.589
	c-0.144-0.542-0.297-1.081-0.459-1.615c-0.053-0.176-0.103-0.353-0.158-0.528c-0.205-0.65-0.424-1.295-0.654-1.933
	c-0.074-0.206-0.153-0.409-0.23-0.613c-0.18-0.479-0.368-0.955-0.563-1.427c-0.087-0.211-0.172-0.423-0.262-0.632
	c-0.257-0.601-0.526-1.195-0.806-1.783c-0.104-0.219-0.214-0.435-0.322-0.652c-0.205-0.414-0.415-0.824-0.63-1.231
	c-0.128-0.241-0.255-0.483-0.387-0.723c-0.301-0.546-0.61-1.086-0.931-1.619c-0.141-0.235-0.29-0.465-0.435-0.697
	c-0.218-0.348-0.439-0.694-0.665-1.037c-0.174-0.263-0.349-0.526-0.527-0.786c-0.258-0.375-0.522-0.744-0.79-1.111
	c-0.267-0.366-0.54-0.729-0.817-1.087c-0.218-0.282-0.436-0.563-0.66-0.839c-0.223-0.276-0.448-0.551-0.677-0.822
	c-0.216-0.256-0.437-0.507-0.657-0.759c-0.394-0.448-0.795-0.89-1.205-1.324c-0.202-0.214-0.404-0.429-0.61-0.64
	c-0.274-0.28-0.551-0.557-0.832-0.83c-0.189-0.185-0.382-0.366-0.575-0.548c-0.51-0.482-1.03-0.953-1.56-1.413
	c-0.174-0.151-0.347-0.304-0.523-0.453c-0.32-0.27-0.644-0.534-0.971-0.796c-0.177-0.142-0.357-0.282-0.536-0.421
	c-0.635-0.495-1.281-0.974-1.94-1.438c-0.12-0.084-0.237-0.171-0.357-0.254c-0.359-0.248-0.723-0.489-1.089-0.728
	c-0.177-0.116-0.356-0.229-0.534-0.343c-0.811-0.515-1.635-1.01-2.477-1.478l0,0c-7.11-3.95-15.29-6.208-24-6.208
	c-27.338,0-49.5,22.162-49.5,49.5c0,21.257,13.402,39.379,32.214,46.392c0.502,0.187,1.013,0.359,1.523,0.53
	c0.215,0.072,0.427,0.148,0.643,0.218c0.458,0.147,0.922,0.281,1.387,0.416c0.279,0.081,0.558,0.163,0.839,0.238
	c0.432,0.116,0.868,0.224,1.304,0.329c0.326,0.078,0.652,0.155,0.981,0.226c0.41,0.09,0.821,0.174,1.234,0.253
	c0.37,0.071,0.743,0.137,1.116,0.199c0.384,0.065,0.769,0.128,1.156,0.184c0.422,0.061,0.846,0.112,1.272,0.162
	c0.35,0.042,0.7,0.085,1.052,0.119c0.501,0.048,1.006,0.082,1.512,0.115c0.286,0.019,0.57,0.044,0.857,0.058
	c0.799,0.039,1.602,0.061,2.411,0.061c0.806,0,1.607-0.023,2.403-0.061c0.267-0.013,0.531-0.036,0.797-0.053
	c0.527-0.034,1.053-0.07,1.576-0.12c0.316-0.03,0.63-0.069,0.944-0.105c0.468-0.054,0.935-0.111,1.398-0.178
	c0.332-0.048,0.662-0.101,0.992-0.155c0.441-0.073,0.881-0.151,1.318-0.235c0.336-0.065,0.67-0.132,1.003-0.203
	c0.429-0.092,0.855-0.192,1.28-0.295c0.33-0.08,0.66-0.159,0.988-0.246c0.43-0.114,0.856-0.239,1.282-0.364
	c0.312-0.092,0.626-0.179,0.935-0.276c0.491-0.155,0.975-0.324,1.459-0.494c0.235-0.082,0.474-0.157,0.707-0.243
	c1.49-0.548,2.947-1.164,4.366-1.848h0c0.028-0.014,0.056-0.029,0.085-0.042c0.615-0.297,1.22-0.61,1.82-0.932
	c0.187-0.1,0.373-0.203,0.558-0.306c0.482-0.267,0.959-0.541,1.431-0.823c0.152-0.091,0.306-0.179,0.457-0.271
	c0.596-0.365,1.185-0.742,1.764-1.131c0.138-0.092,0.272-0.189,0.409-0.283c0.459-0.315,0.912-0.637,1.359-0.967
	c0.171-0.126,0.341-0.252,0.51-0.38c0.511-0.386,1.015-0.781,1.51-1.186c0.053-0.044,0.108-0.085,0.161-0.129
	c0.54-0.446,1.067-0.907,1.587-1.375c0.152-0.136,0.301-0.276,0.451-0.414c0.399-0.368,0.792-0.742,1.178-1.123
	c0.132-0.13,0.267-0.259,0.397-0.391c0.491-0.495,0.974-0.999,1.444-1.515c0.096-0.105,0.188-0.214,0.283-0.32
	c0.384-0.427,0.76-0.862,1.128-1.302c0.135-0.161,0.269-0.323,0.402-0.486c0.383-0.47,0.759-0.947,1.125-1.431
	c0.064-0.085,0.131-0.167,0.194-0.252c0.419-0.562,0.824-1.135,1.22-1.716c0.11-0.161,0.217-0.325,0.325-0.488
	c0.302-0.454,0.597-0.914,0.884-1.378c0.102-0.165,0.205-0.329,0.305-0.495c0.364-0.604,0.717-1.215,1.055-1.835
	c0.052-0.095,0.1-0.193,0.152-0.289c0.288-0.538,0.566-1.082,0.835-1.631c0.092-0.188,0.183-0.377,0.272-0.566
	c0.254-0.535,0.498-1.075,0.733-1.621c0.052-0.122,0.108-0.241,0.16-0.364c0.276-0.657,0.537-1.322,0.786-1.992
	c0.064-0.173,0.124-0.347,0.186-0.521c0.189-0.529,0.37-1.062,0.541-1.599c0.061-0.192,0.124-0.383,0.183-0.576
	c0.212-0.691,0.412-1.388,0.594-2.092c0.016-0.061,0.029-0.123,0.044-0.184c0.165-0.649,0.314-1.303,0.453-1.962
	c0.043-0.206,0.084-0.413,0.125-0.62c0.115-0.582,0.219-1.167,0.313-1.755c0.025-0.156,0.053-0.31,0.077-0.466
	c0.109-0.727,0.202-1.46,0.279-2.197c0.018-0.175,0.031-0.352,0.048-0.528c0.055-0.588,0.1-1.179,0.135-1.772
	c0.012-0.213,0.025-0.427,0.035-0.641c0.034-0.755,0.058-1.513,0.058-2.277c0-0.76-0.023-1.515-0.057-2.266
	C235.85,214.037,235.84,213.841,235.829,213.645z M201.416,247h-34c-4.143,0-7.5-3.357-7.5-7.5s3.357-7.5,7.5-7.5h34
	c4.143,0,7.5,3.357,7.5,7.5S205.559,247,201.416,247z M208.148,206.321c-2.936,2.922-7.85,2.91-10.774-0.023l-4.291-4.144V217
	c0,4.143-3.357,7.5-7.5,7.5s-7.5-3.357-7.5-7.5v-14.917l-4.066,4.226c-2.933,2.926-7.596,2.92-10.524-0.01
	c-2.926-2.932-2.88-7.681,0.051-10.607l17.012-16.96c0.373-0.377,0.798-0.717,1.248-1.011c0.002-0.002,0.009-0.002,0.011-0.004
	c0.536-0.35,1.115-0.377,1.713-0.577c0.78-0.262,1.588-0.14,2.386-0.14c0.008,0,0.016,0,0.023,0c0.765,0,1.534-0.129,2.281,0.112
	c0.677,0.218,1.325,0.408,1.923,0.816c0.002,0,0.003-0.062,0.005-0.06c0.406,0.277,0.781,0.562,1.122,0.908l16.898,16.944
	C211.09,198.656,211.081,203.397,208.148,206.321z M205.057,49h-46.974V3.731L205.057,49z M121.917,216.5
	c0-35.565,28.768-64.5,64.333-64.5c8.48,0,16.833,1.661,23.833,4.649V64h-59.167c-4.143,0-7.833-3.357-7.833-7.5V0H37.916
	c-4.143,0-7.833,3.357-7.833,7.5v247.465c0,4.133,3.509,7.486,7.642,7.5l103.77,0.336
	C129.384,251.069,121.917,234.654,121.917,216.5z M69.416,93h99c4.143,0,7.5,3.357,7.5,7.5s-3.357,7.5-7.5,7.5h-99
	c-4.143,0-7.5-3.357-7.5-7.5S65.274,93,69.416,93z M61.916,131.5c0-4.143,3.357-7.5,7.5-7.5h99c4.143,0,7.5,3.357,7.5,7.5
	s-3.357,7.5-7.5,7.5h-99C65.274,139,61.916,135.643,61.916,131.5z" />
  </svg>
);

const CaseIcon = ({ size = 24, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 300 300"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >  
    <g transform="translate(0.000000,300.000000) scale(0.100000,-0.100000)" 
    fill="#000000" 
    stroke="none"
    >
      <path d="M326 2978 c-13 -18 -16 -51 -16 -155 l0 -133 -133 0 c-104 0 -137 -3 -155 -16 l-22 -15 0 -1314 c0 -1181 2 -1315 16 -1329 14 -14 121 -16 1033 -16 778 0 1020 3 1029 12 8 8 12 57 12 155 l0 143 136 0 c74 0 143 4 153 9 14 8 46 -18 177 -143 87 -84 169 -158 181 -164 54 -29 85 -13 191 100 62 67 72 82 72 114 0 33 -10 47 -93 131 -50 53 -141 140 -200 195 -103 95 -110 100 -145 95 -34 -4 -42 0 -103 60 l-67 65 28 57 c81 162 84 372 10 546 -19 45 -20 70 -20 658 l0 611 -177 178 -177 178 -858 0 -857 0 -15 -22z m1664 -215 c0 -193 -10 -183 177 -183 l143 0 0 -511 0 -511 -52 46 c-28 25 -78 59 -110 76 l-58 31 0 312 0 313 -178 177 -178 177 -662 0 -662 0 0 110 0 110 790 0 790 0 0 -147z m180 -8 l74 -75 -82 0 -82 0 0 75 c0 41 3 75 8 75 4 0 41 -34 82 -75z m-490 -313 c0 -102 4 -152 12 -160 8 -8 58 -12 160 -12 l148 0 0 -265 0 -264 -32 7 c-67 15 -260 7 -318 -12 -91 -30 -190 -87 -251 -143 l-57 -53 -444 0 c-385 0 -446 -2 -466 -16 -27 -19 -29 -60 -3 -74 13 -6 166 -10 430 -10 l410 0 -25 -55 c-14 -30 -33 -86 -42 -124 l-17 -71 -365 0 c-315 0 -369 -2 -388 -16 -26 -18 -28 -46 -6 -68 13 -14 62 -16 384 -16 l369 0 6 -47 c3 -27 17 -83 29 -125 l24 -78 -398 0 c-349 0 -401 -2 -414 -16 -20 -20 -20 -48 0 -68 14 -14 67 -16 439 -16 l424 0 83 -83 c140 -142 302 -205 497 -194 53 2 104 8 114 12 16 7 17 -6 17 -189 l0 -196 -952 2 -953 3 -3 1248 -2 1247 795 0 795 0 0 -148z m175 -2 l80 -80 -83 0 -82 0 0 80 c0 44 1 80 3 80 1 0 38 -36 82 -80z m145 -798 c173 -60 292 -173 357 -338 25 -62 27 -81 27 -194 0 -108 -3 -133 -23 -185 -75 -190 -227 -320 -421 -361 -281 -59 -570 123 -645 406 -19 72 -19 211 0 285 50 189 224 356 418 401 80 18 214 11 287 -14z m450 -1063 c0 -3 -9 -14 -20 -24 -21 -19 -22 -18 -77 38 -56 55 -56 57 -39 76 18 20 19 20 77 -32 33 -28 59 -54 59 -58z m-140 -121 l0 -48 -110 0 -110 0 0 50 c0 49 0 50 48 74 26 13 56 31 67 40 19 14 23 12 63 -27 38 -37 42 -46 42 -89z m429 -66 c89 -85 161 -159 161 -165 0 -14 -110 -127 -124 -127 -9 0 -327 307 -334 322 -6 12 110 129 124 126 7 -2 85 -72 173 -156z"/> 
      <path d="M422 2218 c-15 -15 -15 -51 0 -66 17 -17 899 -17 916 0 15 15 15 51 0 66 -17 17 -899 17 -916 0z"/>
      <path d="M422 1868 c-18 -18 -14 -56 7 -68 14 -7 220 -9 627 -8 594 3 607 3 619 23 9 13 10 28 4 43 l-8 22 -619 0 c-467 0 -621 -3 -630 -12z"/>
      <path d="M428 479 c-25 -14 -22 -55 4 -73 34 -24 1072 -24 1106 0 26 18 28 46 6 68 -14 14 -78 16 -557 16 -350 -1 -548 -4 -559 -11z"/>
      <path d="M1699 1571 c-183 -58 -309 -203 -340 -389 -39 -238 118 -475 358 -537 326 -85 639 197 592 533 -26 187 -170 349 -354 397 -78 20 -186 18 -256 -4z m213 -82 c120 -26 218 -104 271 -217 29 -61 32 -76 32 -162 0 -86 -3 -101 -32 -162 -55 -116 -156 -193 -286 -219 -159 -32 -336 61 -413 216 -26 55 -29 69 -29 165 0 93 3 112 27 162 48 103 150 186 263 214 65 16 102 17 167 3z"/>
    </g> 
  </svg> 
);

const AzureServicesCard = ({ icon, title, subtitle, to }) => {
    const navigate = useNavigate();
    return (
      <div
        className="flex flex-col items-center justify-center p-4 bg-white rounded-md cursor-pointer hover:bg-gray-50 transition-colors w-24 h-24 text-center"
        onClick={() => to && navigate(to)}
      >
        <div className="text-blue-500 mb-2">
          {icon}
        </div>
        <div className="text-xs font-medium">{title}</div>
        {subtitle && <div className="text-xs text-gray-600">{subtitle}</div>}
      </div>
    );
};

const DesktopLayout = () => {
    const services = [
      {
        icon: <DrugIcon size={24} className="text-blue-500" />,
        title: "จัดการยาเสพติด",
        to: "/admin/narcotics/catalog-management"
      },
      {
        icon: <UploadIcon size={24} className="text-blue-500" />,
        title: "อัพโหลดคดียาเสพติด",
        to: "/admin/narcotics/upload-narcotic-case"
      },
      {
        icon: <CaseIcon size={24} className="text-blue-500" />,
        title: "คดียาเสพติด",
        to: "/admin/narcotics/case"
      }
    ];

    return (
        <div className="h-full w-full flex flex-col overflow-hidden">
            <div className="px-6 pt-4 flex justify-between items-center flex-shrink-0">
                <h2 className="text-xl font-semibold text-gray-800">บริการ</h2>
            </div>
            <div className="flex space-x-4 overflow-x-auto pb-4">
              {services.map((service, index) => (
                  <AzureServicesCard 
                  key={index}
                  icon={service.icon}
                  title={service.title}
                  subtitle={service.subtitle}
                  to={service.to}
                  />
              ))}
            </div>
        </div>
    )
}

const NarcoticsAdminHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [unauthorized, setUnauthorized] = useState(false);
  
  // Check if user has the correct role and department
  useEffect(() => {
    if (!user) return;
    
    const isAuthorized = user.role?.id === 2 && user.department === "กลุ่มงานยาเสพติด";
    
    if (!isAuthorized) {
      setUnauthorized(true);
      // Redirect to home page after 3 seconds if unauthorized
      const timer = setTimeout(() => {
        navigate('/home');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [user, navigate]);

  // If user is not authorized, show access denied message
  if (unauthorized) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-red-600 mb-4">ไม่มีสิทธิ์เข้าถึง</h1>
          <p className="text-gray-600 mb-6">
            คุณไม่มีสิทธิ์ในการเข้าถึงหน้านี้ หน้านี้สำหรับผู้ใช้ที่มีบทบาทเป็นแผนกอาวุธปืนเท่านั้น
          </p>
          <p className="text-gray-500">กำลังนำคุณกลับไปยังหน้าหลัก...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className='w-full h-full'>
        <div className='hidden md:block h-full'>
            <DesktopLayout />
        </div>
    </div>
  )
}

export default NarcoticsAdminHome;
