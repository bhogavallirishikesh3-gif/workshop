import React from 'react';
import { DietaryType } from '../types.js';

interface VegNonVegIndicatorProps {
  type: DietaryType;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const VegNonVegIndicator: React.FC<VegNonVegIndicatorProps> = ({
  type,
  showLabel = false,
  size = 'md'
}) => {
  const isVeg = type === 'veg' || type === 'vegan';
  const isVegan = type === 'vegan';

  const boxSize = size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
  const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : size === 'lg' ? 'w-2.5 h-2.5' : 'w-2 h-2';

  return (
    <span className="inline-flex items-center gap-1.5 select-none" title={isVegan ? 'Vegan' : isVeg ? 'Vegetarian' : 'Non-Vegetarian'}>
      <span
        className={`${boxSize} rounded-[3px] border flex items-center justify-center shrink-0 ${
          isVeg
            ? 'border-emerald-600 bg-white'
            : 'border-rose-600 bg-white'
        }`}
        aria-label={isVegan ? 'Vegan' : isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
      >
        <span
          className={`${dotSize} rounded-full ${
            isVeg ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
        />
      </span>
      {showLabel && (
        <span className={`text-xs font-medium tracking-tight ${isVeg ? 'text-emerald-700' : 'text-rose-700'}`}>
          {isVegan ? 'Vegan' : isVeg ? 'Veg' : 'Non-Veg'}
        </span>
      )}
    </span>
  );
};
