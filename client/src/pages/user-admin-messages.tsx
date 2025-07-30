import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { MessageCircle, Send, ArrowLeft } from "lucide-react";
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

export default function UserAdminMessages() {
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
    <div className="min-h-screen">
      <Navigation />
      
      <main className="pt-20">
        <section className="py-8 px-4">
          <div className="max-w-4xl mx-auto h-[calc(100vh-160px)]">
            <Card className="glass-card border-border/20 h-full flex flex-col">
              {/* Chat Header */}
              <CardHeader className="pb-4 border-b border-gray-700/50">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                      A
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="gradient-text flex items-center gap-2">
                      <MessageCircle size={24} />
                      Messages with Admin
                    </CardTitle>
                    <p className="text-sm text-green-400">Online</p>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 p-4">
                <ScrollArea className="h-[calc(100vh-320px)]">
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageCircle className="mx-auto text-gray-500 mb-4" size={64} />
                      <h3 className="text-xl font-bold text-gray-400 mb-2">No messages yet</h3>
                      <p className="text-gray-500">Send a message to admin below.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.isFromAdmin ? 'justify-start' : 'justify-end'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              msg.isFromAdmin
                                ? 'bg-gray-700 text-white rounded-bl-none'
                                : 'bg-purple-600 text-white rounded-br-none'
                            }`}
                          >
                            <p className="text-sm">{msg.message}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {format(new Date(msg.createdAt), "MMM dd, HH:mm")}
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
                <div className="flex space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message to admin..."
                    className="neon-input bg-dark-card border-gray-600"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sendMessageMutation.isPending}
                    className="neo-button px-4"
                  >
                    <Send size={16} />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}