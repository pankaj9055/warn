import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, AlertCircle } from "lucide-react";

export default function AdminMessage() {
  const { user } = useAuth();
  const [dismissedMessages, setDismissedMessages] = useState<number[]>(() => {
    const saved = localStorage.getItem('dismissedAdminMessages');
    return saved ? JSON.parse(saved) : [];
  });

  const { data: adminMessages = [] } = useQuery({
    queryKey: ["/api/admin-messages"],
    enabled: !!user && !user.isAdmin, // Only show to regular users
  });

  const dismissMessage = (messageId: number) => {
    const newDismissed = [...dismissedMessages, messageId];
    setDismissedMessages(newDismissed);
    localStorage.setItem('dismissedAdminMessages', JSON.stringify(newDismissed));
  };

  const activeMessages = adminMessages.filter((msg: any) => 
    msg.isActive && !dismissedMessages.includes(msg.id)
  );

  if (!user || user.isAdmin || activeMessages.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {activeMessages.map((message: any) => (
        <Card key={message.id} className="bg-gradient-to-r from-orange-900/20 to-red-900/20 border-orange-500/30">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <AlertCircle className="text-orange-400 mt-0.5" size={20} />
                <div>
                  <h4 className="font-semibold text-orange-200 mb-1">{message.title}</h4>
                  <p className="text-sm text-orange-100">{message.message}</p>
                  <p className="text-xs text-orange-300 mt-2">
                    Posted: {new Date(message.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dismissMessage(message.id)}
                className="text-orange-400 hover:text-orange-300 hover:bg-orange-900/20"
              >
                <X size={16} />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}