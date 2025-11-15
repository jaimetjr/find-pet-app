"use client"

import { createContext, useContext, useState, useCallback, ReactNode, JSX } from "react";

export type ToastType = "success" | "warning" | "failure";

export type Toast = {
  id: string;
  message: string;
  type: ToastType;
  duration?: number; // Duration in milliseconds, default 3000
};

type ToastContextType = {
  toast: Toast | null;
  showToast: (message: string, type: ToastType, duration?: number) => void;
  hideToast: () => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

type ToastProviderProps = {
  children: ReactNode;
};

export const ToastProvider = ({ children }: ToastProviderProps): JSX.Element => {
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = useCallback((message: string, type: ToastType, duration = 3000) => {
    const id = Math.random().toString(36).substring(7);
    setToast({ id, message, type, duration });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  return (
    <ToastContext.Provider value={{ toast, showToast, hideToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

