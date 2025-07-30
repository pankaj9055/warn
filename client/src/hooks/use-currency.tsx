import { createContext, useContext, useState, useEffect } from "react";

interface CurrencyContextType {
  currency: 'INR' | 'USDT';
  setCurrency: (currency: 'INR' | 'USDT') => void;
  exchangeRate: number;
  convertPrice: (amount: number | string, fromCurrency?: 'INR' | 'USDT') => number;
  formatPrice: (amount: number | string, fromCurrency?: 'INR' | 'USDT') => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Mock exchange rate - in production, this would come from an API
const USDT_TO_INR_RATE = 84.50; // 1 USDT = 84.50 INR (approximate)

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<'INR' | 'USDT'>('INR');
  const [exchangeRate, setExchangeRate] = useState(USDT_TO_INR_RATE);

  // In production, you would fetch real exchange rates
  useEffect(() => {
    // Mock API call for exchange rate
    const fetchExchangeRate = () => {
      // This would be a real API call in production
      setExchangeRate(USDT_TO_INR_RATE);
    };

    fetchExchangeRate();
    // Update every 5 minutes
    const interval = setInterval(fetchExchangeRate, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const convertPrice = (amount: number | string, fromCurrency: 'INR' | 'USDT' = 'INR'): number => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (fromCurrency === currency) {
      return numAmount;
    }
    
    if (fromCurrency === 'INR' && currency === 'USDT') {
      return numAmount / exchangeRate;
    } else if (fromCurrency === 'USDT' && currency === 'INR') {
      return numAmount * exchangeRate;
    }
    
    return numAmount;
  };

  const formatPrice = (amount: number | string, fromCurrency: 'INR' | 'USDT' = 'INR'): string => {
    const convertedAmount = convertPrice(amount, fromCurrency);
    
    if (currency === 'INR') {
      return `₹${convertedAmount.toLocaleString('en-IN', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      })}`;
    } else {
      return `$${convertedAmount.toFixed(4)} USDT`;
    }
  };

  return (
    <CurrencyContext.Provider 
      value={{ 
        currency, 
        setCurrency, 
        exchangeRate, 
        convertPrice, 
        formatPrice 
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}