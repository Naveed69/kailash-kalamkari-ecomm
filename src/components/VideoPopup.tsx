import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoPopupProps {
    isOpen: boolean;
    onClose: () => void;
    videoUrl?: string; // Optional prop for video URL
}

export const VideoPopup = ({ isOpen, onClose, videoUrl }: VideoPopupProps) => {
    // Default video if none provided - using a placeholder or the user can replace this
    const src = videoUrl || "https://www.w3schools.com/html/mov_bbb.mp4";

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[800px] p-0 bg-black border-none overflow-hidden">
                <DialogHeader className="absolute top-2 right-2 z-50">
                    <DialogTitle className="sr-only">Promotional Video</DialogTitle>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="h-8 w-8 rounded-full bg-black/50 hover:bg-black/70 text-white"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </DialogHeader>
                <div className="relative w-full aspect-video">
                    <video
                        className="w-full h-full object-cover"
                        controls
                        autoPlay
                        muted // Muted is often required for autoplay
                        playsInline
                    >
                        <source src={src} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                </div>
            </DialogContent>
        </Dialog>
    );
};
