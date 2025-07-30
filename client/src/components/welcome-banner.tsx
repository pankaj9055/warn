import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Crown, Sparkles } from "lucide-react";

interface WelcomeBannerProps {
  user?: {
    username: string;
    isAdmin?: boolean;
  };
  showLoginMessage?: boolean;
}

export default function WelcomeBanner({ user, showLoginMessage = false }: WelcomeBannerProps) {
  return (
    <Card className="glass-card border-2 border-purple-500/30 bg-gradient-to-r from-purple-900/20 via-pink-900/20 to-purple-900/20 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 animate-pulse"></div>
      
      <CardContent className="relative p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Main Title */}
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-purple-400" />
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Welcome to JKSMM
            </h1>
            <Sparkles className="w-5 h-5 text-pink-400" />
          </div>
          
          {/* Subtitle */}
          <div className="space-y-2">
            <p className="text-base font-semibold text-purple-300">
              Jammu Kashmir's Premier Social Media Marketing Panel
            </p>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Experience the beauty of Jammu Kashmir through our professional SMM services. 
              Boost your social media presence with our authentic, high-quality services.
            </p>
          </div>

          {/* User-specific message */}
          {user && (
            <div className="flex items-center gap-2 mt-4">
              {user.isAdmin && (
                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-semibold">
                  <Crown className="w-3 h-3 mr-1" />
                  Admin
                </Badge>
              )}
              <Badge variant="outline" className="text-purple-300 border-purple-400">
                {showLoginMessage ? "Welcome back" : "Hello"}, {user.username}!
              </Badge>
            </div>
          )}

          {/* Features */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <Badge variant="secondary" className="text-xs">
              🏔️ Jammu Kashmir Quality
            </Badge>
            <Badge variant="secondary" className="text-xs">
              ⚡ Instant Delivery
            </Badge>
            <Badge variant="secondary" className="text-xs">
              🔒 100% Safe
            </Badge>
            <Badge variant="secondary" className="text-xs">
              💎 Premium Services
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}