import { useRouteError, isRouteErrorResponse, useNavigate, Link } from "react-router";
import { ShieldAlert, RefreshCw, Home, ArrowLeft, Bug, MessageSquare } from "lucide-react";
import { useState } from "react";

export function RouteErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);

  let errorMessage = "An unexpected error occurred while loading this screen.";
  let errorStatus = 500;
  let errorTitle = "Application Error";

  if (isRouteErrorResponse(error)) {
    errorStatus = error.status;
    errorTitle = error.statusText || (error.status === 404 ? "Page Not Found" : "Routing Error");
    errorMessage = error.data?.message || (error.status === 404 ? "The encrypted channel or page you are trying to access does not exist." : error.statusText);
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === "string") {
    errorMessage = error;
  }

  const handleReset = () => {
    try {
      // Clear transient corrupt cache if any
      sessionStorage.clear();
    } catch {
      // ignore
    }
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-[#0d0d12] text-gray-100 flex items-center justify-center p-4 selection:bg-purple-500/30">
      <div className="w-full max-w-lg bg-[#181822] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-purple-900/40 via-red-900/30 to-indigo-900/40 border border-purple-500/30 flex items-center justify-center text-white mx-auto shadow-xl shadow-purple-600/20">
            <ShieldAlert className="w-8 h-8 text-purple-400" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-[11px] font-mono font-semibold text-purple-300 mb-2">
              Status Code: {errorStatus}
            </div>
            <h1 className="text-2xl font-bold text-white font-display tracking-tight">
              {errorTitle}
            </h1>
            <p className="text-xs md:text-sm text-gray-400 mt-2 leading-relaxed max-w-sm mx-auto">
              {errorMessage}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5 pt-3">
            <button
              onClick={() => navigate(-1)}
              className="flex-1 px-4 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] text-gray-200 border border-white/10 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </button>
            <Link
              to="/"
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-600/25 active:scale-95"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Return to Chats</span>
            </Link>
          </div>

          {/* Diagnostics toggle */}
          <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-gray-500">
            <button
              onClick={handleReset}
              className="hover:text-purple-300 flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reload App</span>
            </button>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="hover:text-purple-300 flex items-center gap-1 transition-colors"
            >
              <Bug className="w-3.5 h-3.5" />
              <span>{showDetails ? "Hide Stack Trace" : "Technical Details"}</span>
            </button>
          </div>

          {showDetails && (
            <div className="text-left bg-[#101017] border border-white/5 rounded-2xl p-3.5 font-mono text-[10px] text-red-300/80 overflow-x-auto max-h-40 overflow-y-auto animate-in fade-in">
              <pre>{error instanceof Error ? error.stack || error.message : JSON.stringify(error, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
