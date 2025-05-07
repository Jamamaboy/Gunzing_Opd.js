import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom'
import PrimaryBar from "./PrimaryBar";
import SecondaryBar from "./SecondaryBar";
import Navigation from "./Navigation";

const Layout2 = () => {
  return (
    <div className="h-screen flex flex-col">
        <div className='hidden sm:block'>
            <PrimaryBar />
            <SecondaryBar />
        </div>
        <div className="flex flex-1 overflow-hidden">
            <Navigation />
            <div className="flex flex-1 overflow-auto">
                <Outlet />
            </div>
        </div>
    </div>
  );
};

export default Layout2;