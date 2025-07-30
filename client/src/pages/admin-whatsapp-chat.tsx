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
import { MessageCircle, Send, Search, ArrowLeft } from "lucide-react";
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

interface UserConversation {
  userId: number;
  username: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isFromAdmin: boolean;
}

export default function AdminWhatsAppChat() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUsername, setSelectedUsername] = useState<string>("");
  const [replyMessage, setReplyMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], isLoading } = useQuery<UserMessage[]>({
    queryKey: ["/api/admin/user-messages"],
    enabled: !!user?.isAdmin,
    refetchInterval: 3000, // Auto-refresh every 3 seconds
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedUserId]);

  // Auto-refresh every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/user-messages"] });
    }, 3000);
    return () => clearInterval(interval);
  }, [queryClient]);

  const sendMessageMutation = useMutation({
    mutationFn: (data: { userId: number; message: string }) =>
      apiRequest("POST", "/api/admin/user-messages", data),
    onSuccess: () => {
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
    sendMessageMutation.mutate({ 
      userId: selectedUserId, 
      message: replyMessage.trim() 
    });
  };

  // Group messages by user and create conversations
  const conversations: UserConversation[] = [];
  const messagesByUser = messages.reduce((acc, msg) => {
    if (!acc[msg.userId]) {
      acc[msg.userId] = [];
    }
    acc[msg.userId].push(msg);
    return acc;
  }, {} as Record<number, UserMessage[]>);

  Object.keys(messagesByUser).forEach((userIdStr) => {
    const userId = parseInt(userIdStr);
    const userMessages = messagesByUser[userId].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    const lastMessage = userMessages[userMessages.length - 1];
    const unreadCount = userMessages.filter(msg => !msg.isFromAdmin && !msg.isRead).length;

    conversations.push({
      userId,
      username: lastMessage.username,
      lastMessage: lastMessage.message,
      lastMessageTime: lastMessage.createdAt,
      unreadCount,
      isFromAdmin: !!lastMessage.isFromAdmin,
    });
  });

  // Sort conversations by last message time
  conversations.sort((a, b) => 
    new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
  );

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv =>
    conv.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get current conversation messages
  const currentMessages = selectedUserId ? 
    (messagesByUser[selectedUserId] || []).sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    ) : [];

  if (!user?.isAdmin) {
    return <div className="text-center py-8 text-red-400">Access denied. Admin only.</div>;
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="pt-20">
        <section className="py-8 px-4">
          <div className="max-w-7xl mx-auto h-[calc(100vh-160px)]">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
              
              {/* Users List Sidebar */}
              <div className={`lg:col-span-1 ${selectedUserId ? 'hidden lg:block' : ''}`}>
                <Card className="glass-card border-border/20 h-full">
                  <CardHeader className="pb-4">
                    <CardTitle className="gradient-text flex items-center gap-2">
                      <MessageCircle size={24} />
                      Messages with Users
                    </CardTitle>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="neon-input bg-dark-card border-gray-600 pl-10"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[calc(100vh-300px)]">
                      {filteredConversations.length === 0 ? (
                        <div className="text-center py-8">
                          <MessageCircle className="mx-auto text-gray-500 mb-4" size={48} />
                          <p className="text-gray-400">No messages yet</p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {filteredConversations.map((conv) => (
                            <div
                              key={conv.userId}
                              onClick={() => {
                                setSelectedUserId(conv.userId);
                                setSelectedUsername(conv.username);
                              }}
                              className={`p-4 cursor-pointer transition-colors border-b border-gray-700/50 hover:bg-gray-800/50 ${
                                selectedUserId === conv.userId ? 'bg-purple-900/20 border-purple-500/30' : ''
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                                    {conv.username.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-white truncate">
                                      {conv.username}
                                    </h3>
                                    <span className="text-xs text-gray-400">
                                      {format(new Date(conv.lastMessageTime), "HH:mm")}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-400 truncate">
                                    {conv.isFromAdmin ? "You: " : ""}{conv.lastMessage}
                                  </p>
                                </div>
                                {conv.unreadCount > 0 && (
                                  <div className="bg-green-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                                    {conv.unreadCount}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* Chat Area */}
              <div className={`lg:col-span-2 ${!selectedUserId ? 'hidden lg:block' : ''}`}>
                <Card className="glass-card border-border/20 h-full flex flex-col">
                  {selectedUserId ? (
                    <>
                      {/* Chat Header */}
                      <CardHeader className="pb-4 border-b border-gray-700/50">
                        <div className="flex items-center gap-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedUserId(null)}
                            className="lg:hidden"
                          >
                            <ArrowLeft size={16} />
                          </Button>
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                              {selectedUsername.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-white">{selectedUsername}</h3>
                            <p className="text-sm text-green-400">Online</p>
                          </div>
                        </div>
                      </CardHeader>

                      {/* Messages */}
                      <CardContent className="flex-1 p-4">
                        <ScrollArea className="h-[calc(100vh-420px)]">
                          <div className="space-y-4">
                            {currentMessages.map((msg) => (
                              <div
                                key={msg.id}
                                className={`flex ${msg.isFromAdmin ? 'justify-end' : 'justify-start'}`}
                              >
                                <div
                                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                    msg.isFromAdmin
                                      ? 'bg-purple-600 text-white rounded-br-none'
                                      : 'bg-gray-700 text-white rounded-bl-none'
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
                        </ScrollArea>
                      </CardContent>

                      {/* Message Input */}
                      <div className="p-4 border-t border-gray-700/50">
                        <div className="flex space-x-2">
                          <Input
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            placeholder={`Type your message to ${selectedUsername}...`}
                            className="neon-input bg-dark-card border-gray-600"
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          />
                          <Button
                            onClick={handleSendMessage}
                            disabled={!replyMessage.trim() || sendMessageMutation.isPending}
                            className="neo-button px-4"
                          >
                            <Send size={16} />
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <CardContent className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <MessageCircle className="mx-auto text-gray-500 mb-4" size={64} />
                        <h3 className="text-xl font-bold text-gray-400 mb-2">Select a conversation</h3>
                        <p className="text-gray-500">Choose a user from the sidebar to start chatting</p>
                      </div>
                    </CardContent>
                  )}
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}