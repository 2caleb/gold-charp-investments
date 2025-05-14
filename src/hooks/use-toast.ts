
// Re-export the toast functionality from the UI component's hook file
import { useToast as useToastUI, toast as toastUI } from "@/components/ui/use-toast";

export const useToast = useToastUI;

// Enhanced toast function with default duration of 5000ms
export const toast = (props: Parameters<typeof toastUI>[0]) => {
  return toastUI({
    duration: 5000, // 5 seconds by default
    ...props,
  });
};
