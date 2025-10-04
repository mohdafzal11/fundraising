import { useEffect, useState, useRef } from 'react';
interface Token {
  id: string;
  name: string;
  ticker: string;
  price: number;
  priceChange24h: number;
  imageUrl: string;
}

const MarqueeScroll = ({ tokens }: { tokens: Token[] }) => {
  const marqueeRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  const formatPrice = (price: number): string | JSX.Element => {
    if (price >= 1000) {
      return `$${price.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
    } else if (price >= 1) {
      return `$${price.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
    } else if (price < 1 && price > 0) {
      const priceStr = price.toFixed(12);
      const decimalPart = priceStr.split(".")[1];

      let leadingZeros = 0;
      for (let i = 0; i < decimalPart.length; i++) {
        if (decimalPart[i] === "0") {
          leadingZeros++;
        } else {
          break;
        }
      }

      if (leadingZeros >= 2) {
        const significantDigits = decimalPart.substring(
          leadingZeros,
          leadingZeros + 4
        );
        return (
          <span>
            $0.
            <sub className="text-[0.8em] font-semibold opacity-90 text-foreground">
              {leadingZeros}
            </sub>
            {significantDigits}
          </span>
        );
      } else {
        return `$${price.toFixed(4)}`;
      }
    } else {
      return `$${price.toLocaleString('en-US', { maximumFractionDigits: 4 })}`;
    }
  };

 
  const handleClick = (token: Token) => {
    const url = `https://droomdroom.com/price/${token.name.toLowerCase().replace(/ /g, '-')}-${token.ticker.toLowerCase()}`;
    window.open(url, '_blank');
  }

  return (
    <div className="w-full bg-background border-b border-border py-2 overflow-hidden">
      <div 
        ref={marqueeRef}
        className="flex gap-8 animate-marquee"
        style={{ animationPlayState: isPaused ? 'paused' : 'running', minWidth: 'max-content', whiteSpace: 'nowrap' }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {tokens.map((token) => (
          <div key={token.id} className="flex items-center gap-2 cursor-pointer hover:bg-muted px-3 py-1 rounded-md transition-colors" onClick={() => handleClick(token)}>
            <div className="w-6 h-6 rounded-full overflow-hidden">
              <img 
                src={token.imageUrl} 
                alt={token.name} 
                width={24} 
                height={24} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-sm font-medium">{token.name}</div>
            <div className="text-xs text-muted-foreground">({token.ticker})</div>
            <div className="text-sm font-semibold">{formatPrice(token.price)}</div>
            <div className={`text-xs flex items-center ${token.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              <span>{token.priceChange24h >= 0 ? '▲' : '▼'}</span>
              <span>{Math.abs(token.priceChange24h).toFixed(2)}%</span>
            </div>
          </div>
        ))}
        {tokens.map((token) => (
          <div key={`${token.id}-dup`} className="flex items-center gap-2 cursor-pointer hover:bg-muted px-3 py-1 rounded-md transition-colors">
            <div className="w-6 h-6 rounded-full overflow-hidden">
              <img 
                src={token.imageUrl} 
                alt={token.name} 
                width={24} 
                height={24} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-sm font-medium">{token.name}</div>
            <div className="text-xs text-muted-foreground">({token.ticker})</div>
            <div className="text-sm font-semibold">{formatPrice(token.price)}</div>
            <div className={`text-xs flex items-center ${token.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              <span>{token.priceChange24h >= 0 ? '▲' : '▼'}</span>
              <span>{Math.abs(token.priceChange24h).toFixed(2)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarqueeScroll;