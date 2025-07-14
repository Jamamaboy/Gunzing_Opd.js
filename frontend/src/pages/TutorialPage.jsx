import React from 'react';
import BottomBar2 from '../components/Tutorial/Bottombar2';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Tutorial } from '../data/tutorialData';

const TutorialPage = () => {
  const navigate = useNavigate();
  const handleGoBack = () => {
      navigate(-1);
    };
  return (
    <div className='flex flex-col h-screen justify-between'>
      <div className="relative p-4 flex justify-start items-center bg-white border-b">
        <button
          onClick={handleGoBack}
          className="p-2 rounded-full hover:bg-gray-800/50 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-black" />
          </button>
          <span className="text-black font-normal ml-2">คู่มือการใช้งาน</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div>
          <span className="text-2xl font-semibold mb-4">{Tutorial.title}</span>
          <img src={Tutorial.image} alt="Tutorial" className="w-full h-auto rounded mb-4 border border-gray-400" />
          <p className="text-gray-600 text-sm mb-2">{Tutorial.description}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
           <ul className="list-disc text-sm pl-5 text-gray-600">
                      {Tutorial.bullets.map((bullet, index) => (
                        <li key={index} className="mb-1">{bullet}</li>
                      ))}
                    </ul>
          </div>
        </div>
      </div>
      <div className='w-full h-16 bg-gray-100 border-b flex items-center justify-center'>
        <BottomBar2 />
      </div>
    </div>
	);
};

export default TutorialPage;
