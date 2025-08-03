import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format large numbers for display
 * Handles scientific notation and large values properly
 */
export function formatLargeNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "0.00"
  }

  // Handle very large numbers (scientific notation)
  if (value >= 1e9) {
    return (value / 1e9).toFixed(2) + "B"
  } else if (value >= 1e6) {
    return (value / 1e6).toFixed(2) + "M"
  } else if (value >= 1e3) {
    return (value / 1e3).toFixed(2) + "K"
  } else if (value >= 1) {
    return value.toFixed(2)
  } else if (value >= 0.01) {
    return value.toFixed(4)
  } else {
    return value.toFixed(6)
  }
}

/**
 * Format token balance with proper decimal handling
 */
export function formatTokenBalance(value: number | null | undefined, decimals: number = 18): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "0.00"
  }

  // For very large numbers, use scientific notation
  if (value >= 1e12) {
    return value.toExponential(2)
  }

  // For large numbers, use abbreviated format
  if (value >= 1e9) {
    return (value / 1e9).toFixed(2) + "B"
  } else if (value >= 1e6) {
    return (value / 1e6).toFixed(2) + "M"
  } else if (value >= 1e3) {
    return (value / 1e3).toFixed(2) + "K"
  }

  // For smaller numbers, show more precision
  if (value >= 1) {
    return value.toFixed(2)
  } else if (value >= 0.01) {
    return value.toFixed(4)
  } else {
    return value.toFixed(6)
  }
}

/**
 * Format currency with proper locale
 */
export function formatCurrency(value: number | null | undefined, currency: string = "USD"): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "$0.00"
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}
