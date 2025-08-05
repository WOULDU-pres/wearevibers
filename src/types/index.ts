// Re-export all types from different modules for easy importing
export * from "./components";
export * from "./domain";
export * from "./api";

// Re-export commonly used types from external libraries
export type { Database, Profile } from "@/lib/supabase-types";

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Common union types
export type Status = "idle" | "loading" | "success" | "error";
export type Theme = "light" | "dark" | "system";
export type Language = "ko" | "en";

// Event handler types
export type EventHandler<T = Event> = (event: T) => void;
export type AsyncEventHandler<T = Event> = (event: T) => Promise<void>;

// Generic callback types
export type Callback<T = void> = () => T;
export type AsyncCallback<T = void> = () => Promise<T>;
export type CallbackWithParam<P, T = void> = (param: P) => T;
export type AsyncCallbackWithParam<P, T = void> = (param: P) => Promise<T>;