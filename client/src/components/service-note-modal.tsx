import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, AlertTriangle, Info } from "lucide-react";

interface ServiceNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: () => void;
  serviceName: string;
}

export function ServiceNoteModal({ isOpen, onClose, onProceed, serviceName }: ServiceNoteModalProps) {
  const { data: serviceNote } = useQuery({
    queryKey: ["/api/admin/service-note"],
    enabled: isOpen,
  });

  const handleProceed = () => {
    onProceed();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-border/20 max-w-md mx-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold gradient-text flex items-center">
              <AlertTriangle className="mr-2 text-yellow-400" size={24} />
              ⚠️ Important Notice
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X size={16} />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Main Warning */}
          <div className="p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
            <div className="flex items-start space-x-3">
              <Info className="text-yellow-400 mt-1" size={20} />
              <div>
                <h3 className="font-semibold text-yellow-300 mb-2">
                  🔥 1 समय में 1 ही Service Order करें!
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  एक ही URL पर multiple orders देने से service conflict हो सकती है। 
                  अपना पहला order complete होने का wait करें।
                </p>
              </div>
            </div>
          </div>

          {/* Service Specific Note */}
          <div className="p-4 bg-gray-800/50 border border-gray-600/30 rounded-lg">
            <h4 className="font-semibold text-white mb-2">Service: {serviceName}</h4>
            <div className="text-sm text-gray-400 space-y-2">
              {serviceNote?.content ? (
                <div dangerouslySetInnerHTML={{ __html: serviceNote.content }} />
              ) : (
                <>
                  <p>• Quality service delivery guaranteed</p>
                  <p>• Start time: 0-6 hours</p>
                  <p>• Completion time: 24-48 hours</p>
                  <p>• No refund after service starts</p>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-red-500/30 text-red-400 hover:bg-red-900/20"
            >
              Cancel
            </Button>
            <Button
              onClick={handleProceed}
              className="flex-1 neo-button"
            >
              समझ गया - Continue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}