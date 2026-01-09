import React from "react";

const WelcomeHeader = () => {

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold mb-2 block text-left text-white">
          Welcome
        </h1>
        <p className="text-gray-400">
          Here's an overview of your financial performance
        </p>
      </div>
    </div>
  );
};

export default WelcomeHeader;
