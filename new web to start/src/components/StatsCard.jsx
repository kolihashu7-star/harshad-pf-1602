import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatsCard = ({ title, value, icon: Icon, trend, trendValue, color = 'accent' }) => {
  const colorClasses = {
    accent: 'from-accent/20 to-accent/5 border-accent/30',
    success: 'from-success/20 to-success/5 border-success/30',
    warning: 'from-warning/20 to-warning/5 border-warning/30',
    error: 'from-error/20 to-error/5 border-error/30',
  };

  const iconColorClasses = {
    accent: 'text-accent bg-accent/20',
    success: 'text-success bg-success/20',
    warning: 'text-warning bg-warning/20',
    error: 'text-error bg-error/20',
  };

  return (
    <div className={`card bg-gradient-to-br ${colorClasses[color]} border`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-text-secondary text-sm mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-white">{value}</h3>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              {trend === 'up' ? (
                <TrendingUp size={14} className="text-success" />
              ) : (
                <TrendingDown size={14} className="text-error" />
              )}
              <span className={`text-xs ${trend === 'up' ? 'text-success' : 'text-error'}`}>
                {trendValue}
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${iconColorClasses[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;

