import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  MessageSquare,
  Phone,
  Instagram,
  MessageCircle
} from "lucide-react";

export default function AdminSupportContacts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingContact, setEditingContact] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: "whatsapp",
    label: "",
    value: "",
    isActive: true,
    displayOrder: 1
  });

  const { data: supportContacts = [], isLoading } = useQuery({
    queryKey: ["/api/support-contacts"],
    enabled: !!user?.isAdmin,
  });

  const createContactMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/admin/support-contacts", data),
    onSuccess: () => {
      toast({ title: "Support contact added successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/support-contacts"] });
      resetForm();
      setDialogOpen(false);
    },
  });

  const updateContactMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiRequest("PUT", `/api/admin/support-contacts/${id}`, data),
    onSuccess: () => {
      toast({ title: "Support contact updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/support-contacts"] });
      setEditingContact(null);
      setDialogOpen(false);
      resetForm();
    },
  });

  const deleteContactMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/admin/support-contacts/${id}`),
    onSuccess: () => {
      toast({ title: "Support contact deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/support-contacts"] });
    },
  });

  const resetForm = () => {
    setFormData({
      type: "whatsapp",
      label: "",
      value: "",
      isActive: true,
      displayOrder: 1
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingContact) {
      updateContactMutation.mutate({ id: editingContact.id, data: formData });
    } else {
      createContactMutation.mutate(formData);
    }
  };

  const startEdit = (contact: any) => {
    setEditingContact(contact);
    setFormData({
      type: contact.type,
      label: contact.label,
      value: contact.value,
      isActive: contact.isActive,
      displayOrder: contact.displayOrder || 1
    });
    setDialogOpen(true);
  };

  const getContactIcon = (type: string) => {
    switch (type) {
      case 'whatsapp':
        return <MessageCircle className="text-green-400" size={24} />;
      case 'instagram':
        return <Instagram className="text-pink-400" size={24} />;
      case 'phone':
        return <Phone className="text-blue-400" size={24} />;
      case 'telegram':
        return <MessageSquare className="text-cyan-400" size={24} />;
      default:
        return <MessageSquare className="text-gray-400" size={24} />;
    }
  };

  if (!user?.isAdmin) return null;

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="pt-20">
        <section className="py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold gradient-text">Support Contacts</h1>
                <p className="text-gray-400">Manage customer support contact methods</p>
              </div>
              
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="neo-button"
                    onClick={() => {
                      setEditingContact(null);
                      resetForm();
                      setDialogOpen(true);
                    }}
                  >
                    <Plus size={16} className="mr-2" />
                    Add Contact
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-card border-border/20 max-w-md">
                  <DialogHeader>
                    <DialogTitle className="gradient-text">
                      {editingContact ? "Edit Support Contact" : "Add New Support Contact"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-2 block">
                        Contact Type
                      </label>
                      <Select 
                        value={formData.type} 
                        onValueChange={(value) => setFormData({ ...formData, type: value })}
                      >
                        <SelectTrigger className="neon-input bg-dark-card border-gray-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass-card border-border/20">
                          <SelectItem value="whatsapp">WhatsApp</SelectItem>
                          <SelectItem value="instagram">Instagram</SelectItem>
                          <SelectItem value="phone">Phone</SelectItem>
                          <SelectItem value="telegram">Telegram</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-2 block">
                        Display Label
                      </label>
                      <Input
                        value={formData.label}
                        onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                        placeholder="e.g., WhatsApp Support"
                        className="neon-input bg-dark-card border-gray-600"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-2 block">
                        Contact Value
                      </label>
                      <Input
                        value={formData.value}
                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                        placeholder={
                          formData.type === 'whatsapp' ? '+919876543210' :
                          formData.type === 'instagram' ? '@username' :
                          formData.type === 'phone' ? '+919876543210' :
                          '@username'
                        }
                        className="neon-input bg-dark-card border-gray-600"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-2 block">
                        Display Order
                      </label>
                      <Input
                        type="number"
                        value={formData.displayOrder}
                        onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })}
                        min="1"
                        className="neon-input bg-dark-card border-gray-600"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={formData.isActive}
                        onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                      />
                      <label className="text-sm font-medium text-gray-300">
                        Active Contact
                      </label>
                    </div>

                    <div className="flex space-x-2 pt-4">
                      <Button 
                        type="submit" 
                        className="flex-1 neo-button"
                        disabled={createContactMutation.isPending || updateContactMutation.isPending}
                      >
                        {editingContact ? "Update Contact" : "Add Contact"}
                      </Button>
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={() => setDialogOpen(false)}
                        className="border-gray-600"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Contacts Grid */}
            <div className="grid gap-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
                  <p className="text-gray-400 mt-2">Loading contacts...</p>
                </div>
              ) : supportContacts.length === 0 ? (
                <Card className="glass-card border-border/20">
                  <CardContent className="pt-6">
                    <div className="text-center py-12">
                      <MessageSquare className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Support Contacts</h3>
                      <p className="text-gray-400">Add your first support contact to get started</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                supportContacts.map((contact: any) => (
                  <Card key={contact.id} className="glass-card border-border/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/30">
                            {getContactIcon(contact.type)}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">{contact.label}</h3>
                            <p className="text-sm text-gray-400 capitalize">{contact.type} Contact</p>
                            <p className="text-sm text-gray-300 font-mono">{contact.value}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                            contact.isActive 
                              ? 'bg-green-500/10 text-green-400 border border-green-500/30' 
                              : 'bg-red-500/10 text-red-400 border border-red-500/30'
                          }`}>
                            {contact.isActive ? 'Active' : 'Inactive'}
                          </div>
                          
                          <div className="text-xs text-gray-400">
                            Order: {contact.displayOrder || 1}
                          </div>
                          
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => startEdit(contact)}
                            className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                          >
                            <Edit size={14} />
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
                ))
              )}
            </div>

            {/* Info Card */}
            <Card className="glass-card border-border/20 mt-8">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <MessageSquare className="mr-2" size={20} />
                  Contact Configuration Guide
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-400">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                    <div>
                      <strong className="text-gray-300">WhatsApp:</strong> Use full phone number with country code (e.g., +919876543210)
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 rounded-full bg-pink-500 mt-2"></div>
                    <div>
                      <strong className="text-gray-300">Instagram:</strong> Use username with @ symbol (e.g., @supportteam)
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                    <div>
                      <strong className="text-gray-300">Phone:</strong> Use full phone number with country code
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-500 mt-2"></div>
                    <div>
                      <strong className="text-gray-300">Telegram:</strong> Use username with @ symbol (e.g., @supportbot)
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}