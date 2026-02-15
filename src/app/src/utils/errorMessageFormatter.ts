/**
 * Detects if a message contains technical/stack-trace content
 * @param message - Message to check
 * @returns True if message appears to be technical
 */
export const isTechnicalMessage = (message: string): boolean => {
  if (message.length > 300) return true;
  const technicalPatterns = [
    /Exception:/i,
    /at\s+\w+\.\w+\.\w+\(/,       // stack trace pattern: "at Namespace.Class.Method("
    /^\s+at\s+/m,                   // indented "at" lines typical of stack traces
    /StackExchange\./i,
    /Microsoft\./i,
    /System\.\w+Exception/i,
    /\.cs:line\s+\d+/,              // C# file references
    /\.java:\d+/,                   // Java file references
    /Traceback \(most recent/i,     // Python tracebacks
  ];
  return technicalPatterns.some(p => p.test(message));
};

/** ASP.NET metadata keys to skip when extracting validation errors */
const aspNetMetadataKeys = new Set(['$id', '$ref', '$type', '$values']);

/**
 * Extracts human-readable validation error messages from an API errors object,
 * skipping ASP.NET metadata keys like $id, $ref, etc.
 * @param errors - The errors object from the API response
 * @returns Array of human-readable error message strings
 */
const extractValidationErrors = (errors: Record<string, unknown>): string[] => {
  const messages: string[] = [];
  for (const [key, value] of Object.entries(errors)) {
    if (aspNetMetadataKeys.has(key)) continue;
    if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === 'string') messages.push(item);
      }
    } else if (typeof value === 'string') {
      messages.push(value);
    }
  }
  return messages;
};

/**
 * Formats an array of validation messages into a single display string.
 * Caps at 3 messages to avoid overflowing the toast.
 * @param messages - Array of validation error strings
 * @returns Formatted string for display
 */
const formatValidationMessages = (messages: string[]): string => {
  if (messages.length === 1) return messages[0];
  const shown = messages.slice(0, 3);
  const remaining = messages.length - shown.length;
  const joined = shown.join('. ');
  return remaining > 0 ? `${joined} (+${remaining} more)` : joined;
};

/**
 * Formats error messages from API responses into human-readable text
 * @param error - Error object from API call or mutation
 * @returns Human-readable error message
 */
export const formatErrorMessage = (error: any): string => {
  if (error?.response?.status === 500) {
    const apiMessage = error.response?.data?.message
      || error.response?.data?.Message
      || error.response?.data?.error
      || error.response?.data?.Error;
    if (apiMessage && typeof apiMessage === 'string' && !isTechnicalMessage(apiMessage)) {
      const clean = apiMessage.trim();
      const capitalized = clean.charAt(0).toUpperCase() + clean.slice(1);
      return capitalized.endsWith('.') ? capitalized : `${capitalized}.`;
    }
    return 'Service temporarily unavailable. Please try again later';
  }

  // Handle plain string errors (from validation)
  if (typeof error === 'string') {
    return error;
  }

  // Handle errors without a response (network errors, plain Error objects from mutation fns)
  if (!error.response && error.message && typeof error.message === 'string') {
    const messageLower = error.message.toLowerCase();
    if (messageLower.includes('network')) {
      return 'Unable to connect. Please check your internet connection';
    }
    if (messageLower.includes('timeout')) {
      return 'Request timed out. Please try again';
    }
    if (messageLower.includes('pin')) {
      return error.message;
    }
    // Return non-technical messages directly (e.g., thrown by mutation fns)
    if (!isTechnicalMessage(error.message)) {
      const cleanMessage = error.message.trim();
      const capitalized = cleanMessage.charAt(0).toUpperCase() + cleanMessage.slice(1);
      return capitalized.endsWith('.') ? capitalized : `${capitalized}.`;
    }
  }

  // Handle API response errors
  if (error.response?.data) {
    const { data } = error.response;

    // Check for field-level validation errors first (e.g. 400 responses with errors object)
    if (data.errors && typeof data.errors === 'object') {
      const fieldErrors = extractValidationErrors(data.errors);
      if (fieldErrors.length > 0) {
        return formatValidationMessages(fieldErrors);
      }
    }

    // Extract error message from various possible structures
    const apiMessage = data.message || data.error || data.Message || data.Error;

    if (apiMessage) {
      // Transform common API error messages to be more user-friendly
      const message = String(apiMessage).toLowerCase();

      // console.log('API message: ', apiMessage)

      if (message.includes('insufficient') && message.includes('balance')) {
        return 'Insufficient account balance';
      }

      if (message.includes('invalid') && message.includes('pin')) {
        return 'Incorrect PIN entered';
      }

      if (message.includes('pin') && (message.includes('locked') || message.includes('blocked'))) {
        return 'Your PIN has been locked due to multiple failed attempts. Please contact support';
      }

      if (message.includes('not found') || message.includes('does not exist')) {
        return 'Account not found. Please verify the details';
      }

      if (message.includes('limit') && message.includes('exceeded')) {
        return 'Transaction limit exceeded';
      }

      if (message.includes('already') && message.includes('exist')) {
        return 'Record already exists';
      }

      if (message.includes('unauthorized') || message.includes('not authorized')) {
        return 'You are not authorized to perform this action';
      }

      if (message.includes('session') && message.includes('expired')) {
        return 'Your session has expired. Please log in again';
      }

      if (message.includes('invalid') && message.includes('account')) {
        return 'Invalid account number';
      }

      if (message.includes('beneficiary')) {
        return 'Beneficiary information is invalid or missing';
      }

      if (message.includes('same') && message.includes('account')) {
        return 'Cannot transfer to the same account. Please select a different destination account';
      }

      if (message.includes('server') && (message.includes('error') || message.includes('down'))) {
        return 'Service temporarily unavailable. Please try again later';
      }

      // Check if message is technical before returning
      if (isTechnicalMessage(String(apiMessage))) {
        return 'Something went wrong. Please try again later';
      }

      // Return the original API message if no specific match
      // Clean it up: capitalize first letter, ensure it ends with a period
      const cleanMessage = apiMessage.trim();
      const capitalizedMessage = cleanMessage.charAt(0).toUpperCase() + cleanMessage.slice(1);
      return capitalizedMessage.endsWith('.') ? capitalizedMessage : `${capitalizedMessage}.`;
    }

  }

  // Handle validation errors from client
  if (error.validation) {
    return String(error.validation);
  }

  // Generic fallback
  return 'Transaction failed. Please try again';
};
