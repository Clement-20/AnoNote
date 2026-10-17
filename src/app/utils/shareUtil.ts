import { isFlutterWrapper, triggerNativeShare } from "../services/flutterBridge";

interface ShareParams {
  title: string;
  text: string;
  url: string;
  onSuccess?: (fallbackUsed: boolean) => void;
  onError?: (error: any) => void;
}

/**
 * Universal Share Utility
 * Leverages:
 * 1. Native Flutter Wrapper Bridge (if inside WebView)
 * 2. Web Share API (navigator.share)
 * 3. Clipboard copy (as high-compatibility fallback)
 * 
 * Returns true if native share dialog was triggered, false if clipboard fallback was used.
 */
export async function shareContent({
  title,
  text,
  url,
  onSuccess,
  onError,
}: ShareParams): Promise<boolean> {
  // 1. Flutter native wrapper share interop
  if (isFlutterWrapper()) {
    try {
      const sent = triggerNativeShare(title, text, url);
      if (sent) {
        if (onSuccess) onSuccess(false);
        return true;
      }
    } catch (e) {
      console.warn("[Share Utility] Flutter native share failed:", e);
    }
  }

  // 2. Web Share API (native iOS / Android / Desktop browser dialog)
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({
        title,
        text,
        url,
      });
      if (onSuccess) onSuccess(false);
      return true;
    } catch (err: any) {
      // If user cancels the prompt, don't trigger error callbacks, just log or fallback
      if (err.name === "AbortError") {
        console.log("[Share Utility] Sharing was aborted by the user.");
        return true;
      }
      console.warn("[Share Utility] navigator.share error:", err);
    }
  }

  // 3. Fallback Clipboard copy
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    try {
      const shareMessage = `${text}\n${url}`.trim();
      await navigator.clipboard.writeText(shareMessage);
      if (onSuccess) onSuccess(true);
      return false;
    } catch (err) {
      console.error("[Share Utility] Clipboard fallback failed:", err);
      if (onError) onError(err);
    }
  } else {
    if (onError) onError(new Error("No sharing or copy capabilities found on this browser."));
  }

  return false;
}
