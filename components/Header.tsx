
import React from 'react';

const SparkleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 2 L14.5 9.5 L22 12 L14.5 14.5 L12 22 L9.5 14.5 L2 12 L9.5 9.5 Z" />
  </svg>
);


const Header: React.FC = () => {
  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-stone-200">
      <div className="container mx-auto p-4 flex items-center justify-center max-w-6xl">
        <SparkleIcon className="text-amber-500 h-10 w-10 mr-3" />
        <h1 className="text-4xl font-bold text-stone-700 tracking-tight">
          My Daily Sketch
        </h1>
      </div>
    </header>
  );
};

export default Header;
