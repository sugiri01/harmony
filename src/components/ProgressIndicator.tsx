
import React from 'react';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ 
  currentStep, 
  totalSteps, 
  steps 
}) => {
  return (
    <div className="mb-8 animate-fade-in">
      <div className="flex justify-between mb-2">
        {steps.map((step, index) => (
          <div 
            key={index} 
            className={`text-center relative transition-all duration-300 ${
              index + 1 === currentStep 
                ? 'text-harmony-600 font-semibold scale-105' 
                : index + 1 < currentStep 
                  ? 'text-harmony-500' 
                  : 'text-gray-400'
            }`}
          >
            <div className={`
              w-8 h-8 rounded-full mb-2 mx-auto flex items-center justify-center
              ${index + 1 === currentStep 
                ? 'bg-harmony-100 text-harmony-600 ring-2 ring-harmony-200' 
                : index + 1 < currentStep 
                  ? 'bg-harmony-500 text-white' 
                  : 'bg-gray-100 text-gray-400'}
              transition-all duration-300
            `}>
              {index + 1 < currentStep ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                index + 1
              )}
            </div>
            <span className="text-sm">{step}</span>
          </div>
        ))}
      </div>
      
      <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
        <div 
          className="bg-harmony-500 h-1.5 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressIndicator;
