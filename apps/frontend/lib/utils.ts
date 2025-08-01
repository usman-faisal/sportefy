import { clsx, type ClassValue } from "clsx"
import { toZonedTime } from "date-fns-tz";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  const inputDate = new Date(date);
  const time = toZonedTime(inputDate, "Asia/Karachi");
  return time.toDateString();
}

export function formatTime(date: string | Date) {
  const inputDate = new Date(date);
  const time = toZonedTime(inputDate, "Asia/Karachi");
  return time.toLocaleTimeString("en-PK", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
