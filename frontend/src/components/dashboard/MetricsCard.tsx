import React from 'react';

interface MetricsCardProps {
  label: string;
  value: string | number;
  color?: 'technical' | 'commercial' | 'default';
}

const MetricsCard: React.FC<MetricsCardProps> = ({ label, value, color = 'default' }) => {
  const colorClasses = {
    technical: 'bg-blue-100 text-blue-800',
    commercial: 'bg-green-100 text-green-800',
    default: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className={`p-4 rounded-lg shadow-sm ${colorClasses[color]}`}>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
};

export default MetricsCard;