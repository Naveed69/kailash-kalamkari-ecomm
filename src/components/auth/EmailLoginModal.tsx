import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EmailLogin } from './EmailLogin';

interface EmailLoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EmailLoginModal: React.FC<EmailLoginModalProps> = ({
  open,
  onOpenChange,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sign In</DialogTitle>
          <DialogDescription>
            Enter your email to receive a magic link for secure sign in
          </DialogDescription>
        </DialogHeader>
        <EmailLogin 
          onSuccess={() => {
            // Close modal after successful email sent
            setTimeout(() => onOpenChange(false), 2000);
          }}
        />
      </DialogContent>
    </Dialog>
  );
};
