
// Custom hook for using toast functionality
import {
  useToast as useToastOriginal,
  toast as toastOriginal,
} from "@/components/ui/use-toast"

export const useToast = useToastOriginal;
export const toast = toastOriginal;
