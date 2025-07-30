import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Key, Lock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export function UserPasswordChange() {
  const { toast } = useToast();
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
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
        description: "New password और confirm password same होना चाहिए",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "⚠️ Password Too Short",
        description: "Password कम से कम 6 characters का होना चाहिए",
        variant: "destructive",
      });
      return;
    }

    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });
  };

  return (
    <Card className="glass-card border-border/20">
      <CardHeader>
        <CardTitle className="gradient-text flex items-center gap-2">
          <Key className="h-5 w-5" />
          Change Password
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!showPasswordChange ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300">Update your account password</p>
              <p className="text-sm text-gray-400">Keep your account secure अपना password change करें</p>
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
                placeholder="Current password डालें"
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
                placeholder="New password डालें (minimum 6 characters)"
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
                placeholder="New password confirm करें"
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
  );
}