/**
 * Security and sanitization utilities for ResQ AI
 */

/**
 * Escapes special HTML characters in a string to prevent XSS attacks.
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Safely parses basic inline markdown formatting (bold text, line breaks)
 * while escaping all HTML tags to prevent cross-site scripting (XSS).
 */
export function sanitizeAndFormatMarkdown(text: string): string {
  // First escape raw HTML
  const escaped = escapeHtml(text);

  // Convert **bold** to <strong>bold</strong> safely
  const formattedBold = escaped.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Convert newlines to <br/>
  return formattedBold.replace(/\r?\n/g, "<br/>");
}

/**
 * Validates and constructs a safe redirect URL on the current origin.
 */
export function getSafeRedirectUrl(pathWithQuery: string): string {
  if (typeof window === "undefined") {
    return pathWithQuery;
  }

  try {
    const url = new URL(pathWithQuery, window.location.origin);
    // Ensure redirect stays on the same origin
    if (url.origin === window.location.origin) {
      return url.toString();
    }
  } catch {
    // Fall back to origin
  }

  return window.location.origin;
}
