import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  MessageSquare, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  EyeOff,
  AlertCircle
} from "lucide-react";

const messageSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  isActive: z.boolean().default(true),
});

type MessageForm = z.infer<typeof messageSchema>;

export default function AdminMessages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingMessage, setEditingMessage] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const form = useForm<MessageForm>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      title: "",
      message: "",
      isActive: true,
    },
  });

  const { data: messages = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/admin-messages"],
    enabled: !!user?.isAdmin,
  });

  const createMessageMutation = useMutation({
    mutationFn: (data: MessageForm) => apiRequest("POST", "/api/admin/admin-messages", data),
    onSuccess: () => {
      toast({ title: "Message created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/admin-messages"] });
      setDialogOpen(false);
      form.reset();
    },
  });

  const updateMessageMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: MessageForm }) =>
      apiRequest("PUT", `/api/admin/admin-messages/${id}`, data),
    onSuccess: () => {
      toast({ title: "Message updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/admin-messages"] });
      setEditingMessage(null);
      setDialogOpen(false);
      form.reset();
    },
  });

  const deleteMessageMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/admin/admin-messages/${id}`),
    onSuccess: () => {
      toast({ title: "Message deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/admin-messages"] });
    },
  });

  const toggleMessageStatus = async (id: number, isActive: boolean) => {
    try {
      await apiRequest("PUT", `/api/admin/admin-messages/${id}`, { isActive });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/admin-messages"] });
      toast({ title: isActive ? "Message activated" : "Message deactivated" });
    } catch (error) {
      toast({ title: "Failed to update message status", variant: "destructive" });
    }
  };

  const handleEdit = (message: any) => {
    setEditingMessage(message);
    form.reset({
      title: message.title,
      message: message.message,
      isActive: message.isActive,
    });
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingMessage(null);
    form.reset();
    setDialogOpen(true);
  };

  const onSubmit = (data: MessageForm) => {
    if (editingMessage) {
      updateMessageMutation.mutate({ id: editingMessage.id, data });
    } else {
      createMessageMutation.mutate(data);
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
                <h1 className="text-3xl font-bold gradient-text">Admin Messages</h1>
                <p className="text-gray-400">Manage messages shown to users</p>
              </div>
              
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={handleCreate} className="neo-button">
                    <Plus size={16} className="mr-2" />
                    Create Message
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-card border-border/20">
                  <DialogHeader>
                    <DialogTitle className="gradient-text">
                      {editingMessage ? "Edit Message" : "Create New Message"}
                    </DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input {...field} className="neon-input bg-dark-card border-gray-600" />
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
                            <FormLabel>Message</FormLabel>
                            <FormControl>
                              <Textarea {...field} rows={4} className="neon-input bg-dark-card border-gray-600" />
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
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <Button
                        type="submit"
                        disabled={createMessageMutation.isPending || updateMessageMutation.isPending}
                        className="w-full neo-button"
                      >
                        {editingMessage ? "Update Message" : "Create Message"}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Messages List */}
            <Card className="glass-card border-border/20">
              <CardHeader>
                <CardTitle className="gradient-text">All Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="text-center py-8">Loading messages...</div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="mx-auto text-gray-500 mb-3" size={48} />
                      <p className="text-gray-400">No messages yet</p>
                    </div>
                  ) : (
                    messages.map((message: any) => (
                      <div key={message.id} className="p-4 bg-dark-card rounded-xl">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <AlertCircle className="text-orange-400" size={20} />
                            <div>
                              <h3 className="font-semibold text-white">{message.title}</h3>
                              <Badge variant={message.isActive ? "default" : "secondary"} className="mt-1">
                                {message.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleMessageStatus(message.id, !message.isActive)}
                              className="text-gray-400 hover:text-white"
                            >
                              {message.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(message)}
                              className="text-blue-400 hover:text-blue-300"
                            >
                              <Edit size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteMessageMutation.mutate(message.id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </div>
                        
                        <p className="text-gray-300 mb-3">{message.message}</p>
                        
                        <div className="text-xs text-gray-400">
                          Created: {new Date(message.createdAt).toLocaleDateString()}
                          {message.updatedAt && message.updatedAt !== message.createdAt && (
                            <span className="ml-4">
                              Updated: {new Date(message.updatedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}