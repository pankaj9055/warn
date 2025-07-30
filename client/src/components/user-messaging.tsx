import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Send, Clock, CheckCircle } from "lucide-react";

import { format } from "date-fns";

interface UserMessage {
  id: number;
  userId: number;
  adminId?: number;
  message: string;
  isFromAdmin: boolean;
  isRead: boolean;
  createdAt: string;
  username?: string;
  adminName?: string;
}

export function UserMessaging() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState("");

  const { data: messages = [], isLoading } = useQuery<UserMessage[]>({
    queryKey: ["/api/user-messages"],
    enabled: !!user,
  });

  const createMessageMutation = useMutation({
    mutationFn: async (messageData: { message: string }) => {
      const response = await fetch("/api/user-messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageData),
      });
      if (!response.ok) throw new Error("Failed to send message");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-messages"] });
      setNewMessage("");
      toast({
        title: "Message sent",
        description: "Your message has been sent to the admin team.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message. Please try again.",
      });
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: number) => {
      const response = await fetch(`/api/user-messages/${messageId}/read`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to mark as read");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-messages"] });
    },
  });

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    createMessageMutation.mutate({ message: newMessage.trim() });
  };

  const handleMarkAsRead = (messageId: number) => {
    markAsReadMutation.mutate(messageId);
  };

  if (!user) return null;

  return (
    <Card className="glass-card border-border/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-400" />
          Messages
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Message List */}
        <ScrollArea className="h-64 w-full rounded-md border border-border/20 p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-sm text-gray-400">Loading messages...</div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center">
              <div className="text-sm text-gray-400">
                No messages yet. Send a message to the admin team below.
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-3 rounded-lg ${
                    message.isFromAdmin
                      ? "bg-blue-500/10 border-l-4 border-blue-500"
                      : "bg-gray-500/10 border-l-4 border-gray-500"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={message.isFromAdmin ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {message.isFromAdmin ? "Admin" : "You"}
                      </Badge>
                      {!message.isRead && !message.isFromAdmin && (
                        <Badge variant="outline" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                      {message.isRead && !message.isFromAdmin && (
                        <Badge variant="outline" className="text-xs text-green-400">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Read
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">
                      {format(new Date(message.createdAt), "MMM dd, HH:mm")}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed">{message.message}</p>
                  {message.isFromAdmin && !message.isRead && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2 text-xs"
                      onClick={() => handleMarkAsRead(message.id)}
                    >
                      Mark as Read
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* New Message Form */}
        <div className="space-y-2">
          <Textarea
            placeholder="Type your message to the admin team..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="min-h-[80px] resize-none"
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">
              {newMessage.length}/500 characters
            </span>
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || createMessageMutation.isPending}
              size="sm"
              className="min-w-[80px]"
            >
              {createMessageMutation.isPending ? (
                "Sending..."
              ) : (
                <>
                  <Send className="h-4 w-4 mr-1" />
                  Send
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}