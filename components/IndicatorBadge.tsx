
import React from 'react';

interface Props {
  status: 'Bullish' | 'Bearish' | 'Neutral' | string;
}

const IndicatorBadge: React.FC<Props> = ({ status }) => {
  const getStyles = () => {
    switch (status.toLowerCase()) {
      case 'bullish':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
      case 'bearish':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/50';
      default:
        return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
    }
  };

  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getStyles()}`}>
      {status}
    </span>
  );
};

export default IndicatorBadge;
