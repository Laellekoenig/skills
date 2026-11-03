import { clsx, type ClassValue } from "clsx"
import { Result, type Result as ResultType } from "better-result"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// The error leaves out the input and the parse error, which quotes it, since
// the input may be user content and errors end up in logs.
export function safeJsonParse(json: string): ResultType<unknown, Error> {
  return Result.try({
    try: () => JSON.parse(json),
    catch: () => new Error("Failed to parse json"),
  })
}

export function safeFetch(...args: Parameters<typeof fetch>) {
  return Result.tryPromise({
    try: () => fetch(...args),
    catch: error => new Error("Failed to fetch", { cause: error }),
  })
}

export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== undefined && value !== null
}
