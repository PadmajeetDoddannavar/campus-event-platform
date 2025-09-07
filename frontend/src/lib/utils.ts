import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const API_BASE_URL = 'http://localhost:5000/api';

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatDateShort = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const getEventTypeColor = (type: string) => {
  const colors = {
    hackathon: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    workshop: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    fest: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    seminar: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    conference: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    competition: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
  };
  return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
};
