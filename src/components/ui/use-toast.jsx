// Wrapper to make existing toast API work with Sonner
import { toast as sonnerToast } from 'sonner';

function toast({ title, description, variant, ...props }) {
  const message = title || description || 'Notification';
  const fullMessage = title && description ? `${title}: ${description}` : message;

  if (variant === 'destructive') {
    return sonnerToast.error(fullMessage, props);
  } else {
    return sonnerToast.success(fullMessage, props);
  }
}

function useToast() {
  return {
    toast,
    dismiss: sonnerToast.dismiss,
  };
}

export { useToast, toast };
