
import React, { useState, useEffect, useMemo } from 'react';
import { getStockAnalysis } from './services/gemini';
import { StockAnalysis, DashboardState, Timeframe, User, Portfolio, Currency } from './types';
import StockCard from './components/StockCard';

const INITIAL_CAPITAL = 100000;
const EXCHANGE_RATES: Record<Currency, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 151.40
};

const App: React.FC = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>('daily');
  const [state, setState] = useState<DashboardState>(() => {
    const savedPortfolio = localStorage.getItem('sp_portfolio');
    const savedUser = localStorage.getItem('sp_user');
    return {
      stocks: [],
      loading: true,
      error: null,
      user: savedUser ? JSON.parse(savedUser) : null,
      portfolio: savedPortfolio ? JSON.parse(savedPortfolio) : { cash: INITIAL_CAPITAL, positions: [] },
      currency: 'USD'
    };
  });

  useEffect(() => {
    localStorage.setItem('sp_portfolio', JSON.stringify(state.portfolio));
    localStorage.setItem('sp_user', JSON.stringify(state.user));
  }, [state.portfolio, state.user]);

  const fetchData = async (tf: Timeframe) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await getStockAnalysis(tf);
      setState(prev => ({ ...prev, stocks: data, loading: false }));
    } catch (err: any) {
      setState(prev => ({ ...prev, loading: false, error: err.message }));
    }
  };

  useEffect(() => {
    if (state.user) {
      fetchData(selectedTimeframe);
    }
  }, [selectedTimeframe, state.user]);

  const handleLogin = () => {
    // Mocking a Google Login flow
    const mockUser: User = {
      name: "Demo Trader",
      email: "trader@gmail.com",
      photo: "https://ui-avatars.com/api/?name=Demo+Trader&background=2563eb&color=fff"
    };
    setState(prev => ({ ...prev, user: mockUser }));
  };

  const handleLogout = () => {
    setState(prev => ({ ...prev, user: null }));
    localStorage.removeItem('sp_user');
  };

  const handleBuy = (stock: StockAnalysis, amount: number) => {
    const cost = stock.currentPrice * amount;
    if (state.portfolio.cash < cost) return alert("Insufficient funds!");

    setState(prev => {
      const existingIdx = prev.portfolio.positions.findIndex(p => p.symbol === stock.symbol);
      const newPositions = [...prev.portfolio.positions];

      if (existingIdx >= 0) {
        const p = newPositions[existingIdx];
        const newTotalQty = p.quantity + amount;
        const newAvgPrice = (p.avgPrice * p.quantity + cost) / newTotalQty;
        newPositions[existingIdx] = { ...p, quantity: newTotalQty, avgPrice: newAvgPrice };
      } else {
        newPositions.push({ symbol: stock.symbol, quantity: amount, avgPrice: stock.currentPrice });
      }

      return {
        ...prev,
        portfolio: {
          cash: prev.portfolio.cash - cost,
          positions: newPositions
        }
      };
    });
  };

  const handleSell = (stock: StockAnalysis, amount: number) => {
    setState(prev => {
      const existingIdx = prev.portfolio.positions.findIndex(p => p.symbol === stock.symbol);
      if (existingIdx < 0 || prev.portfolio.positions[existingIdx].quantity < amount) {
        alert("Not enough shares!");
        return prev;
      }

      const newPositions = [...prev.portfolio.positions];
      const p = newPositions[existingIdx];
      const newQty = p.quantity - amount;

      if (newQty === 0) {
        newPositions.splice(existingIdx, 1);
      } else {
        newPositions[existingIdx] = { ...p, quantity: newQty };
      }

      return {
        ...prev,
        portfolio: {
          cash: prev.portfolio.cash + (stock.currentPrice * amount),
          positions: newPositions
        }
      };
    });
  };

  const totalEquity = useMemo(() => {
    const positionsValue = state.portfolio.positions.reduce((acc, pos) => {
      const stock = state.stocks.find(s => s.symbol === pos.symbol);
      return acc + (pos.quantity * (stock?.currentPrice || pos.avgPrice));
    }, 0);
    return state.portfolio.cash + positionsValue;
  }, [state.portfolio, state.stocks]);

  const formatMoney = (val: number) => {
    const rate = EXCHANGE_RATES[state.currency];
    const symbols: Record<Currency, string> = { USD: '$', EUR: '€', GBP: '£', JPY: '¥' };
    return `${symbols[state.currency]}${(val * rate).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  };

  if (!state.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f1d] px-4">
        <div className="glass p-12 rounded-3xl max-w-md w-full text-center border-blue-500/20 shadow-2xl">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 mx-auto mb-8">
            <i className="fas fa-chart-line text-white text-4xl"></i>
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">StockPulse <span className="text-blue-500">AI</span></h1>
          <p className="text-slate-400 mb-10 text-sm">Advanced Trading Simulator & Forecasting</p>
          
          <button 
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-4 bg-white hover:bg-slate-100 text-slate-900 font-bold py-4 rounded-xl transition-all shadow-xl hover:scale-[1.02] active:scale-95 mb-6"
          >
            <img src="https://www.google.com/favicon.ico" className="w-5" alt="Google" />
            Sign in with Gmail
          </button>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Start with $100,000 Mock Capital</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-[#0a0f1d]">
      <header className="sticky top-0 z-50 glass border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="flex flex-col">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Equity</div>
                <div className="text-2xl font-black text-white">{formatMoney(totalEquity)}</div>
             </div>
             <div className="h-8 w-px bg-slate-800 mx-2 hidden sm:block"></div>
             <div className="hidden sm:flex flex-col">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Available Cash</div>
                <div className="text-lg font-bold text-blue-400">{formatMoney(state.portfolio.cash)}</div>
             </div>
          </div>

          <div className="flex items-center gap-4">
            <select 
              value={state.currency} 
              onChange={(e) => setState(prev => ({...prev, currency: e.target.value as Currency}))}
              className="bg-slate-900 border border-slate-700 text-[10px] font-bold text-white px-2 py-1 rounded"
            >
              {Object.keys(EXCHANGE_RATES).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="flex items-center gap-3 bg-slate-900/50 p-2 rounded-xl border border-slate-800">
              <img src={state.user.photo} className="w-8 h-8 rounded-lg" alt="Profile" />
              <div className="hidden lg:block">
                <div className="text-xs font-bold text-white leading-none">{state.user.name}</div>
                <button onClick={handleLogout} className="text-[10px] text-slate-500 hover:text-rose-400 font-bold uppercase transition-colors">Sign Out</button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
           <div>
              <h2 className="text-4xl font-black text-white tracking-tight mb-2">
                Live Analysis & <span className="text-blue-500">Simulator</span>
              </h2>
              <p className="text-slate-400 max-w-md">Market data validated by StockData.org. Practice trading with your AI-enhanced portfolio.</p>
           </div>
           <div className="flex bg-slate-900/50 p-1.5 rounded-xl border border-slate-800 w-fit self-start md:self-auto">
              {['minutes', 'hourly', 'daily', 'weekly', 'monthly', 'yearly'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setSelectedTimeframe(tf as Timeframe)}
                  className={`px-4 py-2 rounded-lg text-[10px] font-bold transition-all uppercase tracking-widest ${
                    selectedTimeframe === tf 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                    : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {tf === 'minutes' ? '1M' : tf === 'hourly' ? '1H' : tf === 'daily' ? '1D' : tf === 'weekly' ? '1W' : tf === 'monthly' ? 'MN' : '1Y'}
                </button>
              ))}
            </div>
        </div>

        {state.loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass rounded-2xl h-[600px] animate-pulse"></div>
            ))}
          </div>
        ) : state.error ? (
          <div className="p-20 glass rounded-3xl text-center border-rose-500/20">
            <i className="fas fa-exclamation-triangle text-rose-500 text-3xl mb-4"></i>
            <h3 className="text-xl font-bold text-white mb-2">Connection Error</h3>
            <p className="text-slate-400 mb-8">{state.error}</p>
            <button onClick={() => fetchData(selectedTimeframe)} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl">Retry Analysis</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {state.stocks.map((stock, idx) => {
              const pos = state.portfolio.positions.find(p => p.symbol === stock.symbol);
              return (
                <StockCard 
                  key={`${stock.symbol}-${idx}`} 
                  stock={stock} 
                  timeframe={selectedTimeframe}
                  position={pos}
                  onBuy={(qty) => handleBuy(stock, qty)}
                  onSell={(qty) => handleSell(stock, qty)}
                />
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
