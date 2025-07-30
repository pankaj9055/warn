import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
  Settings,
  DollarSign,
  Hash,
  ToggleLeft,
  ToggleRight,
  Search,
  CheckCircle,
  XCircle
} from "lucide-react";

const serviceSchema = z.object({
  categoryId: z.string().min(1, "Please select a category"),
  name: z.string().min(1, "Service name is required"),
  description: z.string().optional(),
  pricePerThousand: z.string().min(1, "Price is required"),
  minQuantity: z.number().min(1, "Minimum quantity is required"),
  maxQuantity: z.number().min(1, "Maximum quantity is required"),
  isActive: z.boolean(),
});

export default function AdminServices() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [editingService, setEditingService] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"active" | "inactive">("active");

  const { data: categories = [] } = useQuery<any[]>({
    queryKey: ["/api/services/categories"],
    enabled: !!user?.isAdmin,
  });

  const { data: services = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/services", selectedCategory],
    queryFn: async () => {
      const url = selectedCategory 
        ? `/api/admin/services?categoryId=${selectedCategory}` 
        : "/api/admin/services";
      const token = localStorage.getItem('token');
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch services');
      return response.json();
    },
    enabled: !!user?.isAdmin,
  });

  const form = useForm({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      categoryId: "",
      name: "",
      description: "",
      pricePerThousand: "",
      minQuantity: 100,
      maxQuantity: 100000,
      isActive: true,
    },
  });

  const createServiceMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/admin/services", data),
    onSuccess: () => {
      toast({ title: "Service created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/services"] });
      form.reset();
      setDialogOpen(false);
      setEditingService(null);
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiRequest("PUT", `/api/admin/services/${id}`, data),
    onSuccess: () => {
      toast({ title: "Service updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/services"] });
      setEditingService(null);
      setDialogOpen(false);
      form.reset();
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/admin/services/${id}`),
    onSuccess: () => {
      toast({ title: "Service deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/services"] });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      apiRequest("PUT", `/api/admin/categories/${id}`, { name }),
    onSuccess: () => {
      toast({ title: "Category updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/services/categories"] });
      setCategoryDialogOpen(false);
      setEditingCategory(null);
      setNewCategoryName("");
    },
  });

  const onSubmit = (data: any) => {
    const serviceData = {
      ...data,
      categoryId: Number(data.categoryId),
      pricePerThousand: parseFloat(data.pricePerThousand),
    };

    if (editingService) {
      updateServiceMutation.mutate({ id: editingService.id, data: serviceData });
    } else {
      createServiceMutation.mutate(serviceData);
    }
  };

  const startEdit = (service: any) => {
    setEditingService(service);
    form.reset({
      categoryId: service.categoryId.toString(),
      name: service.name,
      description: service.description || "",
      pricePerThousand: service.pricePerThousand.toString(),
      minQuantity: service.minQuantity,
      maxQuantity: service.maxQuantity,
      isActive: service.isActive,
    });
    setDialogOpen(true);
  };

  const startEditCategory = (category: any) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setCategoryDialogOpen(true);
  };

  const handleUpdateCategory = () => {
    if (!newCategoryName.trim()) {
      toast({ title: "Category name cannot be empty", variant: "destructive" });
      return;
    }
    updateCategoryMutation.mutate({ id: editingCategory.id, name: newCategoryName.trim() });
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
                <h1 className="text-3xl font-bold gradient-text">Imported Services Management</h1>
                <p className="text-gray-400">Manage provider-imported services and pricing</p>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  className="neo-button"
                  onClick={() => window.location.href = '/admin-providers'}
                >
                  <Settings size={16} className="mr-2" />
                  Setup Provider
                </Button>
                <Button 
                  className="neo-button"
                  onClick={() => window.location.href = '/admin-manual-import'}
                >
                  <Plus size={16} className="mr-2" />
                  Import Services
                </Button>
              </div>
              
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <div style={{display: 'none'}}></div>
                </DialogTrigger>
                <DialogContent className="glass-card border-border/20 max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="gradient-text">
                      {editingService ? "Edit Service" : "Add New Service"}
                    </DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="categoryId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <Select value={field.value} onValueChange={field.onChange}>
                                <FormControl>
                                  <SelectTrigger className="neon-input bg-dark-card border-gray-600">
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="glass-card border-border/20">
                                  {categories.map((category: any) => (
                                    <SelectItem key={category.id} value={category.id.toString()}>
                                      {category.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Service Name</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="Instagram Followers"
                                  className="neon-input bg-dark-card border-gray-600"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                placeholder="High quality followers from real accounts"
                                className="neon-input bg-dark-card border-gray-600"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="pricePerThousand"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Price per 1K (₹)</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="number"
                                  step="0.01"
                                  placeholder="0.15"
                                  className="neon-input bg-dark-card border-gray-600"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="minQuantity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Min Quantity</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="number"
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                  className="neon-input bg-dark-card border-gray-600"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="maxQuantity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Max Quantity</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="number"
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                  className="neon-input bg-dark-card border-gray-600"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="isActive"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Switch 
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel>Service Active</FormLabel>
                          </FormItem>
                        )}
                      />

                      <div className="flex space-x-2 pt-4">
                        <Button 
                          type="submit" 
                          className="flex-1 neo-button"
                          disabled={createServiceMutation.isPending || updateServiceMutation.isPending}
                        >
                          {editingService ? "Update Service" : "Create Service"}
                        </Button>
                        {editingService && (
                          <Button 
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setEditingService(null);
                              form.reset();
                            }}
                            className="border-gray-600"
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>

              {/* Category Edit Dialog */}
              <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
                <DialogContent className="glass-card border-border/20 max-w-md">
                  <DialogHeader>
                    <DialogTitle className="gradient-text">Edit Category Name</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-2 block">
                        Category Name
                      </label>
                      <Input
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Enter category name"
                        className="neon-input bg-dark-card border-gray-600"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        onClick={handleUpdateCategory}
                        className="flex-1 neo-button"
                        disabled={updateCategoryMutation.isPending}
                      >
                        Update Category
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setCategoryDialogOpen(false);
                          setEditingCategory(null);
                          setNewCategoryName("");
                        }}
                        className="border-gray-600"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Search Bar */}
            <Card className="glass-card border-border/20 mb-6">
              <CardContent className="pt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <Input
                    placeholder="Search services by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 neon-input bg-dark-card border-gray-600"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Active/Inactive Tabs */}
            <Card className="glass-card border-border/20 mb-6">
              <CardContent className="pt-6">
                <div className="flex gap-2 mb-4">
                  <Button
                    variant={activeTab === "active" ? "default" : "outline"}
                    onClick={() => setActiveTab("active")}
                    className={activeTab === "active" ? "neo-button" : "glass-card border-gray-600"}
                  >
                    <CheckCircle size={16} className="mr-2 text-green-400" />
                    Active Services
                  </Button>
                  <Button
                    variant={activeTab === "inactive" ? "default" : "outline"}
                    onClick={() => setActiveTab("inactive")}
                    className={activeTab === "inactive" ? "neo-button" : "glass-card border-gray-600"}
                  >
                    <XCircle size={16} className="mr-2 text-red-400" />
                    Inactive Services
                  </Button>
                </div>
                
                {/* Category Filter */}
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={selectedCategory === "" ? "default" : "outline"}
                    onClick={() => setSelectedCategory("")}
                    className={selectedCategory === "" ? "neo-button" : "glass-card border-gray-600"}
                  >
                    All Categories
                  </Button>
                  {categories.map((category: any) => (
                    <div key={category.id} className="flex items-center gap-1">
                      <Button
                        variant={selectedCategory === category.id.toString() ? "default" : "outline"}
                        onClick={() => setSelectedCategory(category.id.toString())}
                        className={selectedCategory === category.id.toString() ? "neo-button" : "glass-card border-gray-600"}
                      >
                        <i className={`${category.icon} mr-2`}></i>
                        {category.name}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEditCategory(category)}
                        className="glass-card border-gray-600 px-2"
                        title="Edit category name"
                      >
                        <Edit size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services
                .filter((service: any) => {
                  // Filter by active/inactive tab
                  const matchesTab = activeTab === "active" ? service.isActive : !service.isActive;
                  
                  // Filter by search query
                  const matchesSearch = searchQuery === "" || 
                    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    service.description?.toLowerCase().includes(searchQuery.toLowerCase());
                  
                  return matchesTab && matchesSearch;
                })
                .map((service: any) => (
                <Card key={service.id} className="glass-card border-border/20">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge variant={service.isActive ? "default" : "secondary"}>
                          {service.isActive ? "Active" : "Inactive"}
                        </Badge>
                        {service.isActive ? (
                          <ToggleRight className="text-green-400" size={16} />
                        ) : (
                          <ToggleLeft className="text-gray-400" size={16} />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-sm text-gray-400">{service.description}</p>
                      
                      <div className="grid grid-cols-1 gap-3 text-sm">
                        <div className="flex items-center justify-between p-2 bg-green-900/20 border border-green-500/30 rounded">
                          <div className="flex items-center space-x-1">
                            <DollarSign size={14} className="text-green-400" />
                            <span className="text-green-400 font-semibold">₹{service.pricePerThousand}/1K</span>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => startEdit(service)}
                            className="text-xs border-green-500/30 text-green-400 hover:bg-green-500/10"
                          >
                            Edit Price
                          </Button>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Hash size={14} className="text-blue-400" />
                          <span className="text-blue-400">{service.minQuantity} - {service.maxQuantity.toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 pt-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => startEdit(service)}
                          className="flex-1 border-blue-500/30 text-blue-400"
                        >
                          <Edit size={14} className="mr-1" />
                          Edit
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete ${service.name}?`)) {
                              deleteServiceMutation.mutate(service.id);
                            }
                          }}
                          disabled={deleteServiceMutation.isPending}
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

            {services
              .filter((service: any) => {
                const matchesTab = activeTab === "active" ? service.isActive : !service.isActive;
                const matchesSearch = searchQuery === "" || 
                  service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  service.description?.toLowerCase().includes(searchQuery.toLowerCase());
                return matchesTab && matchesSearch;
              }).length === 0 && (
              <Card className="glass-card border-border/20">
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <Settings className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      {services.length === 0 ? "No Services Imported" : `No ${activeTab} services found`}
                    </h3>
                    <p className="text-gray-400 mb-6">
                      {services.length === 0 ? (
                        selectedCategory ? "No services imported in this category" : "Import services from your provider to start reselling"
                      ) : (
                        searchQuery ? 
                          `No ${activeTab} services found matching "${searchQuery}"` : 
                          `No ${activeTab} services available`
                      )}
                    </p>
                    {services.length === 0 && (
                      <div className="flex gap-3 justify-center">
                        <Button 
                          className="neo-button"
                          onClick={() => window.location.href = '/admin-providers'}
                        >
                          <Settings size={16} className="mr-2" />
                          Setup Provider
                        </Button>
                        <Button 
                          className="neo-button"
                          onClick={() => window.location.href = '/admin-manual-import'}
                        >
                          <Plus size={16} className="mr-2" />
                          Import Services
                        </Button>
                      </div>
                    )}
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