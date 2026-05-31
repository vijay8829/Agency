type ToastType = "info" | "success" | "error" | "warning";

export interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

type Listener = (toasts: ToastItem[]) => void;

let _toasts: ToastItem[] = [];
let _listeners: Listener[] = [];
let _nextId = 1;

function _notify() {
  _listeners.forEach(l => l([..._toasts]));
}

export function showToast(message: string, type: ToastType = "info", duration = 3200) {
  const id = _nextId++;
  _toasts = [..._toasts, { id, message, type }];
  _notify();
  setTimeout(() => {
    _toasts = _toasts.filter(t => t.id !== id);
    _notify();
  }, duration);
}

export function subscribeToasts(fn: Listener): () => void {
  _listeners = [..._listeners, fn];
  fn([..._toasts]);
  return () => {
    _listeners = _listeners.filter(l => l !== fn);
  };
}
