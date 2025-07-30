import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  MessageCircle, 
  Send, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Headphones,
  Plus
} from "lucide-react";

const supportTicketSchema = z.object({
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  priority: z.enum(["low", "medium", "high"]),
});

type SupportTicketForm = z.infer<typeof supportTicketSchema>;

export default function Support() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

  const form = useForm<SupportTicketForm>({
    resolver: zodResolver(supportTicketSchema),
    defaultValues: {
      subject: "",
      message: "",
      priority: "medium",
    },
  });

  const { data: tickets = [], isLoading: ticketsLoading, refetch } = useQuery({
    queryKey: ["/api/support/tickets"],
    enabled: !!user,
  });

  const createTicketMutation = useMutation({
    mutationFn: async (data: SupportTicketForm) => {
      const response = await apiRequest("POST", "/api/support/tickets", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Support Ticket Created",
        description: "Your ticket has been submitted. We'll respond within 24 hours.",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/support"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Create Ticket",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SupportTicketForm) => {
    createTicketMutation.mutate(data);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-400";
      case "medium": return "text-yellow-400";
      case "low": return "text-green-400";
      default: return "text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open": return <Clock className="text-yellow-400" size={16} />;
      case "in-progress": return <AlertCircle className="text-blue-400" size={16} />;
      case "resolved": return <CheckCircle className="text-green-400" size={16} />;
      default: return <MessageCircle className="text-gray-400" size={16} />;
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="pt-20">
        <section className="py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2">
                <span className="gradient-text">Support Center</span>
              </h1>
              <p className="text-gray-400">Get help with your orders and account</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Create New Ticket */}
              <div className="lg:col-span-2">
                <Card className="glass-card border-border/20 mb-6">
                  <CardHeader>
                    <CardTitle className="gradient-text flex items-center">
                      <Plus className="mr-2" size={20} />
                      Create Support Ticket
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                          control={form.control}
                          name="subject"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-300">Subject</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Describe your issue briefly"
                                  className="neon-input bg-dark-card border-gray-600 text-white"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="priority"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-300">Priority</FormLabel>
                              <FormControl>
                                <select
                                  {...field}
                                  className="w-full p-3 bg-dark-card border border-gray-600 rounded-xl text-white"
                                >
                                  <option value="low">Low - General inquiry</option>
                                  <option value="medium">Medium - Order issue</option>
                                  <option value="high">High - Payment/Account problem</option>
                                </select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-300">Message</FormLabel>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  placeholder="Describe your issue in detail..."
                                  rows={6}
                                  className="neon-input bg-dark-card border-gray-600 text-white resize-none"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button
                          type="submit"
                          disabled={createTicketMutation.isPending}
                          className="neo-button w-full"
                        >
                          {createTicketMutation.isPending ? (
                            "Submitting..."
                          ) : (
                            <>
                              <Send className="mr-2" size={16} />
                              Submit Ticket
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>

                {/* FAQ Section */}
                <Card className="glass-card border-border/20">
                  <CardHeader>
                    <CardTitle className="gradient-text">Frequently Asked Questions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-dark-card rounded-xl">
                        <h3 className="font-semibold text-white mb-2">How long do orders take to complete?</h3>
                        <p className="text-gray-400 text-sm">Most orders start within 1-6 hours and complete within 24-72 hours depending on the service.</p>
                      </div>
                      <div className="p-4 bg-dark-card rounded-xl">
                        <h3 className="font-semibold text-white mb-2">What payment methods do you accept?</h3>
                        <p className="text-gray-400 text-sm">We accept all major credit/debit cards through our secure Stripe payment system.</p>
                      </div>
                      <div className="p-4 bg-dark-card rounded-xl">
                        <h3 className="font-semibold text-white mb-2">How does the referral program work?</h3>
                        <p className="text-gray-400 text-sm">Share your referral link and earn ₹5 for each user who signs up and deposits ₹50 or more.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Support Tickets List */}
              <div>
                <Card className="glass-card border-border/20">
                  <CardHeader>
                    <CardTitle className="gradient-text flex items-center">
                      <Headphones className="mr-2" size={20} />
                      Your Tickets
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {ticketsLoading ? (
                        <div className="text-center py-4">Loading tickets...</div>
                      ) : (tickets as any[]).length === 0 ? (
                        <div className="text-center py-8">
                          <MessageCircle className="mx-auto text-gray-500 mb-3" size={48} />
                          <p className="text-gray-400">No support tickets yet</p>
                        </div>
                      ) : (
                        (tickets as any[]).map((ticket: any) => (
                          <div key={ticket.id} className="p-4 bg-dark-card rounded-xl">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(ticket.status)}
                                <span className="text-sm font-medium">#{ticket.id}</span>
                              </div>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getPriorityColor(ticket.priority)}`}
                              >
                                {ticket.priority}
                              </Badge>
                            </div>
                            <h3 className="font-medium text-white mb-2">{ticket.subject}</h3>
                            
                            {/* User Message */}
                            <div className="bg-gray-800 p-3 rounded-lg mb-3">
                              <div className="text-xs text-gray-400 mb-1">Your Message:</div>
                              <p className="text-sm text-gray-200">{ticket.message}</p>
                            </div>
                            
                            {/* Admin Reply */}
                            {ticket.adminReply && (
                              <div className="bg-blue-900/20 border border-blue-500/20 p-3 rounded-lg mb-3">
                                <div className="text-xs text-blue-300 mb-1">Admin Reply:</div>
                                <p className="text-sm text-blue-200">{ticket.adminReply}</p>
                              </div>
                            )}
                            
                            <p className="text-xs text-gray-400">
                              Created {new Date(ticket.createdAt).toLocaleDateString()}
                              {ticket.status === 'replied' && (
                                <span className="text-green-400 ml-2">• Replied</span>
                              )}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Help */}
                <Card className="glass-card border-border/20 mt-6">
                  <CardHeader>
                    <CardTitle className="gradient-text">Quick Help</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-center p-4 bg-dark-card rounded-xl">
                        <div className="text-lg font-bold text-green-400 mb-1">24/7</div>
                        <div className="text-sm text-gray-400">Support Available</div>
                      </div>
                      <div className="text-center p-4 bg-dark-card rounded-xl">
                        <div className="text-lg font-bold text-blue-400 mb-1">&lt;6h</div>
                        <div className="text-sm text-gray-400">Average Response</div>
                      </div>
                      <div className="text-center p-4 bg-dark-card rounded-xl">
                        <div className="text-lg font-bold text-purple-400 mb-1">99%</div>
                        <div className="text-sm text-gray-400">Issue Resolution</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}