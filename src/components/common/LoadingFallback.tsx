import React from 'react';

export const LoadingFallback: React.FC<{ message?: string }> = ({
  message = 'Loading Sahaayak Portal...',
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center animate-fade-in">
      <div className="relative w-12 h-12 mb-4">
        <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-emerald-600 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
        </div>
      </div>
      <p className="text-xs font-semibold text-slate-600">{message}</p>
      <p className="text-[10px] text-slate-400 mt-1">National Labour Cooperative Federation (NLCF)</p>
    </div>
  );
};
