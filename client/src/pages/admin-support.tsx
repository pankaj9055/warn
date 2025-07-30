import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Edit, 
  Trash2,
  MessageSquare,
  Phone,
  Instagram,
  Globe,
  ArrowUpDown,
  ToggleLeft,
  ToggleRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Reply,
  User
} from "lucide-react";

const supportContactSchema = z.object({
  type: z.string().min(1, "Contact type is required"),
  label: z.string().min(1, "Label is required"),
  value: z.string().min(1, "Contact value is required"),
  isActive: z.boolean(),
  displayOrder: z.number().min(0),
});

const replySchema = z.object({
  adminReply: z.string().min(5, "Reply must be at least 5 characters"),
});

export default function AdminSupport() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingContact, setEditingContact] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'contacts' | 'tickets'>('tickets');
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);

  const { data: supportContacts = [], isLoading } = useQuery({
    queryKey: ["/api/admin/support-contacts"],
    enabled: !!user?.isAdmin,
  });

  const { data: supportTickets = [], isLoading: ticketsLoading } = useQuery({
    queryKey: ["/api/admin/support-tickets"],
    enabled: !!user?.isAdmin,
  });

  const form = useForm({
    resolver: zodResolver(supportContactSchema),
    defaultValues: {
      type: "",
      label: "",
      value: "",
      isActive: true,
      displayOrder: 0,
    },
  });

  const replyForm = useForm({
    resolver: zodResolver(replySchema),
    defaultValues: {
      adminReply: "",
    },
  });

  const createContactMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/admin/support-contacts", data),
    onSuccess: () => {
      toast({ title: "Support contact created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/support-contacts"] });
      form.reset();
      setDialogOpen(false);
    },
  });

  const updateContactMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiRequest("PUT", `/api/admin/support-contacts/${id}`, data),
    onSuccess: () => {
      toast({ title: "Support contact updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/support-contacts"] });
      setEditingContact(null);
      setDialogOpen(false);
    },
  });

  const deleteContactMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/admin/support-contacts/${id}`),
    onSuccess: () => {
      toast({ title: "Support contact deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/support-contacts"] });
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

  const onSubmit = (data: any) => {
    if (editingContact) {
      updateContactMutation.mutate({ id: editingContact.id, data });
    } else {
      createContactMutation.mutate(data);
    }
  };

  const startEdit = (contact: any) => {
    setEditingContact(contact);
    form.reset({
      type: contact.type,
      label: contact.label,
      value: contact.value,
      isActive: contact.isActive,
      displayOrder: contact.displayOrder,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingContact(null);
    form.reset({
      type: "",
      label: "",
      value: "",
      isActive: true,
      displayOrder: 0,
    });
  };

  const getContactIcon = (type: string) => {
    switch (type) {
      case "whatsapp": return <MessageSquare className="text-green-400" size={20} />;
      case "instagram": return <Instagram className="text-pink-400" size={20} />;
      case "phone": return <Phone className="text-blue-400" size={20} />;
      case "telegram": return <Globe className="text-sky-400" size={20} />;
      default: return <MessageSquare className="text-gray-400" size={20} />;
    }
  };

  if (!user?.isAdmin) return null;

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="pt-20">
        <section className="py-8 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  <span className="gradient-text">Support Management</span>
                </h1>
                <p className="text-gray-400">Manage customer support contact options</p>
              </div>

              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="neo-button" onClick={resetForm}>
                    <Plus size={16} className="mr-2" />
                    Add Support Contact
                  </Button>
                </DialogTrigger>
                
                <DialogContent className="glass-modal max-w-md">
                  <DialogHeader>
                    <DialogTitle className="gradient-text">
                      {editingContact ? "Edit Support Contact" : "Add Support Contact"}
                    </DialogTitle>
                  </DialogHeader>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="glass-card border-gray-600">
                                  <SelectValue placeholder="Select contact type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="glass-card border-gray-600">
                                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                                <SelectItem value="instagram">Instagram</SelectItem>
                                <SelectItem value="phone">Phone</SelectItem>
                                <SelectItem value="telegram">Telegram</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="label"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Display Label</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="e.g., WhatsApp Support"
                                className="glass-card border-gray-600"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="value"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Value</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="e.g., +919876543210 or @username"
                                className="glass-card border-gray-600"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="displayOrder"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Display Order</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                min="0"
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                className="glass-card border-gray-600"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="isActive"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <FormLabel>Active</FormLabel>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <div className="flex space-x-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setDialogOpen(false)}
                          className="flex-1 border-gray-600"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="flex-1 neo-button"
                          disabled={createContactMutation.isPending || updateContactMutation.isPending}
                        >
                          {editingContact ? "Update" : "Create"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Support Contacts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {supportContacts.map((contact: any) => (
                <Card key={contact.id} className="glass-card border-border/20">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-3">
                        {getContactIcon(contact.type)}
                        <div>
                          <CardTitle className="text-lg">{contact.label}</CardTitle>
                          <p className="text-sm text-gray-400 capitalize">{contact.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={contact.isActive ? "default" : "secondary"}>
                          {contact.isActive ? "Active" : "Inactive"}
                        </Badge>
                        {contact.isActive ? (
                          <ToggleRight className="text-green-400" size={16} />
                        ) : (
                          <ToggleLeft className="text-gray-400" size={16} />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      <div className="bg-dark-card rounded-lg p-3">
                        <p className="text-sm text-gray-300 font-mono">{contact.value}</p>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-1">
                          <ArrowUpDown size={14} className="text-blue-400" />
                          <span className="text-blue-400">Order: {contact.displayOrder}</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 pt-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => startEdit(contact)}
                          className="flex-1 border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                        >
                          <Edit size={14} className="mr-1" />
                          Edit
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete ${contact.label}?`)) {
                              deleteContactMutation.mutate(contact.id);
                            }
                          }}
                          disabled={deleteContactMutation.isPending}
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {supportContacts.length === 0 && !isLoading && (
              <Card className="glass-card border-border/20">
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <MessageSquare className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Support Contacts</h3>
                    <p className="text-gray-400 mb-4">
                      Start by adding your first support contact option
                    </p>
                    <Button className="neo-button" onClick={() => setDialogOpen(true)}>
                      <Plus size={16} className="mr-2" />
                      Add First Contact
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}