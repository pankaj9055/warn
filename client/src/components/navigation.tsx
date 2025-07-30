import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { CurrencySelector } from "@/components/currency-selector";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Menu, 
  X, 
  Home, 
  ShoppingCart, 
  Users, 
  Settings, 
  LogOut,
  Wallet,
  Gift,
  MessageSquare,
  Key,
  CreditCard,
  Download,
  Calculator
} from "lucide-react";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/services", label: "Services", icon: ShoppingCart },
    { href: "/my-orders", label: "My Orders", icon: ShoppingCart },
    { href: "/wallet", label: "Wallet", icon: Wallet },
    { href: "/referrals", label: "Referrals", icon: Gift },
    { href: "/support", label: "Support", icon: MessageSquare },
  ];

  const adminItems = [
    { href: "/admin", label: "Admin Panel", icon: Settings },
    { href: "/admin-users", label: "Manage Users", icon: Users },
    { href: "/admin-services", label: "Manage Services", icon: Settings },

    { href: "/admin-providers", label: "Provider APIs", icon: Key },
    { href: "/admin-manual-import", label: "Import Services", icon: Download },
    { href: "/admin-payment-methods", label: "Payment Methods", icon: CreditCard },
    { href: "/admin-support-contacts", label: "Support Contacts", icon: MessageSquare },
    { href: "/admin-support-tickets", label: "Support Tickets", icon: MessageSquare },
    { href: "/admin-whatsapp-chat", label: "WhatsApp Chat", icon: MessageSquare },
    { href: "/admin-api-settings", label: "API Settings", icon: Settings },
    { href: "/admin/settings", label: "System Settings", icon: Settings },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            {localStorage.getItem('customLogo') ? (
              <>
                <img 
                  src={localStorage.getItem('customLogo') || ''} 
                  alt="JKSMM Logo" 
                  className="h-12 w-12 object-cover rounded-full shadow-lg border-2 border-white/20"
                />
                <span className="text-2xl font-bold gradient-text">JKSMM</span>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center shadow-xl border-2 border-white/20">
                  <span className="text-white font-bold text-lg">J</span>
                </div>
                <span className="text-2xl font-bold gradient-text">JKSMM</span>
              </>
            )}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {user && (
              <>
                <div className="flex items-center">
                  <CurrencySelector />
                </div>
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={location === item.href ? "default" : "ghost"}
                      size="sm"
                      className={location === item.href ? "neo-button" : ""}
                    >
                      <item.icon size={16} className="mr-2" />
                      {item.label}
                    </Button>
                  </Link>
                ))}
                
                {user.isAdmin && (
                  <>
                    <div className="w-px h-6 bg-border/20" />
                    {adminItems.map((item) => (
                      <Link key={item.href} href={item.href}>
                        <Button
                          variant={location === item.href ? "default" : "ghost"}
                          size="sm"
                          className={location === item.href ? "neo-button" : "text-purple-400"}
                        >
                          <item.icon size={16} className="mr-2" />
                          {item.label}
                        </Button>
                      </Link>
                    ))}
                  </>
                )}
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="hidden md:flex items-center space-x-2">
                  <Wallet size={16} className="text-green-400" />
                  <span className="text-green-400 font-semibold">₹{user.walletBalance}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="hidden md:block">
                    <p className="text-sm font-semibold">{user.username}</p>
                    {user.isAdmin && (
                      <Badge className="bg-purple-500 text-white text-xs">Admin</Badge>
                    )}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-red-400"
                  >
                    <LogOut size={16} />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="neo-button">Sign Up</Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border/20">
            <div className="space-y-2">
              {user && navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon size={16} className="mr-2" />
                    {item.label}
                  </Button>
                </Link>
              ))}
              
              {user?.isAdmin && (
                <>
                  <div className="border-t border-border/20 pt-2 mt-2">
                    <p className="text-xs text-purple-400 font-semibold mb-2 px-4">Admin</p>
                    {adminItems.map((item) => (
                      <Link key={item.href} href={item.href}>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-purple-400"
                          onClick={() => setIsOpen(false)}
                        >
                          <item.icon size={16} className="mr-2" />
                          {item.label}
                        </Button>
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}