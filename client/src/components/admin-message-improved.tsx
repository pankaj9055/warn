import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, AlertCircle, Info, CheckCircle, AlertTriangle } from "lucide-react";

interface AdminMessage {
  id: number;
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'success' | 'error';
  isActive: boolean;
  createdAt: string;
}

export default function AdminMessageImproved() {
  const [dismissedMessages, setDismissedMessages] = useState<number[]>([]);

  const { data: messages = [], isLoading } = useQuery<AdminMessage[]>({
    queryKey: ["/api/admin-messages"],
  });

  const handleMessageClick = (message: AdminMessage) => {
    // If this is a user message notification, open the user messages panel
    if (message.title.includes('New Message from') || message.title.includes('User Message') || message.message.includes('replied') || message.message.includes('Click to reply')) {
      window.open('/admin/user-messages', '_blank');
    }
  };

  const visibleMessages = messages.filter(
    (message) => message.isActive && !dismissedMessages.includes(message.id)
  );

  const getMessageIcon = (type?: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Info className="h-4 w-4 text-blue-400" />;
    }
  };

  const getMessageStyle = (type?: string) => {
    switch (type) {
      case 'success':
        return "border-green-500/30 bg-green-500/10";
      case 'warning':
        return "border-yellow-500/30 bg-yellow-500/10";
      case 'error':
        return "border-red-500/30 bg-red-500/10";
      default:
        return "border-blue-500/30 bg-blue-500/10";
    }
  };

  const handleDismiss = (messageId: number) => {
    setDismissedMessages(prev => [...prev, messageId]);
  };

  if (isLoading || visibleMessages.length === 0) return null;

  return (
    <div className="space-y-3 mb-6">
      {visibleMessages.map((message) => (
        <Card 
          key={message.id} 
          className={`${getMessageStyle(message.type)} border cursor-pointer hover:scale-[1.02] transition-all duration-200`}
          onClick={() => handleMessageClick(message)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="mt-0.5">
                  {getMessageIcon(message.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-white">{message.title}</h4>
                    {message.type && (
                      <Badge variant="outline" className="text-xs">
                        {message.type.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {message.message}
                  </p>
                  <div className="text-xs text-gray-400 mt-2">
                    {new Date(message.createdAt).toLocaleDateString()} at{' '}
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDismiss(message.id)}
                className="ml-2 h-6 w-6 p-0 hover:bg-white/10"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}