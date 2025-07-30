import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useCurrency } from "@/hooks/use-currency";
import { Navigation } from "@/components/navigation";
import { OrderForm } from "@/components/order-form";
import { ServiceNoteModal } from "@/components/service-note-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { 
  Search, 
  Star, 
  Clock, 
  Users, 
  TrendingUp,
  Filter,
  ShoppingCart
} from "lucide-react";

export default function Services() {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedService, setSelectedService] = useState<any>(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [pendingService, setPendingService] = useState<any>(null);

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/services/categories"],
    enabled: !!user,
  });

  const { data: services = [], isLoading: servicesLoading } = useQuery({
    queryKey: ["/api/services", selectedCategory],
    queryFn: async () => {
      const url = selectedCategory 
        ? `/api/services?categoryId=${selectedCategory}` 
        : "/api/services";
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch services');
      return response.json();
    },
    enabled: !!user,
  });

  const filteredServices = (services as any[]).filter((service: any) =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getServiceIcon = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case 'instagram': return '📷';
      case 'youtube': return '📺';
      case 'facebook': return '👥';
      case 'tiktok': return '🎵';
      case 'twitter': return '🐦';
      default: return '🚀';
    }
  };

  const getCategoryColor = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case 'instagram': return 'from-pink-500 to-purple-600';
      case 'youtube': return 'from-red-500 to-red-600';
      case 'facebook': return 'from-blue-500 to-blue-600';
      case 'tiktok': return 'from-black to-gray-800';
      case 'twitter': return 'from-blue-400 to-blue-500';
      default: return 'from-purple-500 to-pink-500';
    }
  };

  if (!user) {
    return <div>Please login to view services</div>;
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="pt-20">
        {/* Header Section */}
        <section className="py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4">
                <span className="gradient-text">Premium SMM Services</span>
              </h1>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Boost your social media presence with our high-quality, fast delivery services
              </p>
            </div>

            {/* Search and Filter */}
            <div className="max-w-md mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="neon-input bg-dark-card border-gray-600 text-white placeholder-gray-500 pl-10"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 gradient-text">Service Categories</h2>
            
            {categoriesLoading ? (
              <div className="flex justify-center">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                <Button
                  variant={selectedCategory === null ? "default" : "outline"}
                  onClick={() => setSelectedCategory(null)}
                  className="h-20 flex flex-col items-center justify-center glass-card border-border/20"
                >
                  <span className="text-2xl mb-1">🌟</span>
                  <span className="text-sm font-bold">All Services</span>
                </Button>
                
                {(categories as any[]).map((category: any) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category.id)}
                    className="h-20 flex flex-col items-center justify-center glass-card border-border/20"
                  >
                    <span className="text-2xl mb-1">{getServiceIcon(category.name)}</span>
                    <span className="text-sm font-bold">{category.name}</span>
                  </Button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold gradient-text">
                {selectedCategory 
                  ? (categories as any[]).find((c: any) => c.id === selectedCategory)?.name + " Services"
                  : "All Services"
                }
              </h2>
              <Badge variant="secondary" className="bg-purple-900/30 border-purple-500/30">
                {filteredServices.length} services
              </Badge>
            </div>

            {servicesLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="text-center py-12">
                <Search className="mx-auto text-gray-500 mb-3" size={48} />
                <p className="text-gray-400">No services found matching your criteria</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map((service: any) => (
                  <Card key={service.id} className="glass-card border-border/20 hover:border-purple-500/50 transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg service-name mb-2 leading-tight">
                            {service.name}
                          </CardTitle>
                          <p className="text-sm text-gray-400 line-clamp-2">
                            {service.description}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          <Star className="text-yellow-400" size={14} />
                          <span className="text-xs text-gray-400">4.8</span>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-3">
                        {/* Pricing */}
                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-lg border border-purple-500/20">
                          <span className="text-sm text-gray-300">Price per 1000</span>
                          <span className="text-lg font-bold text-green-400">
                            {formatPrice(service.pricePerThousand, 'INR')}
                          </span>
                        </div>

                        {/* Service Stats */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center space-x-1">
                            <Users size={12} className="text-blue-400" />
                            <span className="text-gray-400">Min: {service.minQuantity}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <TrendingUp size={12} className="text-green-400" />
                            <span className="text-gray-400">Max: {service.maxQuantity}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock size={12} className="text-yellow-400" />
                            <span className="text-gray-400">Start: 0-1H</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star size={12} className="text-purple-400" />
                            <span className="text-gray-400">Quality: HQ</span>
                          </div>
                        </div>

                        {/* Order Button */}
                        <Button
                          onClick={() => {
                            setPendingService(service);
                            setShowNoteModal(true);
                          }}
                          className="w-full neo-button mt-4"
                        >
                          <ShoppingCart size={16} className="mr-2" />
                          Order Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Service Note Modal */}
      <ServiceNoteModal
        isOpen={showNoteModal}
        onClose={() => {
          setShowNoteModal(false);
          setPendingService(null);
        }}
        onProceed={() => {
          setSelectedService(pendingService);
          setPendingService(null);
        }}
        serviceName={pendingService?.name || ""}
      />

      {/* Order Modal */}
      {selectedService && (
        <OrderForm 
          service={selectedService} 
          onClose={() => setSelectedService(null)} 
        />
      )}
    </div>
  );
}