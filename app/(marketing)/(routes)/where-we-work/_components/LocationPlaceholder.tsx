import React from 'react';
import { Building2 } from 'lucide-react';

interface LocationPlaceholderProps {
  city: string;
  className?: string;
}

const LocationPlaceholder: React.FC<LocationPlaceholderProps> = ({ city, className = '' }) => {
  return (
    <div 
      className={`relative w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-50 ${className}`}
    >
      <div className="text-center">
        <Building2 className="w-12 h-12 text-blue-500 mx-auto mb-2" />
        <p className="text-sm text-blue-700 font-medium">{city}</p>
      </div>
    </div>
  );
};

export default LocationPlaceholder;
