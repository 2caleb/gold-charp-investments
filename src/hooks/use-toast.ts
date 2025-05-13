
// Forward exports from the components/ui directory
import { toast, type ToastProps } from "@/components/ui/toast"

export type {
  ToastProps,
  ToastActionElement,
} from "@/components/ui/toast"

export const useToast = () => {
  return {
    toast,
    dismiss: toast.dismiss,
  }
}

export { toast }
