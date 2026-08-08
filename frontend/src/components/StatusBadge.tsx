import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let badgeClass = 'status-investigating';
  
  if (status === 'RESOLVED' || status === 'CLOSED') {
    badgeClass = 'status-resolved';
  } else if (status === 'REMEDIATION_RECOMMENDED' || status === 'AUTO_HEALING') {
    badgeClass = 'status-remediation';
  } else if (status === 'NEW' || status === 'TRIAGED') {
    badgeClass = 'bg-slate-800 text-slate-300 border border-slate-700';
  }

  const formattedStatus = status.replace(/_/g, ' ');

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase ${badgeClass}`}>
      {formattedStatus}
    </span>
  );
};
