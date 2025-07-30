import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { MessageCircle, Send, User, Shield, Clock } from "lucide-react";
import { format } from "date-fns";

interface UserMessage {
  id: number;
  userId: number;
  message: string;
  isFromAdmin: boolean | null;
  adminId?: number | null;
  createdAt: string;
  isRead: boolean | null;
}

export function UserMessagingImproved() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState("");

  const { data: messages = [], isLoading } = useQuery<UserMessage[]>({
    queryKey: ["/api/user-messages"],
    enabled: !!user,
  });

  const sendMessageMutation = useMutation({
    mutationFn: (message: string) =>
      apiRequest("POST", "/api/user-messages", { message }),
    onSuccess: () => {
      toast({ title: "Message sent successfully" });
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/user-messages"] });
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

  const markAsReadMutation = useMutation({
    mutationFn: (messageId: number) =>
      apiRequest("PUT", `/api/user-messages/${messageId}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-messages"] });
    },
  });

  if (!user) return null;

  const unreadCount = messages.filter(m => !m.isRead && m.isFromAdmin).length;

  return (
    <Card className="glass-card border-border/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-blue-400" />
            Messages with Admin
          </div>
          {unreadCount > 0 && (
            <Badge className="bg-red-500 text-white">
              {unreadCount} new
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Messages List */}
        <ScrollArea className="h-64 w-full">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <LoadingSpinner />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center">
              <div className="text-sm text-gray-400">
                No messages yet. Send a message to admin below.
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-3 rounded-lg ${
                    message.isFromAdmin
                      ? "bg-blue-500/10 border-l-2 border-blue-500 ml-2"
                      : "bg-gray-800/30 border-l-2 border-purple-500 mr-2"
                  }`}
                  onClick={() => {
                    if (message.isFromAdmin && !message.isRead) {
                      markAsReadMutation.mutate(message.id);
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-700/50 rounded-lg flex items-center justify-center">
                      {message.isFromAdmin ? (
                        <Shield className="h-4 w-4 text-blue-400" />
                      ) : (
                        <User className="h-4 w-4 text-purple-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {message.isFromAdmin ? "Admin" : "You"}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock size={10} />
                          {format(new Date(message.createdAt), "MMM dd, HH:mm")}
                        </span>
                        {message.isFromAdmin && !message.isRead && (
                          <Badge className="bg-red-500 text-white text-xs">New</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {message.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Send Message Form */}
        <div className="space-y-3 border-t border-gray-700/50 pt-4">
          <Textarea
            placeholder="Type your message to admin..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="min-h-[80px] bg-gray-800/50 border-gray-600"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sendMessageMutation.isPending}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <Send size={16} className="mr-2" />
            {sendMessageMutation.isPending ? "Sending..." : "Send Message"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}