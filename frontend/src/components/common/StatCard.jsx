import React from 'react';

export default function StatCard({ title, value, change, trend = 'neutral', icon: Icon, color = 'brand' }) {
  const iconColors = {
    brand: 'bg-brand-50 text-brand-600 border-brand-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    sky: 'bg-sky-50 text-sky-600 border-sky-100',
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
        {Icon && (
          <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${iconColors[color] || iconColors.brand}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <h3 className="text-2xl font-bold tracking-tight text-slate-900">{value}</h3>
        {change && (
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              trend === 'up'
                ? 'bg-emerald-50 text-emerald-700'
                : trend === 'down'
                ? 'bg-rose-50 text-rose-700'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {change}
          </span>
        )}
      </div>
    </div>
  );
}

