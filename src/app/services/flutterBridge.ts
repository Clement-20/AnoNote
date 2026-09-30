/**
 * Flutter Hybrid Bridge Service
 * Integrates web view interop with Flutter wrappers (supports both JavascriptChannels and InAppWebView)
 */

declare global {
  interface Window {
    FlutterWebView?: {
      postMessage(message: string): void;
    };
    flutter_inappwebview?: {
      callHandler(handlerName: string, ...args: any[]): Promise<any>;
    };
    onFlutterMessage?: (message: string) => void;
  }
}

// Check if running inside a Flutter WebView wrapper
export function isFlutterWrapper(): boolean {
  if (typeof window === "undefined") return false;
  return !!(
    window.FlutterWebView ||
    window.flutter_inappwebview ||
    /flutter|webview/i.test(navigator.userAgent)
  );
}

// Safely post message to Flutter JavascriptChannel
export function postMessageToFlutter(event: string, data: any = {}) {
  if (typeof window === "undefined") return;

  const payload = {
    event,
    timestamp: new Date().toISOString(),
    data,
  };

  const payloadString = JSON.stringify(payload);

  // 1. Standard JavascriptChannel (e.g. FlutterWebView.postMessage)
  if (window.FlutterWebView?.postMessage) {
    try {
      window.FlutterWebView.postMessage(payloadString);
    } catch (e) {
      console.warn("[Flutter Bridge] Standard postMessage failed:", e);
    }
  }

  // 2. InAppWebView Handler Interop
  if (window.flutter_inappwebview?.callHandler) {
    try {
      window.flutter_inappwebview.callHandler(event, data);
    } catch (e) {
      console.warn("[Flutter Bridge] InAppWebView callHandler failed:", e);
    }
  }

  console.log("[Flutter Bridge] Dispatched Event:", event, data);
}

// Invoke native haptic feedback (e.g. light impact, success)
export function triggerNativeHaptic(type: "light" | "medium" | "heavy" | "success" | "error" = "light") {
  postMessageToFlutter("haptic", { type });
}

// Invoke native share dialogue
export function triggerNativeShare(title: string, text: string, url: string) {
  if (isFlutterWrapper()) {
    postMessageToFlutter("share", { title, text, url });
    return true;
  }
  return false;
}

// Notify Flutter about Route or Viewport modifications (e.g. updating native AppBar status colors)
export function notifyNativeRouteChanged(path: string, title: string = "AnoNote") {
  postMessageToFlutter("routeChanged", { path, title });
}

// Notify Flutter about unread message counts so it can display a native app badge count!
export function updateNativeAppBadge(count: number) {
  postMessageToFlutter("updateBadge", { count });
}

// Initialize listeners to receive events injected from the Flutter native side
export function initializeFlutterBridge(onMessageReceived?: (event: string, data: any) => void) {
  if (typeof window === "undefined") return;

  window.onFlutterMessage = (messageString: string) => {
    try {
      const payload = JSON.parse(messageString);
      console.log("[Flutter Bridge] Received Message:", payload);
      if (onMessageReceived && payload.event) {
        onMessageReceived(payload.event, payload.data || {});
      }
    } catch (e) {
      console.warn("[Flutter Bridge] Failed to parse Flutter message:", e);
    }
  };

  // Signal to native wrapper that the web application is fully loaded and ready for interop
  postMessageToFlutter("appReady", {
    url: window.location.href,
    userAgent: navigator.userAgent,
  });
}
