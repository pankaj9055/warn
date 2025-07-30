import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { MessageCircle, Send, Search } from "lucide-react";
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

export default function AdminUserMessages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [replyMessage, setReplyMessage] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUsername, setSelectedUsername] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], isLoading } = useQuery<UserMessage[]>({
    queryKey: ["/api/admin/user-messages"],
    enabled: !!user?.isAdmin,
  });

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedUserId]);

  // Auto-refresh messages every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/user-messages"] });
    }, 3000);
    return () => clearInterval(interval);
  }, [queryClient]);

  const replyToMessageMutation = useMutation({
    mutationFn: (data: { userId: number; message: string }) =>
      apiRequest("POST", "/api/admin/user-messages", data),
    onSuccess: () => {
      toast({ title: "Message sent" });
      setReplyMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/admin/user-messages"] });
    },
    onError: () => {
      toast({ 
        title: "Failed to send message", 
        variant: "destructive" 
      });
    },
  });

  const handleSendMessage = () => {
    if (!replyMessage.trim() || !selectedUserId) return;
    replyToMessageMutation.mutate({ 
      userId: selectedUserId, 
      message: replyMessage.trim() 
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!user?.isAdmin) return null;

  // Group messages by user
  const groupedMessages = messages.reduce((groups, message) => {
    const userId = message.userId;
    if (!groups[userId]) {
      groups[userId] = {
        username: message.username,
        messages: []
      };
    }
    groups[userId].messages.push(message);
    return groups;
  }, {} as Record<number, { username: string; messages: UserMessage[] }>);

  const unreadCount = messages.filter(m => !m.isFromAdmin && !m.isRead).length;

  // Filter users based on search
  const filteredUsers = Object.entries(groupedMessages).filter(([userId, data]) =>
    data.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get selected user's messages
  const selectedUserMessages = selectedUserId ? groupedMessages[selectedUserId]?.messages || [] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      <Navigation />
      
      <main className="pt-16 h-screen">
        <div className="h-full flex">
          {/* Sidebar - User List */}
          <div className="w-1/3 border-r border-gray-700 bg-gray-900/50 backdrop-blur-xl flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold gradient-text">Messages</h1>
                {unreadCount > 0 && (
                  <Badge className="bg-red-500 text-white px-3 py-1">
                    {unreadCount}
                  </Badge>
                )}
              </div>
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="neon-input bg-gray-800 border-gray-600 pl-10 text-white"
                />
              </div>
            </div>

            {/* User List */}
            <ScrollArea className="flex-1">
              {isLoading ? (
                <div className="flex items-center justify-center h-20">
                  <LoadingSpinner />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  {searchTerm ? "No users found" : "No messages yet"}
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {filteredUsers.map(([userId, data]) => {
                    const userIdNum = parseInt(userId);
                    const lastMessage = data.messages[data.messages.length - 1];
                    const hasUnread = data.messages.some(m => !m.isFromAdmin && !m.isRead);
                    const isSelected = selectedUserId === userIdNum;
                    
                    return (
                      <div
                        key={userId}
                        onClick={() => {
                          setSelectedUserId(userIdNum);
                          setSelectedUsername(data.username);
                        }}
                        className={`p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                          isSelected 
                            ? 'bg-purple-600/30 border border-purple-500/50' 
                            : 'hover:bg-gray-700/50 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-12 h-12">
                            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold">
                              {data.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-white truncate">
                                {data.username}
                              </h3>
                              <span className="text-xs text-gray-400">
                                {format(new Date(lastMessage.createdAt), 'HH:mm')}
                              </span>
                            </div>
                            <p className="text-sm text-gray-400 truncate">
                              {lastMessage.isFromAdmin ? 'You: ' : ''}{lastMessage.message}
                            </p>
                          </div>
                          
                          {hasUnread && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col bg-gray-900/30 backdrop-blur-xl">
            {selectedUserId ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-700 bg-gray-800/50">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                        {selectedUsername.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="font-semibold text-white">{selectedUsername}</h2>
                      <p className="text-sm text-green-400">Active now</p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {selectedUserMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isFromAdmin ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                          message.isFromAdmin
                            ? 'bg-purple-600 text-white ml-auto'
                            : 'bg-gray-700 text-white'
                        }`}>
                          <p className="text-sm">{message.message}</p>
                          <p className={`text-xs mt-1 ${
                            message.isFromAdmin ? 'text-purple-200' : 'text-gray-400'
                          }`}>
                            {format(new Date(message.createdAt), 'HH:mm')}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-700 bg-gray-800/50">
                  <div className="flex items-end space-x-3">
                    <div className="flex-1">
                      <Input
                        placeholder={`Type your message to ${selectedUsername}...`}
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="neon-input bg-gray-700 border-gray-600 text-white resize-none"
                      />
                    </div>
                    <Button
                      onClick={handleSendMessage}
                      disabled={!replyMessage.trim() || replyToMessageMutation.isPending}
                      className="neo-button px-4 py-2 rounded-xl"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">Select a conversation</h3>
                  <p className="text-gray-500">Choose a user from the left to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}