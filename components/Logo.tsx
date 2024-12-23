'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  white?: boolean;
  size?: number;
  minSize?: number;
  maxSize?: number;
  className?: string;
}

export const Logo = forwardRef<SVGSVGElement, LogoProps>(
  ({ white = false, size = 1, minSize = 0.1, maxSize = 2, className }, ref) => {
    const fill = white ? '#ffffff' : '#2E358A';

    let scaleFactor = size;
    if (size < minSize) scaleFactor = minSize;
    if (size > maxSize) scaleFactor = maxSize;

    const width = 108 * scaleFactor;
    const height = 53 * scaleFactor;

    return (
      <svg
        ref={ref}
        width={width}
        height={height}
        viewBox={`0 0 ${108} ${53}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(className)}
      >
        <path d="M108 16.298V24.4794H99.3929V29.0247H108V37.4659H99.3929V41.8813H108V48.894H89.7424V16.298H108Z" fill={fill} />
        <path d="M87.1342 24.4794V16.298H78.1358H69.1374V48.894H87.1342V41.8813H78.527V24.4794H87.1342Z" fill={fill} />
        <path d="M66.6596 16.298H48.1411V37.4659H57.0091V41.8813H48.1411V48.894H66.6596V29.0247H57.922V24.4794H66.6596V16.298Z" fill={fill} />
        <path d="M45.9241 16.298H27.9272V48.894H37.3169V37.4659H45.9241V29.0247H37.3169V24.4794H45.9241V16.298Z" fill={fill} />
        <circle cx="20.1322" cy="8.50331" r="7.50331" stroke={fill} strokeWidth="2" />
        <path d="M10.1027 52.4371V38.1663C9.5835 37.9948 8.31148 37.9863 7.37694 39.3234C6.20876 40.9947 3.22342 43.8232 1.92545 43.6946C0.627472 43.5661 0.757269 39.4519 1.92545 37.0092C2.85999 35.055 8.19899 26.1668 10.7517 21.9669H33.596L33.2066 52.4371" stroke={fill} strokeWidth="2" />
        <path d="M18.3986 37.6181L26.5247 41.1057L38.5204 45.9347C40.0683 46.4713 40.4552 45.1299 40.8422 44.7275C41.1518 44.4055 41.7451 42.1788 42.0031 41.1057C42.4158 39.4961 41.4011 38.3782 40.8422 38.0205L24.203 30.9112C22.2682 30.3299 18.1148 29.8649 16.9798 32.655C15.8447 35.4451 17.4527 37.1263 18.3986 37.6181Z" fill={fill} />
      </svg>
    );
  }
);

Logo.displayName = 'Logo';

export default Logo;
