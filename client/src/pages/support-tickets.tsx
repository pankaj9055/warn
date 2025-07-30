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
  Plus,
  Send,
  Calendar,
  Ticket,
  AlertTriangle,
  MessageCircle,
  User,
  ArrowRight
} from "lucide-react";

export default function SupportTickets() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    priority: "medium"
  });

  const { data: tickets = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/support-tickets"],
    enabled: !!user,
  });

  const createTicketMutation = useMutation({
    mutationFn: (ticketData: any) => apiRequest("/api/support-tickets", {
      method: 'POST',
      body: ticketData
    }),
    onSuccess: (newTicket) => {
      toast({
        title: "Success",
        description: `Support ticket ${newTicket.ticketId} created successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/support-tickets"] });
      setShowCreateForm(false);
      setFormData({ subject: "", message: "", priority: "medium" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create support ticket",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.message.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createTicketMutation.mutate(formData);
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

  if (!user) {
    return <div>Please login to access support tickets</div>;
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="pt-20">
        {/* Header Section */}
        <section className="py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  <span className="gradient-text">Support Tickets</span>
                </h1>
                <p className="text-gray-400">Create and manage your support requests</p>
              </div>
              <Button 
                onClick={() => setShowCreateForm(true)} 
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus size={16} className="mr-2" />
                New Ticket
              </Button>
            </div>

            {/* Stats */}
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
                      <p className="text-2xl font-bold text-yellow-400">
                        {tickets.filter((t: any) => t.status === 'open').length}
                      </p>
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
                      <p className="text-2xl font-bold text-blue-400">
                        {tickets.filter((t: any) => t.status === 'replied').length}
                      </p>
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
                      <p className="text-2xl font-bold text-green-400">
                        {tickets.filter((t: any) => t.status === 'resolved').length}
                      </p>
                    </div>
                    <CheckCircle className="text-green-400" size={24} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Create Ticket Form */}
            {showCreateForm && (
              <Card className="glass-card border-border/20 mb-8">
                <CardHeader>
                  <CardTitle className="gradient-text">Create New Support Ticket</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Subject *
                      </label>
                      <Input
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="Brief description of your issue..."
                        className="bg-gray-800/50 border-gray-600"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Priority
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white"
                      >
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Message *
                      </label>
                      <Textarea
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Describe your issue in detail..."
                        rows={6}
                        className="bg-gray-800/50 border-gray-600"
                        required
                      />
                    </div>

                    <div className="flex items-center space-x-3">
                      <Button
                        type="submit"
                        disabled={createTicketMutation.isPending}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        {createTicketMutation.isPending ? (
                          <LoadingSpinner size="sm" className="mr-2" />
                        ) : (
                          <Send size={16} className="mr-2" />
                        )}
                        Create Ticket
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowCreateForm(false)}
                        className="border-gray-600"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Tickets List */}
            {isLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-12">
                <HelpCircle className="mx-auto text-gray-500 mb-3" size={48} />
                <p className="text-gray-400 mb-2">No support tickets yet</p>
                <p className="text-sm text-gray-500">Create your first support ticket to get help</p>
                <Button 
                  onClick={() => setShowCreateForm(true)} 
                  className="mt-4 bg-purple-600 hover:bg-purple-700"
                >
                  <Plus size={16} className="mr-2" />
                  Create First Ticket
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket: any) => (
                  <Card key={ticket.id} className="glass-card border-border/20">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-bold text-white">
                              {ticket.subject}
                            </h3>
                            <Badge className={getStatusColor(ticket.status)}>
                              <span className="flex items-center space-x-1">
                                {getStatusIcon(ticket.status)}
                                <span className="capitalize">{ticket.status}</span>
                              </span>
                            </Badge>
                            
                            {ticket.priority && (
                              <Badge className={getPriorityColor(ticket.priority)}>
                                <span className="capitalize">{ticket.priority} Priority</span>
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-400 mb-3">
                            <div className="flex items-center space-x-1">
                              <Ticket size={14} />
                              <span className="font-mono">{ticket.ticketId}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar size={14} />
                              <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Ticket Message */}
                      <div className="mb-4 p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
                        <p className="text-sm text-gray-300 whitespace-pre-wrap">
                          {ticket.message}
                        </p>
                      </div>

                      {/* Admin Reply */}
                      {ticket.adminReply && (
                        <div className="mb-4 p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
                          <div className="flex items-center space-x-2 mb-2">
                            <User size={16} className="text-blue-400" />
                            <span className="text-sm font-semibold text-blue-300">Admin Reply:</span>
                          </div>
                          <p className="text-sm text-blue-200 whitespace-pre-wrap">
                            {ticket.adminReply}
                          </p>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                        <div className="text-xs text-gray-500">
                          Created: {new Date(ticket.createdAt).toLocaleString()}
                          {ticket.updatedAt && ticket.updatedAt !== ticket.createdAt && (
                            <span> • Updated: {new Date(ticket.updatedAt).toLocaleString()}</span>
                          )}
                        </div>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.location.href = `/support-tickets/${ticket.ticketId}`}
                          className="border-purple-500/30 text-purple-400 hover:bg-purple-900/20"
                        >
                          View Details
                          <ArrowRight size={12} className="ml-1" />
                        </Button>
                      </div>

                      {/* Status Messages */}
                      {ticket.status === 'open' && (
                        <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Clock size={16} className="text-yellow-400" />
                            <span className="text-sm text-yellow-300">
                              Your ticket is open and awaiting admin response. We'll reply within 24 hours.
                            </span>
                          </div>
                        </div>
                      )}

                      {ticket.status === 'replied' && (
                        <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <MessageCircle size={16} className="text-blue-400" />
                            <span className="text-sm text-blue-300">
                              Admin has replied to your ticket. Please check the response above.
                            </span>
                          </div>
                        </div>
                      )}

                      {ticket.status === 'resolved' && (
                        <div className="mt-4 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <CheckCircle size={16} className="text-green-400" />
                            <span className="text-sm text-green-300">
                              This ticket has been resolved. If you need further assistance, please create a new ticket.
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