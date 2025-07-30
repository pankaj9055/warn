import { useState } from "react";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Check } from "lucide-react";

export default function AdminLogoSettings() {
  const { toast } = useToast();
  const [currentLogo, setCurrentLogo] = useState(localStorage.getItem('customLogo'));

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive"
        });
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive"
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        localStorage.setItem('customLogo', imageData);
        setCurrentLogo(imageData);
        toast({
          title: "Logo uploaded successfully",
          description: "Your custom logo has been saved"
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    localStorage.removeItem('customLogo');
    setCurrentLogo(null);
    toast({
      title: "Logo removed",
      description: "Default JKSMM logo will be used"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      <Navigation />
      
      <main className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold gradient-text mb-2">Logo Settings</h1>
            <p className="text-gray-400">Upload and manage your custom logo</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Current Logo Preview */}
            <Card className="glass-card border-gray-600">
              <CardHeader>
                <CardTitle className="text-white">Current Logo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-800/50 rounded-lg p-8 text-center min-h-[200px] flex items-center justify-center">
                  {currentLogo ? (
                    <img 
                      src={currentLogo} 
                      alt="Current Logo" 
                      className="max-h-24 max-w-full object-contain"
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <span className="text-white font-bold">J</span>
                      </div>
                      <span className="text-xl font-bold gradient-text">JKSMM</span>
                    </div>
                  )}
                </div>
                
                {currentLogo && (
                  <Button 
                    variant="outline" 
                    onClick={removeLogo}
                    className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Remove Logo
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Upload New Logo */}
            <Card className="glass-card border-gray-600">
              <CardHeader>
                <CardTitle className="text-white">Upload New Logo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-400 mb-2">Click to upload or drag and drop</p>
                  <p className="text-sm text-gray-500">PNG, JPG, GIF up to 5MB</p>
                  
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                  />
                  
                  <Button 
                    className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    onClick={() => document.getElementById('logo-upload')?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Choose File
                  </Button>
                </div>

                <div className="space-y-2 text-sm text-gray-400">
                  <div className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-green-400" />
                    Supports PNG, JPG, GIF, WebP
                  </div>
                  <div className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-green-400" />
                    Maximum file size: 5MB
                  </div>
                  <div className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-green-400" />
                    Automatically resizes for optimal display
                  </div>
                  <div className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-green-400" />
                    Stored locally in browser
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}