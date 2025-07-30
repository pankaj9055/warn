import { useCurrency } from "@/hooks/use-currency";
import { Button } from "@/components/ui/button";
import { DollarSign, IndianRupee, ArrowLeftRight } from "lucide-react";

export function CurrencySelector() {
  const { currency, setCurrency, exchangeRate } = useCurrency();

  return (
    <div className="flex items-center space-x-2 px-3 py-1 rounded-lg bg-dark-card/50 border border-gray-600/30">
      <ArrowLeftRight size={14} className="text-gray-400" />
      <div className="flex bg-gray-800/50 rounded-md p-1">
        <Button
          size="sm"
          variant={currency === 'INR' ? 'default' : 'ghost'}
          onClick={() => setCurrency('INR')}
          className={`px-2 py-1 text-xs h-6 ${
            currency === 'INR' 
              ? 'bg-purple-600 text-white' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <IndianRupee size={12} className="mr-1" />
          INR
        </Button>
        <Button
          size="sm"
          variant={currency === 'USDT' ? 'default' : 'ghost'}
          onClick={() => setCurrency('USDT')}
          className={`px-2 py-1 text-xs h-6 ${
            currency === 'USDT' 
              ? 'bg-blue-600 text-white' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <DollarSign size={12} className="mr-1" />
          USDT
        </Button>
      </div>
      <div className="text-xs text-gray-400 border-l border-gray-600/30 pl-2 hidden xl:block">
        1 USDT = ₹{exchangeRate}
      </div>
    </div>
  );
}