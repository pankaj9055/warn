import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Navigation } from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Save, Edit, AlertTriangle } from "lucide-react";

export default function AdminServiceNotes() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [noteContent, setNoteContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const { data: serviceNote } = useQuery({
    queryKey: ["/api/admin/service-note"],
    enabled: !!user?.isAdmin,
  });

  const updateNoteMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", "/api/admin/service-note", { content });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Service Note Updated",
        description: "The service note has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/service-note"] });
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update service note",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateNoteMutation.mutate(noteContent);
  };

  const startEdit = () => {
    setNoteContent(serviceNote?.content || "");
    setIsEditing(true);
  };

  if (!user?.isAdmin) {
    return <div>Access denied</div>;
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="pt-20">
        <section className="py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  <span className="gradient-text">Service Notes Management</span>
                </h1>
                <p className="text-gray-400">Manage the note shown to users before ordering services</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Edit Section */}
              <Card className="glass-card border-border/20">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Edit className="mr-2 text-purple-400" size={20} />
                    Edit Service Note
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="note-content">Note Content (HTML allowed)</Label>
                    <Textarea
                      id="note-content"
                      value={isEditing ? noteContent : (serviceNote?.content || "")}
                      onChange={(e) => setNoteContent(e.target.value)}
                      placeholder="यहाँ service के बारे में important notes लिखें..."
                      rows={10}
                      className="neon-input bg-dark-card border-gray-600 text-white mt-2"
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="flex space-x-3">
                    {!isEditing ? (
                      <Button onClick={startEdit} className="neo-button">
                        <Edit size={16} className="mr-2" />
                        Edit Note
                      </Button>
                    ) : (
                      <>
                        <Button 
                          onClick={handleSave} 
                          disabled={updateNoteMutation.isPending}
                          className="neo-button"
                        >
                          <Save size={16} className="mr-2" />
                          {updateNoteMutation.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setIsEditing(false)}
                          className="border-gray-500/30"
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Preview Section */}
              <Card className="glass-card border-border/20">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="mr-2 text-yellow-400" size={20} />
                    Preview (User View)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="text-yellow-400 mt-1" size={20} />
                      <div>
                        <h3 className="font-semibold text-yellow-300 mb-2">
                          🔥 1 समय में 1 ही Service Order करें!
                        </h3>
                        <p className="text-sm text-gray-300 leading-relaxed mb-4">
                          एक ही URL पर multiple orders देने से service conflict हो सकती है। 
                          अपना पहला order complete होने का wait करें।
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-gray-800/50 border border-gray-600/30 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">Custom Service Note:</h4>
                    <div className="text-sm text-gray-400">
                      {serviceNote?.content ? (
                        <div dangerouslySetInnerHTML={{ __html: serviceNote.content }} />
                      ) : (
                        <p className="text-gray-500 italic">No custom note set. Default content will be shown.</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Usage Instructions */}
            <Card className="glass-card border-border/20 mt-8">
              <CardHeader>
                <CardTitle>Usage Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-400">
                  <p>• This note will be shown to users before they place any service order</p>
                  <p>• You can use HTML tags for formatting: <code>&lt;b&gt;</code>, <code>&lt;i&gt;</code>, <code>&lt;br&gt;</code>, etc.</p>
                  <p>• Keep the content helpful and informative about service delivery</p>
                  <p>• The main warning about "1 service at a time" is always shown</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}