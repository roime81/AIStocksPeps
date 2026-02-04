
export type Timeframe = 'minutes' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly';
export type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY';

export interface PriceDataPoint {
  day: number;
  date: string;
  price: number;
  trend: 'up' | 'down' | 'neutral';
}

export interface IndicatorAnalysis {
  name: string;
  status: 'Bullish' | 'Bearish' | 'Neutral';
  description: string;
}

export interface TradeStrategy {
  buyPrice: number;
  sellPrice: number;
  stopLoss: number;
  optimalEntryTime: string;
}

export interface StockAnalysis {
  symbol: string;
  name: string;
  currentPrice: number;
  profitabilityScore: number;
  marketSentiment: string;
  indicators: IndicatorAnalysis[];
  forecast: PriceDataPoint[];
  summary: string;
  strategy: TradeStrategy;
  sources: { title: string; uri: string }[];
}

export interface Position {
  symbol: string;
  quantity: number;
  avgPrice: number;
}

export interface User {
  name: string;
  email: string;
  photo?: string;
}

export interface Portfolio {
  cash: number;
  positions: Position[];
}

export interface DashboardState {
  stocks: StockAnalysis[];
  loading: boolean;
  error: string | null;
  user: User | null;
  portfolio: Portfolio;
  currency: Currency;
}
