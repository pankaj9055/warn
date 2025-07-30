import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Settings, DollarSign, Users, Edit, Save, X, Key, Lock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function AdminSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  
  // Password change states
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const { data: settings = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/settings"],
    enabled: !!user?.isAdmin,
  });

  const updateSettingMutation = useMutation({
    mutationFn: ({ key, value, description }: { key: string; value: string; description: string }) =>
      apiRequest("PUT", `/api/admin/settings/${key}`, { value, description }),
    onSuccess: (data, variables) => {
      toast({
        title: "✅ Setting Updated",
        description: `${variables.key} successfully updated to ${variables.value}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      setEditingKey(null);
      setEditValue("");
    },
    onError: (error: any) => {
      toast({
        title: "❌ Update Failed",
        description: error.message || "Failed to update setting",
        variant: "destructive",
      });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      apiRequest("POST", "/api/auth/change-password", { currentPassword, newPassword }),
    onSuccess: (data: any) => {
      toast({
        title: "✅ Password Changed",
        description: data.message || "Password successfully updated!",
      });
      setShowPasswordChange(false);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    },
    onError: (error: any) => {
      toast({
        title: "❌ Password Change Failed",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (key: string, currentValue: string) => {
    setEditingKey(key);
    setEditValue(currentValue);
  };

  const handleSave = (key: string, description: string) => {
    if (!editValue.trim()) {
      toast({
        title: "⚠️ Invalid Value",
        description: "Setting value cannot be empty",
        variant: "destructive",
      });
      return;
    }
    updateSettingMutation.mutate({ key, value: editValue, description });
  };

  const handleCancel = () => {
    setEditingKey(null);
    setEditValue("");
  };

  const handlePasswordChange = () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        title: "⚠️ Missing Fields",
        description: "All password fields are required",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "⚠️ Password Mismatch",
        description: "New password and confirm password must match",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "⚠️ Password Too Short",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });
  };

  const getSettingIcon = (key: string) => {
    if (key.includes('commission')) return <Users className="h-5 w-5 text-green-400" />;
    if (key.includes('deposit')) return <DollarSign className="h-5 w-5 text-blue-400" />;
    return <Settings className="h-5 w-5 text-purple-400" />;
  };

  const getSettingDisplayName = (key: string) => {
    switch (key) {
      case 'signup_commission':
        return 'Signup Commission (₹)';
      case 'minimum_deposit':
        return 'Minimum Deposit (₹)';
      case 'referral_bonus_rate':
        return 'Referral Bonus Rate (%)';
      case 'withdrawal_fee':
        return 'Withdrawal Fee (₹)';
      default:
        return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const getSettingDescription = (key: string) => {
    switch (key) {
      case 'signup_commission':
        return 'Commission given to referrer when someone signs up using their code';
      case 'minimum_deposit':
        return 'Minimum amount users must deposit to fund their wallet';
      case 'referral_bonus_rate':
        return 'Percentage bonus given to referrer based on referee deposit amount';
      case 'withdrawal_fee':
        return 'Fee charged for wallet withdrawals';
      default:
        return `Configuration value for ${key.replace(/_/g, ' ')}`;
    }
  };

  // Initialize default settings if they don't exist
  const defaultSettings = [
    { key: 'signup_commission', value: '10', description: 'Commission given to referrer when someone signs up using their code' },
    { key: 'minimum_deposit', value: '50', description: 'Minimum amount users must deposit to fund their wallet' },
    { key: 'referral_bonus_rate', value: '5', description: 'Percentage bonus given to referrer based on referee deposit amount' },
    { key: 'withdrawal_fee', value: '5', description: 'Fee charged for wallet withdrawals' },
  ];

  const displaySettings = defaultSettings.map(defaultSetting => {
    const existingSetting = settings.find(s => s.settingKey === defaultSetting.key);
    return existingSetting || {
      settingKey: defaultSetting.key,
      settingValue: defaultSetting.value,
      description: defaultSetting.description,
      isDefault: true
    };
  });

  if (!user?.isAdmin) return null;

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="pt-20">
        <div className="max-w-4xl mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold gradient-text flex items-center gap-3">
              <Settings className="h-8 w-8" />
              Admin Settings
            </h1>
            <p className="text-gray-400 mt-2">Configure system-wide settings and parameters</p>
          </div>

          {/* Admin Password Change Card */}
          <Card className="glass-card border-border/20 mb-6">
            <CardHeader>
              <CardTitle className="gradient-text flex items-center gap-2">
                <Key className="h-5 w-5" />
                Admin Password
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!showPasswordChange ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300">Change your admin password</p>
                    <p className="text-sm text-gray-400">Keep your account secure with a strong password</p>
                  </div>
                  <Button
                    onClick={() => setShowPasswordChange(true)}
                    className="neo-button"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword" className="text-gray-300">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="bg-gray-800 border-gray-600 text-white mt-1"
                      placeholder="Enter current password"
                    />
                  </div>
                  <div>
                    <Label htmlFor="newPassword" className="text-gray-300">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="bg-gray-800 border-gray-600 text-white mt-1"
                      placeholder="Enter new password (min 6 characters)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword" className="text-gray-300">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="bg-gray-800 border-gray-600 text-white mt-1"
                      placeholder="Confirm new password"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handlePasswordChange}
                      disabled={changePasswordMutation.isPending}
                      className="neo-button"
                    >
                      {changePasswordMutation.isPending ? "Changing..." : "Update Password"}
                    </Button>
                    <Button
                      onClick={() => {
                        setShowPasswordChange(false);
                        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                      }}
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card border-border/20">
            <CardHeader>
              <CardTitle className="gradient-text flex items-center gap-2">
                <Settings className="h-5 w-5" />
                System Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="lg" />
                </div>
              ) : (
                <div className="space-y-6">
                  {displaySettings.map((setting) => (
                    <div key={setting.settingKey} className="p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getSettingIcon(setting.settingKey)}
                          <div>
                            <h3 className="font-semibold text-white">
                              {getSettingDisplayName(setting.settingKey)}
                            </h3>
                            <p className="text-sm text-gray-400">
                              {setting.description || getSettingDescription(setting.settingKey)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {editingKey === setting.settingKey ? (
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="w-24 bg-gray-700 border-gray-600 text-white"
                                placeholder="Value"
                              />
                              <Button
                                size="sm"
                                onClick={() => handleSave(setting.settingKey, setting.description || getSettingDescription(setting.settingKey))}
                                disabled={updateSettingMutation.isPending}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Save size={14} />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancel}
                                disabled={updateSettingMutation.isPending}
                              >
                                <X size={14} />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <span className="text-lg font-bold text-green-400">
                                {setting.settingKey.includes('rate') ? `${setting.settingValue}%` : `₹${setting.settingValue}`}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(setting.settingKey, setting.settingValue)}
                                className="border-blue-500/30 text-blue-400 hover:bg-blue-900/20"
                              >
                                <Edit size={14} />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {setting.isDefault && (
                        <div className="mt-2 text-xs text-yellow-400 bg-yellow-900/20 p-2 rounded border-l-2 border-yellow-500">
                          <strong>Default Value:</strong> This setting will be created when you save it for the first time.
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-6 p-4 bg-blue-900/20 rounded-lg border border-blue-500/20">
            <h3 className="font-semibold text-blue-300 mb-2">💡 How Settings Work:</h3>
            <ul className="text-sm text-blue-200 space-y-1">
              <li>• <strong>Signup Commission:</strong> Amount given to referrer when someone uses their referral code</li>
              <li>• <strong>Minimum Deposit:</strong> Minimum amount users must deposit to add funds to wallet</li>
              <li>• <strong>Referral Bonus Rate:</strong> Percentage of referee's deposit given as bonus to referrer</li>
              <li>• <strong>Withdrawal Fee:</strong> Fixed fee charged when users withdraw money from wallet</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}