
import React from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  trend: string;
  trendUp: boolean | null; // true for positive, false for negative, null for neutral
}

const StatCard = ({ icon, title, value, trend, trendUp }: StatCardProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-50">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm text-gray-500 font-medium mb-1">{title}</h3>
          <div className="text-2xl font-bold text-gray-900 mb-2">{value}</div>
          
          <div className="flex items-center">
            {trendUp !== null && (
              <div className={`
                inline-flex items-center justify-center rounded-full p-1 mr-1
                ${trendUp ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}
              `}>
                {trendUp ? (
                  <ArrowUp className="h-3 w-3" />
                ) : (
                  <ArrowDown className="h-3 w-3" />
                )}
              </div>
            )}
            <span className={`text-xs ${
              trendUp === null ? 'text-gray-500' : 
              trendUp ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend}
            </span>
          </div>
        </div>
        
        <div className="rounded-lg bg-blue-50 p-3">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
