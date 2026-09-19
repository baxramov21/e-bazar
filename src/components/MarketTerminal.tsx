"use client";

import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi } from 'lightweight-charts';
import { ArrowDownIcon, ArrowUpIcon, Activity } from 'lucide-react';

const PRODUCTS = [
  { id: 'tomato', name: 'Pomidor (Issiqxona)', basePrice: 12000 },
  { id: 'potato', name: 'Kartoshka (Oq)', basePrice: 3500 },
  { id: 'wheat', name: 'Bug\'doy (Oliy nav)', basePrice: 3100 }, // per kg equiv
  { id: 'meat', name: 'Mol go\'shti (Suyaksiz)', basePrice: 75000 },
];

function generateHistoricalData(basePrice: number, days: number = 60) {
  const data = [];
  let currentPrice = basePrice;
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const volatility = basePrice * 0.05;
    const open = currentPrice;
    const high = open + Math.random() * volatility;
    const low = open - Math.random() * volatility;
    const close = low + Math.random() * (high - low);
    
    data.push({ time, open, high, low, close });
    currentPrice = close;
  }
  return data;
}

type Order = {
  id: string;
  time: string;
  type: 'buy' | 'sell';
  price: number;
  amount: string;
  trader: string;
};

export default function MarketTerminal() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  const [activeProductId, setActiveProductId] = useState(PRODUCTS[0].id);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [currentPrice, setCurrentPrice] = useState(PRODUCTS[0].basePrice);

  const activeProduct = PRODUCTS.find(p => p.id === activeProductId)!;

  // Initialize Chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const handleResize = () => {
      chartRef.current?.applyOptions({ width: chartContainerRef.current?.clientWidth });
    };

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#8892b0',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      crosshair: {
        mode: 0, // Normal mode
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        rightOffset: 5, // give some breathing room on the right
      },
      handleScale: {
        mouseWheel: true,
        pinch: true,
        axisPressedMouseMove: true,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: true,
      },
      width: chartContainerRef.current.clientWidth,
      height: 500,
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });

    const historicalData = generateHistoricalData(activeProduct.basePrice);
    candlestickSeries.setData(historicalData);
    
    // Set default zoom to be 50% larger (show last 30 days instead of all 60)
    chart.timeScale().setVisibleLogicalRange({
      from: historicalData.length - 35,
      to: historicalData.length + 5, // Include the right offset
    });
    
    chartRef.current = chart;
    seriesRef.current = candlestickSeries;
    setCurrentPrice(historicalData[historicalData.length - 1].close);
    setRecentOrders([]); // Reset orders on product change

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [activeProductId, activeProduct.basePrice]);

  // Live Simulation Engine
  useEffect(() => {
    if (!seriesRef.current) return;

    const intervalId = setInterval(() => {
      // 30% chance to do nothing this tick (creates realistic pauses)
      if (Math.random() > 0.7) return;

      const isBuy = Math.random() > 0.5;
      const volatility = activeProduct.basePrice * 0.005; // 0.5% max jump per tick
      const priceChange = (Math.random() * volatility) * (isBuy ? 1 : -1);
      
      setCurrentPrice(prev => {
        const newPrice = prev + priceChange;
        
        // Update Chart
        const today = new Date().toISOString().split('T')[0];
        
        seriesRef.current?.update({
          time: today,
          open: activeProduct.basePrice, // Fake open
          high: Math.max(activeProduct.basePrice, newPrice + (activeProduct.basePrice * 0.01)),
          low: Math.min(activeProduct.basePrice, newPrice - (activeProduct.basePrice * 0.01)),
          close: newPrice
        });

        // Add Order to Book
        const newOrder: Order = {
          id: Math.random().toString(36).substr(2, 9),
          time: new Date().toLocaleTimeString(),
          type: isBuy ? 'buy' : 'sell',
          price: newPrice,
          amount: (Math.random() * 10 + 1).toFixed(1),
          trader: `Trader_${Math.floor(Math.random() * 900) + 100}`
        };

        setRecentOrders(orders => [newOrder, ...orders].slice(0, 50));
        
        return newPrice;
      });
    }, 2000); // Check every 2 seconds

    return () => clearInterval(intervalId);
  }, [activeProduct.basePrice]);

  return (
    <div className="flex flex-col gap-6 w-full h-full text-[#ccd6f6]">
      <header className="flex justify-between items-center bg-[#1a1a1a] p-4 rounded-[var(--radius-lg)] border border-[var(--border)] shadow-lg">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Activity className="text-[var(--accent)]" /> Market Terminal
          </h1>
          <p className="text-sm text-[#8892b0]">Live Trading & Order Book</p>
        </div>

        <div className="flex items-center gap-4">
          <select 
            className="bg-[#111111] border border-[var(--border)] text-[#ccd6f6] px-4 py-2 rounded-xl focus:outline-none focus:border-[var(--accent)] transition-colors cursor-pointer"
            value={activeProductId}
            onChange={(e) => setActiveProductId(e.target.value)}
          >
            {PRODUCTS.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <div className="flex flex-col items-end min-w-[120px] bg-[#111111] px-4 py-1.5 rounded-xl border border-[var(--border)]">
            <span className="text-xs text-[#8892b0]">Current Price</span>
            <span className={`text-lg font-mono font-bold ${currentPrice >= activeProduct.basePrice ? 'text-emerald-400' : 'text-red-400'}`}>
              {currentPrice.toLocaleString('uz-UZ', { maximumFractionDigits: 0 })} UZS
            </span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Chart Area */}
        <div className="col-span-1 lg:col-span-3 bg-[#1a1a1a] rounded-[var(--radius-lg)] border border-[var(--border)] p-4 shadow-lg flex flex-col h-[600px]">
          <h3 className="text-lg font-medium mb-4">{activeProduct.name} - OHLC History</h3>
          <div className="flex-1 w-full relative" ref={chartContainerRef} />
        </div>

        {/* Live Order Book Area */}
        <div className="col-span-1 bg-[#1a1a1a] rounded-[var(--radius-lg)] border border-[var(--border)] p-4 shadow-lg h-[600px] flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Recent Orders</h3>
            <div className="flex gap-2">
              <span className="flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs text-emerald-400 font-medium">LIVE</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="flex text-xs text-[#8892b0] mb-2 px-2 uppercase tracking-wider font-semibold">
              <div className="w-1/3">Price</div>
              <div className="w-1/3 text-right">Amount</div>
              <div className="w-1/3 text-right">Time</div>
            </div>
            
            <div className="flex flex-col gap-1">
              {recentOrders.map(order => (
                <div 
                  key={order.id} 
                  className={`flex items-center justify-between text-sm py-2 px-2 rounded-md bg-[#111111]/50 border-l-2 ${order.type === 'buy' ? 'border-emerald-500 hover:bg-emerald-500/10' : 'border-red-500 hover:bg-red-500/10'} transition-colors group`}
                >
                  <div className={`w-1/3 font-mono font-medium ${order.type === 'buy' ? 'text-emerald-400' : 'text-red-400'} flex items-center gap-1`}>
                    {order.type === 'buy' ? <ArrowUpIcon size={12} /> : <ArrowDownIcon size={12} />}
                    {order.price.toLocaleString('uz-UZ', { maximumFractionDigits: 0 })}
                  </div>
                  <div className="w-1/3 text-right font-mono text-[#ccd6f6]">
                    {order.amount}t
                  </div>
                  <div className="w-1/3 text-right font-mono text-xs text-[#8892b0]">
                    {order.time}
                  </div>
                </div>
              ))}
              
              {recentOrders.length === 0 && (
                <div className="text-center text-[#8892b0] py-8 text-sm">
                  Waiting for market activity...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
