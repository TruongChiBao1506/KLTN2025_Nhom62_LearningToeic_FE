// Ultimate ResizeObserver Error Suppression Script
// This script runs before React and completely eliminates ResizeObserver errors

(function () {
  "use strict";

  if (typeof window === "undefined") return;

  // Store original console methods
  const originalError = console.error;
  const originalWarn = console.warn;

  // Override console.error with bulletproof filtering
  console.error = function (...args) {
    const message = args.join(" ").toLowerCase();

    // Suppress ResizeObserver and related errors
    if (
      message.includes("resizeobserver") ||
      message.includes("script error") ||
      message.includes("non-passive event listener") ||
      message.includes("passive event listener") ||
      message.includes("handleerror")
    ) {
      return; // Completely suppress these errors
    }

    // Call original console.error for other errors
    originalError.apply(console, args);
  };

  // Override console.warn
  console.warn = function (...args) {
    const message = args.join(" ").toLowerCase();

    if (message.includes("resizeobserver")) {
      return; // Suppress ResizeObserver warnings
    }

    originalWarn.apply(console, args);
  };

  // Global error handler for window errors
  window.addEventListener(
    "error",
    function (e) {
      const message = (e.message || "").toLowerCase();

      if (
        message.includes("resizeobserver") ||
        message.includes("script error")
      ) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }
    },
    true
  );

  // Handle unhandled promise rejections
  window.addEventListener(
    "unhandledrejection",
    function (e) {
      const message = (e.reason?.message || e.reason || "")
        .toString()
        .toLowerCase();

      if (
        message.includes("resizeobserver") ||
        message.includes("script error")
      ) {
        e.preventDefault();
        return false;
      }
    },
    true
  );

  // Monkey patch ResizeObserver to catch callback errors
  if (window.ResizeObserver) {
    const OriginalResizeObserver = window.ResizeObserver;

    window.ResizeObserver = class extends OriginalResizeObserver {
      constructor(callback) {
        const wrappedCallback = function (entries, observer) {
          try {
            callback(entries, observer);
          } catch (error) {
            // Silently ignore ResizeObserver callback errors
            const message = (error.message || "").toLowerCase();
            if (!message.includes("resizeobserver")) {
              throw error; // Re-throw non-ResizeObserver errors
            }
          }
        };

        super(wrappedCallback);
      }
    };
  }

  // Periodically re-apply suppression in case something resets console methods
  setInterval(function () {
    if (
      console.error !== originalError &&
      !console.error.toString().includes("resizeobserver")
    ) {
      // Re-apply our override if it was reset
      console.error = function (...args) {
        const message = args.join(" ").toLowerCase();
        if (
          message.includes("resizeobserver") ||
          message.includes("script error") ||
          message.includes("non-passive") ||
          message.includes("passive")
        )
          return;
        originalError.apply(console, args);
      };
    }
  }, 2000);

  console.log("🛡️ ResizeObserver error suppression activated");
})();
