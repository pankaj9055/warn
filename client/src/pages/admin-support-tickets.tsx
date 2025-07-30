import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { 
  Clock,
  CheckCircle,
  AlertCircle,
  Reply,
  User,
  MessageSquare,
  Calendar
} from "lucide-react";

const replySchema = z.object({
  adminReply: z.string().min(5, "Reply must be at least 5 characters"),
});

export default function AdminSupportTickets() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);

  const { data: supportTickets = [], isLoading: ticketsLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/support-tickets"],
    enabled: !!user?.isAdmin,
  });

  const replyForm = useForm({
    resolver: zodResolver(replySchema),
    defaultValues: {
      adminReply: "",
    },
  });

  const replyToTicketMutation = useMutation({
    mutationFn: ({ id, reply }: { id: number; reply: string }) =>
      apiRequest("PUT", `/api/admin/support-tickets/${id}`, { 
        adminReply: reply, 
        status: "replied" 
      }),
    onSuccess: () => {
      toast({ title: "Reply sent successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/support-tickets"] });
      setReplyDialogOpen(false);
      setSelectedTicket(null);
      replyForm.reset();
    },
  });

  const handleReply = (ticket: any) => {
    setSelectedTicket(ticket);
    replyForm.reset({ adminReply: "" });
    setReplyDialogOpen(true);
  };

  const onSubmitReply = (data: any) => {
    if (selectedTicket) {
      replyToTicketMutation.mutate({
        id: selectedTicket.id,
        reply: data.adminReply,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-orange-500/10 text-orange-400">
          <Clock size={12} className="mr-1" />
          Pending
        </Badge>;
      case "replied":
        return <Badge variant="default" className="bg-green-500/10 text-green-400">
          <CheckCircle size={12} className="mr-1" />
          Replied
        </Badge>;
      case "closed":
        return <Badge variant="outline" className="border-gray-600 text-gray-400">
          <CheckCircle size={12} className="mr-1" />
          Closed
        </Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive" className="bg-red-500/10 text-red-400">
          <AlertCircle size={12} className="mr-1" />
          High
        </Badge>;
      case "medium":
        return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-400">
          Medium
        </Badge>;
      case "low":
        return <Badge variant="outline" className="border-blue-500/30 text-blue-400">
          Low
        </Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  if (!user?.isAdmin) return null;

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="pt-20">
        <section className="py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold gradient-text">Support Tickets</h1>
                <p className="text-gray-400">Manage customer support requests</p>
              </div>
              
              <div className="text-sm text-gray-400">
                Total: {supportTickets.length} tickets
              </div>
            </div>

            {/* Tickets Grid */}
            <div className="grid gap-6">
              {ticketsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
                  <p className="text-gray-400 mt-2">Loading tickets...</p>
                </div>
              ) : supportTickets.length === 0 ? (
                <Card className="glass-card border-border/20">
                  <CardContent className="pt-6">
                    <div className="text-center py-12">
                      <MessageSquare className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Support Tickets</h3>
                      <p className="text-gray-400">All support tickets will appear here</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                supportTickets.map((ticket: any) => (
                  <Card key={ticket.id} className="glass-card border-border/20">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <User className="text-white" size={16} />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{ticket.subject}</CardTitle>
                            <p className="text-sm text-gray-400">
                              From: {ticket.username} ({ticket.email})
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {getPriorityBadge(ticket.priority)}
                          {getStatusBadge(ticket.status)}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="text-gray-300 mb-3">{ticket.message}</p>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Calendar size={14} />
                            <span>Created: {format(new Date(ticket.createdAt), "MMM dd, yyyy 'at' hh:mm a")}</span>
                          </div>
                          {ticket.updatedAt && ticket.status === 'replied' && (
                            <div className="flex items-center space-x-1">
                              <Reply size={14} />
                              <span>Replied: {format(new Date(ticket.updatedAt), "MMM dd, yyyy 'at' hh:mm a")}</span>
                            </div>
                          )}
                        </div>

                        {ticket.adminReply && (
                          <div className="mt-4 p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                                <Reply className="text-green-400" size={12} />
                              </div>
                              <span className="text-sm font-medium text-green-400">Admin Reply</span>
                            </div>
                            <p className="text-gray-300 text-sm">{ticket.adminReply}</p>
                          </div>
                        )}
                        
                        <div className="flex space-x-2 pt-2">
                          {ticket.status === "pending" && (
                            <Button 
                              size="sm" 
                              onClick={() => handleReply(ticket)}
                              className="neo-button"
                            >
                              <Reply size={14} className="mr-1" />
                              Reply
                            </Button>
                          )}
                          {ticket.status === "replied" && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleReply(ticket)}
                              className="border-blue-500/30 text-blue-400"
                            >
                              <Reply size={14} className="mr-1" />
                              Update Reply
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Reply Dialog */}
            <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
              <DialogContent className="glass-card border-border/20 max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="gradient-text">
                    Reply to Support Ticket
                  </DialogTitle>
                  {selectedTicket && (
                    <p className="text-gray-400">
                      Replying to: {selectedTicket.subject}
                    </p>
                  )}
                </DialogHeader>
                <Form {...replyForm}>
                  <form onSubmit={replyForm.handleSubmit(onSubmitReply)} className="space-y-4">
                    <FormField
                      control={replyForm.control}
                      name="adminReply"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Reply</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Type your reply to the customer..."
                              className="neon-input bg-dark-card border-gray-600 min-h-[120px]"
                              rows={6}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex space-x-2 pt-4">
                      <Button 
                        type="submit" 
                        className="flex-1 neo-button"
                        disabled={replyToTicketMutation.isPending}
                      >
                        {replyToTicketMutation.isPending ? "Sending..." : "Send Reply"}
                      </Button>
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={() => setReplyDialogOpen(false)}
                        className="border-gray-600"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </section>
      </main>
    </div>
  );
}