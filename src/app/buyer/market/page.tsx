import React from 'react';
import MarketTerminal from '@/components/MarketTerminal';

export const metadata = {
  title: 'Market Terminal | e-Bazar',
  description: 'Live agricultural trading terminal and order book',
};

export default function MarketPage() {
  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-80px)] w-full p-6">
      <MarketTerminal />
    </div>
  );
}
