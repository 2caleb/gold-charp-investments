
import React from 'react';

interface GoldCharpLogoProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

const GoldCharpLogo: React.FC<GoldCharpLogoProps> = ({ className = '', size = 'medium' }) => {
  const dimensions = {
    small: { width: 100, height: 50 },
    medium: { width: 200, height: 100 },
    large: { width: 300, height: 150 },
  };

  const { width, height } = dimensions[size];
  
  return (
    <div className={`flex items-center justify-center ${className}`} style={{ width, height }}>
      <div className="text-center">
        <h2 className="text-purple-700 font-serif font-bold" style={{ 
          fontSize: size === 'small' ? '1.5rem' : size === 'medium' ? '2.5rem' : '3.5rem' 
        }}>
          Gold Charp
        </h2>
        <p className="text-gray-600" style={{ 
          fontSize: size === 'small' ? '0.8rem' : size === 'medium' ? '1rem' : '1.2rem' 
        }}>
          Investments Ltd.
        </p>
      </div>
    </div>
  );
};

export default GoldCharpLogo;
