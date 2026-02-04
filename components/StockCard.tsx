
import React, { useState } from 'react';
import { StockAnalysis, Timeframe, Position } from '../types';
import StockChart from './StockChart';
import IndicatorBadge from './IndicatorBadge';

interface Props {
  stock: StockAnalysis;
  timeframe: Timeframe;
  position?: Position;
  onBuy: (qty: number) => void;
  onSell: (qty: number) => void;
}

const StockCard: React.FC<Props> = ({ stock, timeframe, position, onBuy, onSell }) => {
  const [showIndicators, setShowIndicators] = useState(false);
  const [tradeQty, setTradeQty] = useState(1);
  const lastForecastPrice = stock.forecast[stock.forecast.length - 1].price;
  const priceChange = lastForecastPrice - stock.currentPrice;
  const percentageChange = (priceChange / stock.currentPrice) * 100;
  const isPositive = priceChange >= 0;

  const unrealizedPL = position ? (stock.currentPrice - position.avgPrice) * position.quantity : 0;
  const plPercent = position ? ((stock.currentPrice - position.avgPrice) / position.avgPrice) * 100 : 0;

  return (
    <div className="glass rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 group flex flex-col h-full border-white/5">
      <div className="p-7 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-blue-600/10 text-blue-400 text-[9px] font-bold px-2 py-0.5 rounded border border-blue-500/20 uppercase tracking-tighter">
                Forecast: {percentageChange.toFixed(1)}%
              </span>
              <h2 className="text-2xl font-black tracking-tight text-white group-hover:text-blue-500 transition-colors uppercase">
                {stock.symbol}
              </h2>
            </div>
            <p className="text-slate-400 text-xs font-semibold">{stock.name}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-white">${stock.currentPrice.toFixed(2)}</div>
            <div className={`text-xs font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              <i className={`fas fa-caret-${isPositive ? 'up' : 'down'} mr-1`}></i>
              {percentageChange.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Position Info */}
        {position && (
          <div className="mb-6 p-4 rounded-2xl bg-slate-900/60 border border-blue-500/20 animate-fadeIn">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Your Holding</span>
              <span className="text-xs font-bold text-white">{position.quantity} Shares</span>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <div className="text-[9px] text-slate-500 uppercase font-bold">Avg Price</div>
                <div className="text-sm font-bold text-slate-300">${position.avgPrice.toFixed(2)}</div>
              </div>
              <div className="text-right">
                <div className="text-[9px] text-slate-500 uppercase font-bold">Unrealized P/L</div>
                <div className={`text-sm font-black ${unrealizedPL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {unrealizedPL >= 0 ? '+' : ''}${unrealizedPL.toFixed(2)} ({plPercent.toFixed(1)}%)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trade Controls */}
        <div className="grid grid-cols-1 gap-4 mb-6">
          <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
            <button onClick={() => setTradeQty(Math.max(1, tradeQty - 1))} className="w-10 h-10 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors">-</button>
            <input 
              type="number" 
              value={tradeQty} 
              onChange={(e) => setTradeQty(Math.max(1, parseInt(e.target.value) || 1))}
              className="flex-1 bg-transparent text-center text-white font-bold outline-none" 
            />
            <button onClick={() => setTradeQty(tradeQty + 1)} className="w-10 h-10 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors">+</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => onBuy(tradeQty)}
              className="py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            >
              Buy
            </button>
            <button 
              onClick={() => onSell(tradeQty)}
              className="py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg shadow-rose-500/20 transition-all active:scale-95 disabled:opacity-30 disabled:grayscale"
              disabled={!position || position.quantity < 1}
            >
              Sell
            </button>
          </div>
        </div>

        <StockChart 
          data={stock.forecast} 
          symbol={stock.symbol} 
          buyPrice={stock.strategy.buyPrice} 
          sellPrice={stock.strategy.sellPrice}
          timeframe={timeframe}
        />

        <div className="mt-6 flex flex-wrap gap-4 items-center justify-between border-y border-slate-800/50 py-4">
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Optimal Entry</span>
            <span className="text-xs font-bold text-blue-400">{stock.strategy.optimalEntryTime}</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Take Profit</span>
            <span className="text-xs font-bold text-emerald-400">${stock.strategy.sellPrice.toFixed(2)}</span>
          </div>
        </div>

        <button 
          onClick={() => setShowIndicators(!showIndicators)}
          className="mt-6 w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/30 hover:bg-slate-800/60 border border-slate-700/50 transition-all"
        >
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Technical Logic</span>
          <i className={`fas fa-chevron-${showIndicators ? 'up' : 'down'} text-slate-500 text-[10px]`}></i>
        </button>

        {showIndicators && (
          <div className="mt-3 space-y-2 animate-fadeIn max-h-[150px] overflow-y-auto no-scrollbar">
            {stock.indicators.map((ind, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/30 flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-300">{ind.name}</span>
                  <IndicatorBadge status={ind.status} />
                </div>
                <p className="text-[10px] text-slate-500 leading-tight italic">{ind.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StockCard;
