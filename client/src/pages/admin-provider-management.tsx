import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  RefreshCw, 
  Database, 
  CheckCircle, 
  AlertCircle,
  Settings,
  Activity
} from "lucide-react";

interface Provider {
  id: number;
  name: string;
  apiUrl: string;
  balance: string;
  isActive: boolean;
}

export default function AdminProviderManagement() {
  const [syncing, setSyncing] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: providers = [], isLoading } = useQuery<Provider[]>({
    queryKey: ["/api/admin/providers"],
  });

  const { data: services = [] } = useQuery({
    queryKey: ["/api/admin/services"],
  });

  const syncProviderMutation = useMutation({
    mutationFn: async (providerId: number) => {
      setSyncing(true);
      return await apiRequest({
        url: `/api/admin/providers/${providerId}/sync`,
        method: "POST",
      });
    },
    onSuccess: (data) => {
      setSyncing(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/services"] });
      toast({
        title: "Sync Successful",
        description: `${data.synced} services synced from provider`,
      });
    },
    onError: (error: any) => {
      setSyncing(false);
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync provider services",
        variant: "destructive",
      });
    },
  });

  const testProviderMutation = useMutation({
    mutationFn: async (providerId: number) => {
      return await apiRequest({
        url: `/api/admin/providers/${providerId}/test`,
        method: "POST",
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Connection Test Successful",
        description: `Provider connected. Balance: $${data.balance}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Connection Test Failed",
        description: error.message || "Failed to connect to provider",
        variant: "destructive",
      });
    },
  });

  const mysmmProvider = providers.find(p => p.name === 'MySMM');
  const mysmmServices = services.filter((s: any) => s.providerId === mysmmProvider?.id);
  const activeServices = mysmmServices.filter((s: any) => s.isActive);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-purple-500/20 rounded-lg animate-pulse"></div>
        <div className="h-32 bg-purple-500/20 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Provider Management
        </h1>
        <p className="text-muted-foreground">
          Manage MySMM provider integration and service synchronization
        </p>
      </div>

      {/* Provider Status Card */}
      {mysmmProvider && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              MySMM Provider Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">
                  {mysmmServices.length}
                </div>
                <div className="text-sm text-muted-foreground">Total Services</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">
                  {activeServices.length}
                </div>
                <div className="text-sm text-muted-foreground">Active Services</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-500">
                  ${mysmmProvider.balance}
                </div>
                <div className="text-sm text-muted-foreground">Provider Balance</div>
              </div>
              <div className="text-center">
                <Badge 
                  variant={mysmmProvider.isActive ? "default" : "destructive"}
                  className="text-sm"
                >
                  {mysmmProvider.isActive ? "Active" : "Inactive"}
                </Badge>
                <div className="text-sm text-muted-foreground mt-1">Status</div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => testProviderMutation.mutate(mysmmProvider.id)}
                disabled={testProviderMutation.isPending}
                variant="outline"
                size="sm"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Test Connection
              </Button>
              
              <Button
                onClick={() => syncProviderMutation.mutate(mysmmProvider.id)}
                disabled={syncing || syncProviderMutation.isPending}
                variant="default"
                size="sm"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Syncing...' : 'Sync Services'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Service Categories Overview */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Service Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Calculate category stats */}
            {Object.entries(
              mysmmServices.reduce((acc: any, service: any) => {
                const categoryName = service.categoryName || 'Unknown';
                if (!acc[categoryName]) {
                  acc[categoryName] = { total: 0, active: 0 };
                }
                acc[categoryName].total++;
                if (service.isActive) acc[categoryName].active++;
                return acc;
              }, {})
            ).map(([categoryName, stats]: [string, any]) => (
              <div key={categoryName} className="p-4 bg-purple-500/10 rounded-lg">
                <h3 className="font-semibold text-sm mb-2">{categoryName}</h3>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total: {stats.total}</span>
                  <span className="text-green-500">Active: {stats.active}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${(stats.active / stats.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            How It Works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
            <div>
              <strong>MySMM Integration:</strong> All services are synced from MySMM API automatically
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
            <div>
              <strong>Admin Control:</strong> Use Service Visibility page to enable/disable services for users
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
            <div>
              <strong>Auto Orders:</strong> When users place orders, they automatically go to MySMM provider
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
            <div>
              <strong>Price Control:</strong> Edit service prices in Service Visibility to set your markup
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}