import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
// merges multiple class values into a single string
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
