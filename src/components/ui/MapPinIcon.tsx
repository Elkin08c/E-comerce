import React from 'react';

interface MapPinIconProps {
  className?: string;
  size?: number;
  color?: string;
}

export const MapPinIcon: React.FC<MapPinIconProps> = ({ 
  className = '', 
  size = 17, 
  color = '#1559ED' 
}) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size * 1.41} 
      viewBox="0 0 17 24" 
      fill="none"
      className={className}
    >
      <g clipPath="url(#clip0_54_266)">
        <path 
          fillRule="evenodd" 
          clipRule="evenodd" 
          d="M8.5 0C3.80601 0 0 3.98194 0 8.8929C0 13.8039 4.61259 19.1174 8.5 24C12.3874 19.1174 17 13.8039 17 8.8929C17 3.98194 13.194 0 8.5 0ZM8.5 13.1303C6.26277 13.1303 4.4498 11.2335 4.4498 8.8929C4.4498 6.55226 6.26277 4.65548 8.5 4.65548C10.7372 4.65548 12.5502 6.55226 12.5502 8.8929C12.5453 11.231 10.7348 13.1252 8.5 13.1303Z" 
          fill={color}
        />
      </g>
      <defs>
        <clipPath id="clip0_54_266">
          <rect width="17" height="24" fill="white"/>
        </clipPath>
      </defs>
    </svg>
  );
};

export default MapPinIcon;
