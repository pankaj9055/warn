import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, X, Phone, MessageSquare, Globe } from "lucide-react";
import { SiWhatsapp, SiInstagram } from "react-icons/si";

export function FloatingSupport() {
  const [isOpen, setIsOpen] = useState(false);

  const { data: supportContacts = [] } = useQuery({
    queryKey: ["/api/support-contacts"],
  });

  const getContactIcon = (type: string) => {
    switch (type) {
      case "whatsapp": return SiWhatsapp;
      case "instagram": return SiInstagram;
      case "phone": return Phone;
      case "telegram": return Globe;
      default: return MessageSquare;
    }
  };

  const getContactColor = (type: string) => {
    switch (type) {
      case "whatsapp": return "bg-green-500 hover:bg-green-600";
      case "instagram": return "bg-pink-500 hover:bg-pink-600";
      case "phone": return "bg-blue-500 hover:bg-blue-600";
      case "telegram": return "bg-sky-500 hover:bg-sky-600";
      default: return "bg-gray-500 hover:bg-gray-600";
    }
  };

  const getContactHref = (type: string, value: string) => {
    switch (type) {
      case "whatsapp": 
        return value.startsWith("+") 
          ? `https://wa.me/${value.replace("+", "")}?text=Hello%20JKSMM%20Support%2C%20I%20need%20help%20with%20my%20account`
          : `https://wa.me/${value}?text=Hello%20JKSMM%20Support%2C%20I%20need%20help%20with%20my%20account`;
      case "instagram": 
        return value.startsWith("@") 
          ? `https://instagram.com/${value.replace("@", "")}`
          : `https://instagram.com/${value}`;
      case "phone": 
        return `tel:${value}`;
      case "telegram": 
        return value.startsWith("@") 
          ? `https://t.me/${value.replace("@", "")}`
          : value.startsWith("http") ? value : `https://t.me/${value}`;
      default: 
        return "/support";
    }
  };

  // Default fallback options if no admin contacts are set
  const defaultOptions = [
    {
      id: 1,
      type: "whatsapp",
      label: "WhatsApp Support",
      value: "+919876543210",
      isActive: true,
      displayOrder: 1,
    },
    {
      id: 2,
      type: "instagram", 
      label: "Instagram Support",
      value: "@jksmm_support",
      isActive: true,
      displayOrder: 2,
    },
    {
      id: 3,
      type: "phone",
      label: "Support Ticket",
      value: "/support",
      isActive: true,
      displayOrder: 3,
    },
  ];

  const displayContacts = supportContacts.length > 0 ? supportContacts : defaultOptions;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Support Options */}
      {isOpen && (
        <Card className="mb-4 glass-card border-border/20 shadow-2xl">
          <CardContent className="p-4">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white mb-3">Contact Support</h3>
              {displayContacts
                .sort((a: any, b: any) => a.displayOrder - b.displayOrder)
                .map((contact: any) => {
                  const IconComponent = getContactIcon(contact.type);
                  const href = contact.type === "phone" && contact.value === "/support" 
                    ? "/support" 
                    : getContactHref(contact.type, contact.value);
                  
                  return (
                    <a
                      key={contact.id}
                      href={href}
                      target={href.startsWith('http') ? '_blank' : '_self'}
                      rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800/50 transition-colors group"
                    >
                      <div className={`p-2 rounded-full ${getContactColor(contact.type)} transition-colors`}>
                        <IconComponent size={16} className="text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-300 group-hover:text-white">
                        {contact.label}
                      </span>
                    </a>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Support Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-2xl transition-all duration-300 ${
          isOpen 
            ? "bg-red-500 hover:bg-red-600 rotate-180" 
            : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        } glow-on-hover`}
      >
        {isOpen ? (
          <X size={20} className="text-white" />
        ) : (
          <MessageCircle size={20} className="text-white" />
        )}
      </Button>
    </div>
  );
}