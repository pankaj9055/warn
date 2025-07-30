import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ServiceCard } from "@/components/service-card";
import { Zap, Users, ShoppingBag, TrendingUp, Clock } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function Home() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && user) {
      setLocation("/dashboard");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (user) {
    return null;
  }

  const serviceData = [
    {
      name: "Instagram",
      icon: "fab fa-instagram",
      color: "#e4405f",
      services: [
        { name: "Followers", price: "₹0.15/1K" },
        { name: "Likes", price: "₹0.12/1K" },
        { name: "Views", price: "₹0.08/1K" },
      ],
    },
    {
      name: "YouTube", 
      icon: "fab fa-youtube",
      color: "#ff0000",
      services: [
        { name: "Views", price: "₹0.05/1K" },
        { name: "Subscribers", price: "₹0.25/1K" },
        { name: "Likes", price: "₹0.10/1K" },
      ],
    },
    {
      name: "TikTok",
      icon: "fab fa-tiktok", 
      color: "#000000",
      services: [
        { name: "Views", price: "₹0.03/1K" },
        { name: "Followers", price: "₹0.18/1K" },
        { name: "Likes", price: "₹0.08/1K" },
      ],
    },
    {
      name: "Twitter",
      icon: "fab fa-twitter",
      color: "#1da1f2",
      services: [
        { name: "Followers", price: "₹0.22/1K" },
        { name: "Likes", price: "₹0.14/1K" },
        { name: "Retweets", price: "₹0.16/1K" },
      ],
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-orange-500/5 to-red-500/5"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-900/20 via-transparent to-transparent"></div>
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 flex items-center justify-center shadow-2xl shadow-orange-500/30">
                <Zap className="text-white" size={36} />
              </div>
              <span className="text-5xl font-bold elite-title bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">JKSMM</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="gradient-text premium-font">Owner Nitin's</span><br />
              <span className="elite-title bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">Elite SMM Hub</span>
            </h1>
            
            <div className="text-xl text-gray-300 max-w-4xl mx-auto mb-3 kashmir-text">
              <span className="text-yellow-400 text-2xl">🏔️ Jammu & Kashmir Ka</span> <span className="text-orange-400 text-xl">Premium Social Media Marketing</span>
            </div>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto mb-8 premium-font leading-relaxed">
              Professional services se apne social media presence ko boost karo. <br/>
              <span className="text-yellow-300 font-semibold">Kashmir valley se pure India tak</span> ki <span className="text-orange-300 font-semibold">trusted SMM services</span>.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button 
                onClick={() => setLocation("/register")}
                className="px-10 py-5 rounded-2xl text-white font-bold text-lg premium-font bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-400 hover:via-orange-400 hover:to-red-400 shadow-2xl shadow-orange-500/40 hover:shadow-orange-500/60 transition-all duration-300 transform hover:scale-105"
              >
                <Zap className="mr-3" size={24} />
                शुरू करें - Start Now
              </Button>
              <Button 
                variant="outline"
                onClick={() => setLocation("/login")}
                className="px-10 py-5 rounded-2xl font-bold text-lg premium-font border-2 border-yellow-400/50 text-yellow-400 hover:border-yellow-400 hover:bg-yellow-400/10 hover:text-yellow-300 shadow-xl shadow-yellow-400/20 transition-all duration-300 transform hover:scale-105"
              >
                Login - प्रवेश करें
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            <div className="glass-card p-6 rounded-2xl text-center hover-lift">
              <div className="text-3xl font-bold gradient-text mb-2">50K+</div>
              <div className="text-gray-400 text-sm">Active Users</div>
            </div>
            <div className="glass-card p-6 rounded-2xl text-center hover-lift">
              <div className="text-3xl font-bold gradient-text mb-2">2M+</div>
              <div className="text-gray-400 text-sm">Orders Completed</div>
            </div>
            <div className="glass-card p-6 rounded-2xl text-center hover-lift">
              <div className="text-3xl font-bold gradient-text mb-2">99.9%</div>
              <div className="text-gray-400 text-sm">Uptime</div>
            </div>
            <div className="glass-card p-6 rounded-2xl text-center hover-lift">
              <div className="text-3xl font-bold gradient-text mb-2">24/7</div>
              <div className="text-gray-400 text-sm">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">
            <span className="gradient-text">Available Services</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {serviceData.map((service, index) => (
              <ServiceCard
                key={service.name}
                name={service.name}
                icon={service.icon}
                color={service.color}
                services={service.services}
                delay={index * 0.2}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-dark-base/50 to-dark-card/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">
            <span className="gradient-text">Why Choose NeonSMM?</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card p-8 rounded-2xl text-center hover-lift">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-4">Instant Delivery</h3>
              <p className="text-gray-400">Orders start processing immediately after payment confirmation.</p>
            </div>

            <div className="glass-card p-8 rounded-2xl text-center hover-lift">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-4">High Quality</h3>
              <p className="text-gray-400">Real, high-quality engagement from active users worldwide.</p>
            </div>

            <div className="glass-card p-8 rounded-2xl text-center hover-lift">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-4">24/7 Support</h3>
              <p className="text-gray-400">Round-the-clock customer support to help with any questions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-base py-12 px-4 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Zap className="text-white" size={20} />
                </div>
                <span className="text-2xl font-bold gradient-text">JKSMM</span>
              </div>
              <p className="text-gray-400">Premium underground SMM panel with advanced aesthetics and professional results.</p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4 gradient-text">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Instagram Marketing</li>
                <li>YouTube Growth</li>
                <li>TikTok Promotion</li>
                <li>Twitter Engagement</li>
                <li>All Social Platforms</li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4 gradient-text">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li>24/7 Support</li>
                <li>Auto Order Processing</li>
                <li>Referral Program</li>
                <li>API Access</li>
                <li>Secure Payments</li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4 gradient-text">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Live Chat</li>
                <li>API Documentation</li>
                <li>Terms of Service</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 JKSMM. All rights reserved. Premium SMM Panel with Underground Aesthetics.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
