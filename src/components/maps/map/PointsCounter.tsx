'use client';

// import React from 'react';

interface PointsCounterProps {
  currentPoints: number;
  minPoints: number;
}

export default function PointsCounter({ currentPoints, minPoints }: PointsCounterProps) {
  return (
    <div className="text-[#A3A3A3] text-sm font-medium ml-auto">
      <span>
        Puntos: {currentPoints} / Mínimo: {minPoints}
      </span>
    </div>
  );
}
