import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Lock, CreditCard, Wallet } from "lucide-react";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
if (!stripePublicKey) {
  console.warn('Missing VITE_STRIPE_PUBLIC_KEY - payment functionality will be limited');
}

const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : null;

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: "Funds have been added to your wallet!",
      });
      setLocation("/dashboard");
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement className="p-4 bg-dark-card rounded-2xl" />
      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full neo-button py-4 rounded-2xl text-white font-semibold flex items-center justify-center space-x-2 glow-on-hover"
      >
        <Lock size={20} />
        <span>{isProcessing ? "Processing..." : "Complete Payment"}</span>
      </Button>
    </form>
  );
};

export default function Checkout() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [clientSecret, setClientSecret] = useState("");
  const [amount, setAmount] = useState(500);
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    }
  }, [user, isLoading, setLocation]);

  const createPaymentIntent = async () => {
    if (!stripePromise) {
      toast({
        title: "Payment Unavailable",
        description: "Payment processing is not configured",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await apiRequest("POST", "/api/create-payment-intent", { 
        amount: amount 
      });
      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (error: any) {
      toast({
        title: "Payment Setup Failed",
        description: error.message || "Failed to setup payment",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user && amount >= 100) {
      createPaymentIntent();
    }
  }, [user, amount]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!stripePromise) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="pt-20">
          <div className="max-w-4xl mx-auto px-4 py-16">
            <Card className="glass-card border-border/20 text-center">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold gradient-text mb-4">Payment Unavailable</h2>
                <p className="text-gray-400">Payment processing is currently not configured. Please contact support.</p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="pt-20">
          <div className="max-w-4xl mx-auto px-4 py-16">
            <Card className="glass-card border-border/20">
              <CardHeader>
                <CardTitle className="text-2xl gradient-text text-center">Add Funds to Wallet</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Amount to Deposit</label>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <Button 
                        variant={amount === 500 ? "default" : "outline"}
                        onClick={() => setAmount(500)}
                        className={amount === 500 ? "neo-button" : "glass-card border-gray-600"}
                      >
                        ₹500
                      </Button>
                      <Button 
                        variant={amount === 1000 ? "default" : "outline"}
                        onClick={() => setAmount(1000)}
                        className={amount === 1000 ? "neo-button" : "glass-card border-gray-600"}
                      >
                        ₹1,000
                      </Button>
                      <Button 
                        variant={amount === 2500 ? "default" : "outline"}
                        onClick={() => setAmount(2500)}
                        className={amount === 2500 ? "neo-button" : "glass-card border-gray-600"}
                      >
                        ₹2,500
                      </Button>
                    </div>
                    <Input
                      type="number"
                      placeholder="Enter custom amount"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      min={100}
                      className="neon-input bg-dark-card border-gray-600 text-white placeholder-gray-500"
                    />
                  </div>

                  <div className="bg-dark-card p-4 rounded-2xl">
                    <div className="flex justify-between items-center mb-2">
                      <span>Deposit Amount:</span>
                      <span className="font-bold">₹{amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span>Processing Fee:</span>
                      <span>₹{(amount * 0.03).toFixed(2)}</span>
                    </div>
                    <hr className="border-gray-600 my-2" />
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total:</span>
                      <span className="gradient-text">₹{(amount * 1.03).toFixed(2)}</span>
                    </div>
                  </div>

                  <Button
                    onClick={createPaymentIntent}
                    disabled={amount < 100}
                    className="w-full neo-button py-4 rounded-2xl text-white font-semibold flex items-center justify-center space-x-2 glow-on-hover"
                  >
                    <CreditCard size={20} />
                    <span>Proceed to Payment</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // Make SURE to wrap the form in <Elements> which provides the stripe context.
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-20">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <Card className="glass-card border-border/20">
            <CardHeader>
              <CardTitle className="text-2xl gradient-text text-center">Complete Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6 bg-dark-card p-4 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Wallet className="text-green-400" size={20} />
                    <span>Adding to wallet:</span>
                  </div>
                  <span className="text-2xl font-bold gradient-text">₹{amount.toFixed(2)}</span>
                </div>
              </div>

              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm />
              </Elements>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
