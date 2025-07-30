import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  HelpCircle,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Send,
  User,
  Calendar,
  Eye,
  Filter,
  Search,
  MessageCircle,
  Reply,
  Ticket
} from "lucide-react";

export default function AdminSupportTicketsEnhanced() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  const { data: tickets = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/admin/support-tickets"],
    enabled: !!user?.isAdmin,
  });

  const replyMutation = useMutation({
    mutationFn: ({ ticketId, reply, status }: { ticketId: number; reply: string; status: string }) =>
      apiRequest(`/api/admin/support-tickets/${ticketId}/reply`, {
        method: 'PUT',
        body: { adminReply: reply, status }
      }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Reply sent successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/support-tickets"] });
      setReplyingTo(null);
      setReplyText("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send reply",
        variant: "destructive",
      });
    },
  });

  const handleReply = (ticketId: number) => {
    if (!replyText.trim()) {
      toast({
        title: "Error",
        description: "Please enter a reply message",
        variant: "destructive",
      });
      return;
    }

    replyMutation.mutate({
      ticketId,
      reply: replyText,
      status: 'replied'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open': return <Clock className="text-yellow-400" size={16} />;
      case 'replied': return <MessageCircle className="text-blue-400" size={16} />;
      case 'resolved': return <CheckCircle className="text-green-400" size={16} />;
      case 'closed': return <XCircle className="text-gray-400" size={16} />;
      default: return <HelpCircle className="text-gray-400" size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open': return 'bg-yellow-900/30 border-yellow-500/30 text-yellow-400';
      case 'replied': return 'bg-blue-900/30 border-blue-500/30 text-blue-400';
      case 'resolved': return 'bg-green-900/30 border-green-500/30 text-green-400';
      case 'closed': return 'bg-gray-900/30 border-gray-500/30 text-gray-400';
      default: return 'bg-gray-900/30 border-gray-500/30 text-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-900/30 border-red-500/30 text-red-400';
      case 'medium': return 'bg-orange-900/30 border-orange-500/30 text-orange-400';
      case 'low': return 'bg-blue-900/30 border-blue-500/30 text-blue-400';
      default: return 'bg-gray-900/30 border-gray-500/30 text-gray-400';
    }
  };

  const filteredTickets = tickets.filter((ticket: any) => {
    const matchesStatus = !statusFilter || ticket.status === statusFilter;
    const matchesSearch = !searchTerm || 
      ticket.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.ticketId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.id.toString().includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  const statusCounts = tickets.reduce((acc: any, ticket: any) => {
    acc[ticket.status] = (acc[ticket.status] || 0) + 1;
    return acc;
  }, {});

  if (!user?.isAdmin) {
    return <div>Access denied</div>;
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="pt-20">
        {/* Header Section */}
        <section className="py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  <span className="gradient-text">Support Tickets Management</span>
                </h1>
                <p className="text-gray-400">Manage and respond to customer support requests</p>
              </div>
              <Button onClick={() => refetch()} variant="outline" className="border-purple-500/30">
                <HelpCircle size={16} className="mr-2" />
                Refresh
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="glass-card border-border/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Total Tickets</p>
                      <p className="text-2xl font-bold text-white">{tickets.length}</p>
                    </div>
                    <Ticket className="text-purple-400" size={24} />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass-card border-border/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Open</p>
                      <p className="text-2xl font-bold text-yellow-400">{statusCounts.open || 0}</p>
                    </div>
                    <Clock className="text-yellow-400" size={24} />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-border/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Replied</p>
                      <p className="text-2xl font-bold text-blue-400">{statusCounts.replied || 0}</p>
                    </div>
                    <MessageCircle className="text-blue-400" size={24} />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-border/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Resolved</p>
                      <p className="text-2xl font-bold text-green-400">{statusCounts.resolved || 0}</p>
                    </div>
                    <CheckCircle className="text-green-400" size={24} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  placeholder="Search by user, subject, or ticket ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800/50 border-gray-600"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter size={20} className="text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white"
                >
                  <option value="">All Status</option>
                  <option value="open">Open</option>
                  <option value="replied">Replied</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Tickets List */}
        <section className="py-8 px-4">
          <div className="max-w-7xl mx-auto">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="text-center py-12">
                <HelpCircle className="mx-auto text-gray-500 mb-3" size={48} />
                <p className="text-gray-400 mb-2">No support tickets found</p>
                <p className="text-sm text-gray-500">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTickets.map((ticket: any) => (
                  <Card key={ticket.id} className="glass-card border-border/20">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-bold text-white">
                              {ticket.subject || 'Support Request'}
                            </h3>
                            <Badge className={getStatusColor(ticket.status)}>
                              <span className="flex items-center space-x-1">
                                {getStatusIcon(ticket.status)}
                                <span className="capitalize">{ticket.status}</span>
                              </span>
                            </Badge>
                            
                            {/* Priority Badge */}
                            {ticket.priority && (
                              <Badge className={getPriorityColor(ticket.priority)}>
                                <span className="capitalize">{ticket.priority} Priority</span>
                              </Badge>
                            )}

                            {/* Ticket ID */}
                            <div className="flex items-center space-x-2 bg-gray-800/50 px-3 py-1 rounded-lg">
                              <Ticket size={14} className="text-gray-400" />
                              <span className="text-sm text-gray-300 font-mono">{ticket.ticketId}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-400 mb-3">
                            <div className="flex items-center space-x-1">
                              <User size={14} />
                              <span>{ticket.username}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar size={14} />
                              <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                              <span>{new Date(ticket.createdAt).toLocaleTimeString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Ticket Content */}
                      <div className="mb-4 p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
                        <p className="text-sm text-gray-300 whitespace-pre-wrap">
                          {ticket.message || ticket.description}
                        </p>
                      </div>

                      {/* Admin Reply Section */}
                      {ticket.adminReply && (
                        <div className="mb-4 p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
                          <div className="flex items-center space-x-2 mb-2">
                            <Reply size={16} className="text-blue-400" />
                            <span className="text-sm font-semibold text-blue-300">Admin Reply:</span>
                          </div>
                          <p className="text-sm text-blue-200 whitespace-pre-wrap">
                            {ticket.adminReply}
                          </p>
                        </div>
                      )}

                      {/* Reply Interface */}
                      {replyingTo === ticket.id ? (
                        <div className="space-y-3">
                          <Textarea
                            placeholder="Type your reply here..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            rows={4}
                            className="bg-gray-800/50 border-gray-600"
                          />
                          <div className="flex items-center space-x-2">
                            <Button
                              onClick={() => handleReply(ticket.id)}
                              disabled={replyMutation.isPending}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              {replyMutation.isPending ? (
                                <LoadingSpinner size="sm" className="mr-2" />
                              ) : (
                                <Send size={16} className="mr-2" />
                              )}
                              Send Reply
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyText("");
                              }}
                              className="border-gray-600"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              onClick={() => setReplyingTo(ticket.id)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <Reply size={14} className="mr-1" />
                              Reply
                            </Button>

                            {ticket.status !== 'resolved' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  replyMutation.mutate({
                                    ticketId: ticket.id,
                                    reply: ticket.adminReply || "Ticket resolved by admin",
                                    status: 'resolved'
                                  });
                                }}
                                className="border-green-500/30 text-green-400 hover:bg-green-900/20"
                              >
                                <CheckCircle size={14} className="mr-1" />
                                Mark Resolved
                              </Button>
                            )}
                          </div>
                          
                          <div className="text-xs text-gray-500">
                            User ID: {ticket.userId} | Created: {new Date(ticket.createdAt).toLocaleString()}
                          </div>
                        </div>
                      )}

                      {/* Status Messages */}
                      {ticket.status === 'open' && (
                        <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Clock size={16} className="text-yellow-400" />
                            <span className="text-sm text-yellow-300">
                              New ticket awaiting admin response
                            </span>
                          </div>
                        </div>
                      )}

                      {ticket.status === 'replied' && (
                        <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <MessageCircle size={16} className="text-blue-400" />
                            <span className="text-sm text-blue-300">
                              Admin has replied, waiting for user response
                            </span>
                          </div>
                        </div>
                      )}

                      {ticket.status === 'resolved' && (
                        <div className="mt-4 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <CheckCircle size={16} className="text-green-400" />
                            <span className="text-sm text-green-300">
                              Ticket resolved successfully
                            </span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}