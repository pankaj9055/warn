import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Edit, 
  Ban, 
  Plus, 
  Wallet,
  Mail,
  Phone,
  Calendar,
  Key,
  RotateCcw
} from "lucide-react";

export default function AdminUsers() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [resetPasswordDialog, setResetPasswordDialog] = useState<{ userId: number; username: string } | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["/api/admin/users", page, searchTerm],
    enabled: !!user?.isAdmin,
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(searchTerm && { search: searchTerm })
      });
      const response = await fetch(`/api/admin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      return response.json();
    }
  });

  const form = useForm({
    defaultValues: {
      walletBalance: "",
      isAdmin: false,
      isVerified: true,
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: any }) =>
      apiRequest("PUT", `/api/admin/users/${userId}`, data),
    onSuccess: () => {
      toast({ title: "User updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ userId, newPassword }: { userId: number; newPassword: string }) =>
      apiRequest("POST", "/api/admin/reset-user-password", { userId, newPassword }),
    onSuccess: (data: any) => {
      toast({ 
        title: "✅ Password Reset Successful", 
        description: data.message || "User password has been reset successfully!" 
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setResetPasswordDialog(null);
      setNewPassword("");
    },
    onError: (error: any) => {
      toast({ 
        title: "❌ Password Reset Failed", 
        description: error.message || "Failed to reset user password",
        variant: "destructive" 
      });
    },
  });

  // Handle users as array
  const filteredUsers = Array.isArray(users) ? users : [];

  if (!user?.isAdmin) return null;

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="pt-20">
        <section className="py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold gradient-text">User Management</h1>
                <p className="text-gray-400">Manage all platform users</p>
              </div>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="neo-button">
                    <Plus size={16} className="mr-2" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-card border-border/20">
                  <DialogHeader>
                    <DialogTitle className="gradient-text">Add New User</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input placeholder="Username" className="neon-input bg-dark-card border-gray-600" />
                    <Input placeholder="Email" type="email" className="neon-input bg-dark-card border-gray-600" />
                    <Input placeholder="Password" type="password" className="neon-input bg-dark-card border-gray-600" />
                    <Button className="w-full neo-button">Create User</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Search and Filters */}
            <Card className="glass-card border-border/20 mb-6">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search users by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="neon-input bg-dark-card border-gray-600 pl-10"
                    />
                  </div>
                  <Button variant="outline" className="glass-card border-gray-600">
                    Export CSV
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Users Table */}
            <Card className="glass-card border-border/20">
              <CardHeader>
                <CardTitle className="gradient-text">All Users ({filteredUsers.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="text-center py-8">Loading users...</div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">No users found</div>
                  ) : (
                    filteredUsers.map((adminUser: any) => (
                      <div key={adminUser.id} className="bg-dark-card rounded-2xl p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Avatar className="w-12 h-12">
                              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                                {adminUser.username.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div>
                              <div className="flex items-center space-x-2">
                                <h3 className="font-semibold">{adminUser.username}</h3>
                                {adminUser.isAdmin && (
                                  <Badge className="bg-purple-500 text-white">Admin</Badge>
                                )}
                                <Badge variant={adminUser.isVerified ? "default" : "secondary"}>
                                  {adminUser.isVerified ? "Verified" : "Pending"}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                                <div className="flex items-center space-x-1">
                                  <Mail size={12} />
                                  <span>{adminUser.email}</span>
                                </div>
                                {adminUser.phone && (
                                  <div className="flex items-center space-x-1">
                                    <Phone size={12} />
                                    <span>{adminUser.phone}</span>
                                  </div>
                                )}
                                <div className="flex items-center space-x-1">
                                  <Calendar size={12} />
                                  <span>{new Date(adminUser.createdAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                              
                              {/* User Credentials Display */}
                              <div className="mt-2 p-2 bg-gray-800/50 rounded-lg">
                                <div className="text-xs text-gray-500 mb-1">Login Credentials:</div>
                                <div className="flex items-center space-x-4 text-xs">
                                  <div className="flex items-center space-x-1">
                                    <span className="text-gray-400">Username:</span>
                                    <span className="text-yellow-400 font-mono">{adminUser.username}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <span className="text-gray-400">Email:</span>
                                    <span className="text-yellow-400 font-mono">{adminUser.email}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <span className="text-gray-400">Password:</span>
                                    <span className="text-red-400 font-mono">{adminUser.plainTextPassword || '●●●●●●●●'}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <span className="text-gray-400">ID:</span>
                                    <span className="text-orange-400 font-mono">#{adminUser.id}</span>
                                  </div>
                                </div>
                                <div className="mt-2 flex gap-2">
                                  <Button 
                                    size="sm" 
                                    className="bg-green-600 hover:bg-green-700 text-white text-xs"
                                    onClick={async () => {
                                      try {
                                        const response: any = await apiRequest("POST", "/api/auth/admin-login", {
                                          userId: adminUser.id
                                        });
                                        
                                        // Open new tab with auto-login
                                        const newWindow = window.open('/dashboard', '_blank');
                                        if (newWindow && response.token) {
                                          // Store token in new window's localStorage
                                          setTimeout(() => {
                                            newWindow.localStorage.setItem('token', response.token);
                                            newWindow.location.reload();
                                          }, 1000);
                                        }
                                      } catch (error) {
                                        toast({ 
                                          title: "Failed to login as user", 
                                          variant: "destructive" 
                                        });
                                      }
                                    }}
                                  >
                                    Login as User
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    className="bg-red-600 hover:bg-red-700 text-white text-xs"
                                    onClick={() => setResetPasswordDialog({ userId: adminUser.id, username: adminUser.username })}
                                  >
                                    <Key size={12} className="mr-1" />
                                    Reset Password
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <div className="flex items-center space-x-1 text-green-400">
                                <Wallet size={14} />
                                <span className="font-semibold">₹{adminUser.walletBalance}</span>
                              </div>
                              <div className="text-xs text-gray-400">
                                Referrals: {adminUser.totalReferralEarnings || 0}
                              </div>
                            </div>
                            
                            <div className="flex space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="outline" className="border-blue-500/30 text-blue-400">
                                    <Edit size={14} />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="glass-card border-border/20">
                                  <DialogHeader>
                                    <DialogTitle className="gradient-text">Edit User: {adminUser.username}</DialogTitle>
                                  </DialogHeader>
                                  <Form {...form}>
                                    <div className="space-y-4">
                                      <FormField
                                        name="walletBalance"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Wallet Balance</FormLabel>
                                            <FormControl>
                                              <Input 
                                                {...field} 
                                                placeholder={`Current: ₹${adminUser.walletBalance}`}
                                                className="neon-input bg-dark-card border-gray-600"
                                              />
                                            </FormControl>
                                          </FormItem>
                                        )}
                                      />
                                      <div className="flex space-x-2">
                                        <Button 
                                          className="flex-1 neo-button"
                                          onClick={() => updateUserMutation.mutate({
                                            userId: adminUser.id,
                                            data: { walletBalance: form.getValues("walletBalance") }
                                          })}
                                        >
                                          Update Balance
                                        </Button>
                                        <Button 
                                          variant="outline" 
                                          className="flex-1 border-purple-500/30 text-purple-400"
                                          onClick={() => updateUserMutation.mutate({
                                            userId: adminUser.id,
                                            data: { isAdmin: !adminUser.isAdmin }
                                          })}
                                        >
                                          {adminUser.isAdmin ? "Remove Admin" : "Make Admin"}
                                        </Button>
                                      </div>
                                    </div>
                                  </Form>
                                </DialogContent>
                              </Dialog>
                              
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-red-500/30 text-red-400"
                              >
                                <Ban size={14} />
                              </Button>
                            </div>
                          </div>
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

      {/* Password Reset Dialog */}
      {resetPasswordDialog && (
        <Dialog open={!!resetPasswordDialog} onOpenChange={() => setResetPasswordDialog(null)}>
          <DialogContent className="glass-card border-border/20">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 gradient-text">
                <RotateCcw className="h-5 w-5" />
                Reset Password for {resetPasswordDialog.username}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-300">New Password</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white mt-1"
                  placeholder="Enter new password (minimum 6 characters)"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setResetPasswordDialog(null);
                    setNewPassword("");
                  }}
                  className="border-gray-600 text-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (!newPassword || newPassword.length < 6) {
                      toast({
                        title: "⚠️ Invalid Password",
                        description: "Password must be at least 6 characters long",
                        variant: "destructive",
                      });
                      return;
                    }
                    resetPasswordMutation.mutate({
                      userId: resetPasswordDialog.userId,
                      newPassword: newPassword
                    });
                  }}
                  disabled={resetPasswordMutation.isPending}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}