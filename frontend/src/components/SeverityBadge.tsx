import React from 'react';

interface SeverityBadgeProps {
  priority?: string;
  severity?: string;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ priority = 'P3', severity }) => {
  let badgeClass = 'badge-p3';
  if (priority === 'P1' || severity === 'Critical') badgeClass = 'badge-p1';
  else if (priority === 'P2' || severity === 'High') badgeClass = 'badge-p2';
  else if (priority === 'P3' || severity === 'Medium') badgeClass = 'badge-p3';
  else if (priority === 'P4' || severity === 'Low') badgeClass = 'badge-p4';

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase ${badgeClass}`}>
      {priority} • {severity || 'Standard'}
    </span>
  );
};
