import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  DollarSign, 
  Calendar,
  CreditCard,
  ShoppingCart
} from "lucide-react";
import { format } from "date-fns";

interface Transaction {
  id: number;
  userId: number;
  type: string;
  amount: string;
  status: string;
  createdAt: string;
  orderId?: number;
  description?: string;
}

export function TransactionHistory() {
  const { user } = useAuth();

  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
    enabled: !!user,
  });

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <ArrowDownLeft className="h-4 w-4 text-green-400" />;
      case "withdrawal":
        return <ArrowUpRight className="h-4 w-4 text-red-400" />;
      case "order":
        return <ShoppingCart className="h-4 w-4 text-blue-400" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "deposit":
        return "text-green-400";
      case "withdrawal":
      case "order":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500 text-white">Completed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500 text-black">Pending</Badge>;
      case "failed":
        return <Badge className="bg-red-500 text-white">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!user) return null;

  return (
    <Card className="glass-card border-border/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-blue-400" />
          Transaction History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64 w-full">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <LoadingSpinner />
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center">
              <div className="text-sm text-gray-400">
                No transactions yet. Make a deposit to get started.
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="p-3 rounded-lg bg-gray-800/30 border border-gray-700/50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-700/50 rounded-lg flex items-center justify-center">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <div className="font-medium capitalize">
                          {transaction.type === "order" ? "Service Order" : transaction.type}
                        </div>
                        <div className="text-xs text-gray-400 flex items-center gap-1">
                          <Calendar size={10} />
                          {format(new Date(transaction.createdAt), "MMM dd, yyyy HH:mm")}
                        </div>
                        {transaction.description && (
                          <div className="text-xs text-gray-500 mt-1">
                            {transaction.description}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${getTransactionColor(transaction.type)}`}>
                        {transaction.type === "deposit" ? "+" : ""}₹{Math.abs(parseFloat(transaction.amount)).toFixed(2)}
                      </div>
                      <div className="mt-1">
                        {getStatusBadge(transaction.status)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}