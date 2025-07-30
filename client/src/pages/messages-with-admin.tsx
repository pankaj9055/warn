import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { MessageCircle, Send } from "lucide-react";
import { format } from "date-fns";

interface UserMessage {
  id: number;
  userId: number;
  username: string;
  message: string;
  isFromAdmin: boolean | null;
  adminId?: number | null;
  createdAt: string;
  isRead: boolean | null;
}

export default function MessagesWithAdmin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], isLoading } = useQuery<UserMessage[]>({
    queryKey: ["/api/user-messages"],
    enabled: !!user,
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-refresh every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-messages"] });
    }, 3000);
    return () => clearInterval(interval);
  }, [queryClient]);

  const sendMessageMutation = useMutation({
    mutationFn: (message: string) =>
      apiRequest("POST", "/api/user-messages", { message }),
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/user-messages"] });
      toast({ title: "Message sent to admin" });
    },
    onError: () => {
      toast({ 
        title: "Failed to send message", 
        variant: "destructive" 
      });
    },
  });

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    sendMessageMutation.mutate(newMessage.trim());
  };

  if (!user) {
    return <div className="text-center py-8 text-red-400">Please login to view messages</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Main Chat Interface */}
      <div className="max-w-md mx-auto p-4 pt-8">
        <Card className="glass-card border-border/20 min-h-[80vh] flex flex-col">
          {/* Chat Header */}
          <div className="p-6 border-b border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                <MessageCircle className="text-white" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Messages with Admin</h2>
                <p className="text-sm text-gray-400">
                  {messages.length === 0 ? "No messages yet. Send a message to admin below." : "Chat directly with admin support"}
                </p>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <CardContent className="flex-1 p-0">
            <ScrollArea className="h-[50vh] p-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <MessageCircle className="mx-auto mb-4 opacity-50" size={48} />
                  <p>No messages yet. Send a message to admin below.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.isFromAdmin ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[80%] px-4 py-2 rounded-lg ${
                          msg.isFromAdmin
                            ? 'bg-gray-700 text-white rounded-tl-none'
                            : 'bg-blue-600 text-white rounded-tr-none'
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {format(new Date(msg.createdAt), "HH:mm")}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>
          </CardContent>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-700/50">
            <div className="space-y-3">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message to admin..."
                className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || sendMessageMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Send size={16} className="mr-2" />
                Send Message
              </Button>
            </div>
          </div>
        </Card>
      </div>


    </div>
  );
}