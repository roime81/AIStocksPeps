
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { StockAnalysis, Timeframe } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const STOCK_ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    stocks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          symbol: { type: Type.STRING },
          name: { type: Type.STRING },
          currentPrice: { type: Type.NUMBER },
          profitabilityScore: { type: Type.NUMBER },
          marketSentiment: { type: Type.STRING },
          summary: { type: Type.STRING },
          indicators: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                status: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ["name", "status", "description"]
            }
          },
          strategy: {
            type: Type.OBJECT,
            properties: {
              buyPrice: { type: Type.NUMBER, description: "Best price to enter/buy" },
              sellPrice: { type: Type.NUMBER, description: "Target price to exit/sell" },
              stopLoss: { type: Type.NUMBER, description: "Recommended stop loss price" },
              optimalEntryTime: { type: Type.STRING, description: "Best time to enter within the forecast period" }
            },
            required: ["buyPrice", "sellPrice", "stopLoss", "optimalEntryTime"]
          },
          forecast: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.NUMBER },
                date: { type: Type.STRING },
                price: { type: Type.NUMBER },
                trend: { type: Type.STRING }
              },
              required: ["day", "date", "price", "trend"]
            }
          }
        },
        required: ["symbol", "name", "currentPrice", "profitabilityScore", "marketSentiment", "indicators", "forecast", "summary", "strategy"]
      }
    }
  },
  required: ["stocks"]
};

export async function getStockAnalysis(timeframe: Timeframe = 'daily'): Promise<StockAnalysis[]> {
  try {
    const horizonMap: Record<Timeframe, string> = {
      'minutes': 'next 60 minutes with 1-minute intervals',
      'hourly': 'next 48 hours with 1-hour intervals',
      'daily': 'next 60 days with 1-day intervals',
      'weekly': 'next 52 weeks with 1-week intervals',
      'monthly': 'next 24 months with 1-month intervals',
      'yearly': 'next 5 years with 1-year intervals'
    };

    const prompt = `Consult https://www.stockdata.org/ and other high-fidelity financial sources to identify the top 5 most profitable stocks currently. 
    
    For each stock, perform a technical analysis using these 10 indicators: 
    SMA (50/200), EMA (20), RSI (14), MACD, Bollinger Bands, Stochastic Oscillator, ATR, OBV, Fibonacci Retracement, and Ichimoku Cloud.
    
    Provide a specific Trade Strategy for each including:
    1. The BEST price to enter/buy (Limit Order).
    2. THE BEST target price to sell/take profit.
    3. The best time to enter relative to the chosen timeframe.
    4. A protective Stop Loss price.

    Predict the price movement for the ${horizonMap[timeframe]}. 
    The timeframe is ${timeframe}.
    
    Provide the output as a JSON object strictly following the provided schema.`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: STOCK_ANALYSIS_SCHEMA,
      },
    });

    const result = JSON.parse(response.text || '{"stocks": []}');
    const groundingSources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || 'Source',
      uri: chunk.web?.uri || '#'
    })) || [];

    return (result.stocks || []).map((stock: any) => ({
      ...stock,
      sources: groundingSources
    }));
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to fetch stock analysis. Check your API key or try a different timeframe.");
  }
}
