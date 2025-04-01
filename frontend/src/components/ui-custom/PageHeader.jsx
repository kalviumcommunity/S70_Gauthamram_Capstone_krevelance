import React from 'react';

const cn = (...args) => args.filter(Boolean).join(" ");

const PageHeader = ({ title, description, children, className, centered }) => {
  return (
    <div className={cn("mb-8 mt-4", centered && "text-center", className)}>
      <h1 className="text-3xl font-bold mb-2">{title}</h1>
      {description && <p className="text-gray-400 max-w-2xl">{description}</p>}
      {children}
    </div>
  );
};

export default PageHeader;
