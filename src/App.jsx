import React from 'react';
import PrimaryBar from "./components/PrimaryBar";
import SecondaryBar from "./components/SecondaryBar";
import Sidebar from "./components/Navigation ";
import Content from "./components/Content";
import InformationBar from "./components/InformationBar";

const App = () => {
  return (
    <div className="h-screen flex flex-col">
      <PrimaryBar />
      <SecondaryBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <InformationBar/>
          <Content />
        </div>
      </div>
    </div>
  );
};

export default App;