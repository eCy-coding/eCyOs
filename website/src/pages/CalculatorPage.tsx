import React from 'react';
import Calculator from '../components/Calculator';

const CalculatorPage: React.FC = () => {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center pt-8">
      <div className="mb-6">
        <h1 className="text-3xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
          OMNI-CALCULATOR
        </h1>
        <p className="text-gray-400 mt-2 font-light text-center">Scientific · Programmer · Graphical</p>
      </div>
      
      <div className="w-full max-w-2xl">
        <Calculator demoMode={false} />
      </div>
    </div>
  );
};

export default CalculatorPage;
