import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { MessageCircle, X, Send } from "lucide-react";

interface WhatsAppPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

export const WhatsAppPopup = ({
  isOpen,
  onClose,
  onOpen,
}: WhatsAppPopupProps) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState(
    "Hi! I am interested in your Kalamkari products. Please share more details."
  );

  const handleSendMessage = () => {
    const whatsappNumber = "+919951821516";
    const encodedMessage = encodeURIComponent(
      `Name: ${name}\nPhone: ${phone}\n\nMessage: ${message}`
    );
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, "_blank");
    onClose();

    // Reset form
    setName("");
    setPhone("");
    setMessage(
      "Hi! I am interested in your Kalamkari products. Please share more details."
    );
  };

  return (
    <>
      {/* Floating WhatsApp Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Dialog open={isOpen} onOpenChange={isOpen ? onClose : onOpen}>
          <DialogTrigger asChild>
            <Button
              size="lg"
              className="rounded-full h-14 w-14 bg-green-500 hover:bg-green-600 shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={onOpen}
            >
              <MessageCircle className="h-6 w-6 text-white" />
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <Card className="border-0 shadow-none">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <MessageCircle className="h-5 w-5" />
                    Chat with us on WhatsApp
                  </CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">
                  Send us a message and we'll respond as soon as possible!
                </p>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your phone number"
                    type="tel"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message here..."
                    rows={4}
                    required
                  />
                </div>

                <Button
                  onClick={handleSendMessage}
                  disabled={!name || !message}
                  className="w-full bg-green-500 hover:bg-green-600"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send WhatsApp Message
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  By clicking send, you'll be redirected to WhatsApp
                </p>
              </CardContent>
            </Card>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick WhatsApp Info */}
      {!isOpen && (
        <div className="fixed bottom-24 right-6 z-40">
          <div className="bg-green-500 text-white px-3 py-2 rounded-lg shadow-lg text-sm animate-pulse">
            💬 Need help? Chat with us!
          </div>
        </div>
      )}
    </>
  );
};
