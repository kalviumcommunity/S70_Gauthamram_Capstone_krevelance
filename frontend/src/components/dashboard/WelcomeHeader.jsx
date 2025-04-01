import React from 'react';
import { useNavigate } from 'react-router-dom';


const WelcomeHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold mb-2 block text-left text-white">Welcome back, X</h1>
        <p className="text-gray-400">Here's an overview of your financial performance</p>
      </div>
      
    </div>
  );
};

export default WelcomeHeader;
