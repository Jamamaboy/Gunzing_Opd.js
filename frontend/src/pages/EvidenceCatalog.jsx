import React, { useState, useEffect } from 'react';
import PrimaryBar from '../components/PrimaryBar';
import SecondaryBar from '../components/SecondaryBar';
import Navigation from '../components/Navigation';
import DrugCatalog from '../components/EvidenceCatalog/DrugCatalog';
const EvidenceCatalog = () => {
  return (
    <div className='h-screen flex flex-col'>
      <div className='hidden sm:block'>
        <PrimaryBar />
        <SecondaryBar />
      </div>
      <div className='flex flex-1 overflow-hidden'>
        <Navigation />
        <div className="flex-1 overflow-auto">
          <DrugCatalog />
        </div>
      </div>
    </div>
  );
};

export default EvidenceCatalog
