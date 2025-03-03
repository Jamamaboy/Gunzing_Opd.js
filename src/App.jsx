import React from 'react';
import PrimaryBar from "./components/PrimaryBar";
import SecondaryBar from "./components/SecondaryBar";
import Sidebar from "./components/Navigation ";
import Content from "./components/Content";
import InformationBar from "./components/InformationBar";

const App = () => {
  return (
        <div className="flex-1 overflow-auto">
            <Content />
        </div>
  );
};

export default App;