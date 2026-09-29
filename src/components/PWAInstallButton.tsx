import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share2, Smartphone, Check, X } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'header' | 'banner' | 'settings';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'header', className = '' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // If already running inside installed standalone PWA, hide or display check in settings
  if (isInstalled) {
    if (variant === 'settings') {
      return (
        <div className="flex items-center gap-2 text-xs font-semibold text-[#00a8fc] bg-[#00a8fc]/10 px-3 py-1.5 rounded-lg border border-[#00a8fc]/25">
          <Check className="w-3.5 h-3.5" />
          <span>AnoNote PWA Active (Installed)</span>
        </div>
      );
    }
    return null;
  }

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      setInstallSuccess(true);
      setTimeout(() => setInstallSuccess(false), 3000);
    }
  };

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    if (variant === 'banner') {
      return (
        <div className="bg-[#182229] border border-[#00a8fc]/30 rounded-xl p-3.5 flex items-center justify-between text-[#e9edef] my-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#00a8fc]/20 border border-[#00a8fc]/40 flex items-center justify-center text-[#00a8fc]">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Install AnoNote Web App</p>
              <p className="text-[11px] text-[#8696a0]">Fast launch, offline caching &amp; private notifications</p>
            </div>
          </div>
          <button
            onClick={handleInstallClick}
            className="px-3.5 py-1.5 bg-[#00a8fc] hover:bg-[#0284c7] text-[#0b141a] font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Install
          </button>
        </div>
      );
    }

    return (
      <button
        onClick={handleInstallClick}
        title="Install AnoNote Progressive Web App"
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#00a8fc] hover:bg-[#0284c7] text-[#0b141a] transition-all shadow-sm ${className}`}
      >
        <Download className="w-3.5 h-3.5 shrink-0" />
        <span className="hidden sm:inline">Install App</span>
      </button>
    );
  }

  // iOS Safari flow (WebKit beforeinstallprompt fallback)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          title="Install AnoNote on iPhone / iPad"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-[#00a8fc]/50 text-[#00a8fc] hover:bg-[#00a8fc]/10 transition-colors ${className}`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Install on iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b141a]/85 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-[#111b21] border border-[#222d34] p-5 shadow-2xl text-[#e9edef]">
              <div className="flex items-center justify-between pb-3 border-b border-[#222d34]">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[#00a8fc]" />
                  Install AnoNote on iPhone/iPad
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-full text-[#8696a0] hover:text-white hover:bg-[#202c33]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs text-[#8696a0]">
                <div className="flex items-start gap-3 bg-[#202c33]/60 p-3 rounded-xl border border-[#222d34]">
                  <span className="w-5 h-5 rounded-full bg-[#00a8fc]/20 text-[#00a8fc] font-bold flex items-center justify-center text-xs shrink-0">1</span>
                  <p className="text-white leading-relaxed">
                    Tap the <strong className="text-[#00a8fc]">Share</strong> icon in the Safari navigation toolbar.
                  </p>
                </div>
                <div className="flex items-start gap-3 bg-[#202c33]/60 p-3 rounded-xl border border-[#222d34]">
                  <span className="w-5 h-5 rounded-full bg-[#00a8fc]/20 text-[#00a8fc] font-bold flex items-center justify-center text-xs shrink-0">2</span>
                  <p className="text-white leading-relaxed">
                    Scroll down and tap <strong className="text-[#00a8fc]">Add to Home Screen</strong>.
                  </p>
                </div>
                <div className="flex items-start gap-3 bg-[#202c33]/60 p-3 rounded-xl border border-[#222d34]">
                  <span className="w-5 h-5 rounded-full bg-[#00a8fc]/20 text-[#00a8fc] font-bold flex items-center justify-center text-xs shrink-0">3</span>
                  <p className="text-white leading-relaxed">
                    Tap <strong className="text-[#00a8fc]">Add</strong> in the top right to launch AnoNote in standalone mode anytime!
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-[#00a8fc] py-2.5 text-xs font-bold text-[#0b141a] hover:bg-[#0284c7] transition"
              >
                Understood
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback for desktop browser before prompt fires or when installed
  return (
    <button
      onClick={() => {
        // Trigger ambient install or provide guidance
        alert("To install AnoNote as a desktop or mobile Web App, look for the 'Install' icon (computer with down arrow) in your browser address bar or menu.");
      }}
      title="Install AnoNote Web App"
      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#8696a0] hover:text-[#00a8fc] hover:bg-[#202c33] transition-colors ${className}`}
    >
      <Download className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">Web App</span>
    </button>
  );
};
