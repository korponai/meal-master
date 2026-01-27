export type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

const toasts = ref<Toast[]>([]);
let toastId = 0;

export const useToast = () => {
  const showToast = (
    message: string,
    type: ToastType = "info",
    duration = 5000,
  ) => {
    const id = toastId++;
    toasts.value.push({ id, message, type });

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  };

  const removeToast = (id: number) => {
    const index = toasts.value.findIndex((toast) => toast.id === id);
    if (index !== -1) {
      toasts.value.splice(index, 1);
    }
  };

  return {
    toasts: readonly(toasts),
    showToast,
    removeToast,
  };
};
