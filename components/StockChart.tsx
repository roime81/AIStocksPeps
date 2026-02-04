
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { PriceDataPoint, Timeframe } from '../types';

interface Props {
  data: PriceDataPoint[];
  symbol: string;
  buyPrice?: number;
  sellPrice?: number;
  timeframe: Timeframe;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg shadow-xl">
        <p className="text-slate-400 text-[10px] mb-1 font-medium">{data.date}</p>
        <p className="text-white font-bold text-base">${data.price.toFixed(2)}</p>
        <div className={`text-[9px] font-bold uppercase mt-1 ${data.trend === 'up' ? 'text-emerald-400' : data.trend === 'down' ? 'text-rose-400' : 'text-slate-400'}`}>
           <i className={`fas fa-caret-${data.trend === 'up' ? 'up' : data.trend === 'down' ? 'down' : 'right'} mr-1`}></i>
           {data.trend}
        </div>
      </div>
    );
  }
  return null;
};

const StockChart: React.FC<Props> = ({ data, symbol, buyPrice, sellPrice, timeframe }) => {
  const firstPrice = data[0]?.price || 0;
  const lastPrice = data[data.length - 1]?.price || 0;
  const isUp = lastPrice >= firstPrice;

  // Function to determine how many ticks to show to avoid clutter
  const getTickInterval = () => {
    if (data.length > 40) return Math.floor(data.length / 5);
    if (data.length > 20) return 5;
    return 0;
  };

  return (
    <div className="h-[240px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id={`colorPrice-${symbol}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={isUp ? "#10b981" : "#f43f5e"} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={isUp ? "#10b981" : "#f43f5e"} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" opacity={0.5} />
          <XAxis 
            dataKey="date" 
            tick={{ fill: '#475569', fontSize: 9 }}
            axisLine={false}
            tickLine={false}
            interval={getTickInterval()}
            minTickGap={30}
          />
          <YAxis 
            domain={['auto', 'auto']} 
            orientation="right" 
            tick={{ fill: '#475569', fontSize: 9 }}
            axisLine={false}
            tickLine={false}
            mirror={true}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke={isUp ? "#10b981" : "#f43f5e"} 
            strokeWidth={2}
            fillOpacity={1} 
            fill={`url(#colorPrice-${symbol})`} 
            animationDuration={1000}
          />
          {buyPrice && (
            <ReferenceLine 
              y={buyPrice} 
              stroke="#10b981" 
              strokeWidth={1} 
              strokeDasharray="3 3" 
              label={{ position: 'insideTopLeft', value: 'BUY', fill: '#10b981', fontSize: 8, fontWeight: 'bold' }} 
            />
          )}
          {sellPrice && (
            <ReferenceLine 
              y={sellPrice} 
              stroke="#3b82f6" 
              strokeWidth={1} 
              strokeDasharray="3 3" 
              label={{ position: 'insideTopLeft', value: 'SELL', fill: '#3b82f6', fontSize: 8, fontWeight: 'bold' }} 
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StockChart;
