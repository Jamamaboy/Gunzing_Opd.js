import { Link } from 'react-router-dom';
// import logo from '../../public/raven_logo_2.png';

const PrimaryBar = () => {
  return (
    <div className="h-[48px] bg-gradient-to-r from-[#990000] to-[#330000] flex items-center px-4 sm:px-6 justify-between text-white w-full">
      <div className="flex items-center space-x-2">
        {/* Logo Image */}
        {/* <img src={logo} alt="RAVEN Logo" className="h-8 w-auto" /> */}

        {/* Logo Text */}
        <Link to="/home" className="leading-tight">
          <h1 className="text-xl font-bold text-white m-0 leading-none">RAVEN</h1>
          <p className="text-[2.7px] text-white m-0 leading-none tracking-wide">
            RAPID ANALYSIS FOR VIOLENT EVIDENCE &amp; NARCOTICS
          </p>
        </Link>
      </div>
    </div>
  );
};

export default PrimaryBar;
