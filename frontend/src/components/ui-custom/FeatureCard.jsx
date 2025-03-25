import React from 'react';

const FeatureCard = ({ title, description, icon }) => {
  return (
    <div className="glass-card glass-card-hover p-6 mt-6 rounded-lg duration-300 hover:translate-y-[-5px] backdrop-blur-md">
      <div className="mb-4 text-[#0FCE7C]">{icon}</div>
      <p className="text-xl  font-medium from-white to-grey-400 mb-2 ">{title}</p>
      <p className="text-gray-400  text-sm">{description}</p>
    </div>
  );
};

export default FeatureCard;