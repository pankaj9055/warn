import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Instagram, 
  Facebook, 
  Send,
  Youtube,
  Twitter,
  ShoppingBag,
  Rocket,
  Eye,
  Heart,
  MessageCircle,
  Users
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import AdminMessage from "@/components/admin-message";

interface Service {
  id: number;
  name: string;
  description: string;
  pricePerThousand: string;
  categoryId: number;
  minQuantity: number;
  maxQuantity: number;
  isActive: boolean;
}

interface ServiceCategory {
  id: number;
  name: string;
  services: Service[];
}

const categoryIcons = {
  "Instagram": Instagram,
  "Facebook": Facebook, 
  "Telegram": Send,
  "YouTube": Youtube,
  "Twitter": Twitter,
  "TikTok": Heart,
  "Default": ShoppingBag
};

const categoryColors = {
  "Instagram": "from-pink-500 to-purple-600",
  "Facebook": "from-blue-500 to-blue-700",
  "Telegram": "from-sky-400 to-blue-500", 
  "YouTube": "from-red-500 to-red-600",
  "Twitter": "from-sky-400 to-blue-400",
  "TikTok": "from-pink-500 to-red-500",
  "Default": "from-purple-500 to-pink-500"
};

function OrderDialog({ service }: { service: Service }) {
  const [link, setLink] = useState("");
  const [quantity, setQuantity] = useState(service.minQuantity);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleOrder = async () => {
    try {
      const response = await apiRequest("POST", "/api/orders", {
        serviceId: service.id,
        targetUrl: link,
        quantity: quantity
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      
      toast({
        title: "Order Placed!",
        description: `Your order for ${service.name} has been placed successfully.`,
      });
      
      setIsOpen(false);
      setLink("");
      setQuantity(service.minQuantity);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive"
      });
    }
  };

  const totalPrice = ((quantity / 1000) * parseFloat(service.pricePerThousand)).toFixed(2);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          className="w-full neo-button bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          size="sm"
        >
          <Rocket className="w-4 h-4 mr-2" />
          Order Now
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md mx-4 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {service.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="link" className="text-sm font-medium">Target Link</Label>
            <Input
              id="link"
              placeholder="Enter post/profile URL"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="quantity" className="text-sm font-medium">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min={service.minQuantity}
              max={service.maxQuantity}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || service.minQuantity)}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Min: {service.minQuantity} | Max: {service.maxQuantity}
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Price:</span>
              <span className="font-bold text-lg">₹{totalPrice}</span>
            </div>
          </div>
          
          <Button 
            onClick={handleOrder}
            disabled={!link || quantity < service.minQuantity}
            className="w-full neo-button"
          >
            Place Order - ₹{totalPrice}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ServiceCard({ service }: { service: Service }) {
  return (
    <Card className="glass-card hover:scale-105 transition-all duration-300 border-purple-500/20">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-bold text-sm mb-1 service-name text-white">
              {service.name}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {service.description}
            </p>
          </div>
          <Badge variant="secondary" className="ml-2 text-xs">
            ₹{service.pricePerThousand}/1K
          </Badge>
        </div>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <span className="flex items-center">
            <Users className="w-3 h-3 mr-1" />
            {service.minQuantity}-{service.maxQuantity}
          </span>
          <span className="flex items-center">
            <Eye className="w-3 h-3 mr-1" />
            High Quality
          </span>
        </div>
        
        <OrderDialog service={service} />
      </CardContent>
    </Card>
  );
}

export default function ServicesMobile() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const { user } = useAuth();

  const { data: categories = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/services/categories"],
  });

  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ["/api/services/"],
  });

  const activeServices = services.filter((service: Service) => service.isActive);
  
  const categorizedServices = categories.reduce((acc: Record<string, Service[]>, category: any) => {
    acc[category.name] = activeServices.filter((service: Service) => 
      service.categoryId === category.id
    );
    return acc;
  }, {});

  const allCategories = ["all", ...categories.map((c: any) => c.name)];
  
  const displayServices = activeCategory === "all" 
    ? activeServices 
    : categorizedServices[activeCategory] || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
        <div className="animate-pulse space-y-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-24 bg-purple-500/20 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/50 backdrop-blur-lg border-b border-purple-500/20 p-4">
        <h1 className="text-xl font-bold text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          JKSMM Services
        </h1>
      </div>

      {/* Category Tabs - Horizontal Scroll */}
      <div className="px-4 py-3 overflow-x-auto">
        <div className="flex space-x-3 pb-2">
          {allCategories.map((category) => {
            const IconComponent = categoryIcons[category as keyof typeof categoryIcons] || categoryIcons.Default;
            const isActive = activeCategory === category;
            const gradientColor = categoryColors[category as keyof typeof categoryColors] || categoryColors.Default;
            
            return (
              <Button
                key={category}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(category)}
                className={`
                  flex items-center space-x-2 whitespace-nowrap text-xs px-4 py-2 rounded-full
                  ${isActive 
                    ? `bg-gradient-to-r ${gradientColor} text-white shadow-lg` 
                    : 'bg-white/10 border-purple-500/30 text-white hover:bg-white/20'
                  }
                `}
              >
                <IconComponent className="w-4 h-4" />
                <span className="font-medium">
                  {category === "all" ? "All" : category}
                </span>
                {category !== "all" && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {categorizedServices[category]?.length || 0}
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Services Grid */}
      <div className="px-4 pb-20">
        {displayServices.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {displayServices.map((service: Service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <AdminMessage />
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-purple-400/50" />
              <h3 className="text-lg font-semibold text-white mb-2">No Services Available</h3>
              <p className="text-muted-foreground">
                Admin must enable services from Service Visibility Control panel
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}