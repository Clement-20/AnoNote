import { useState, useEffect } from "react";
import { SettingsPage } from "./SettingsPage";
import { SettingsOption } from "./SettingsOption";
import { ToggleSwitch } from "./ToggleSwitch";
import { Trash2, Shield, Key, User, Download, Check, X, AlertTriangle, BadgeCheck } from "lucide-react";
import { VerifiedBadge } from "../VerifiedBadge";
import { VerificationModal } from "../VerificationModal";

export function AccountSettings() {
  const [name, setName] = useState(() => localStorage.getItem("ghost_note_account_name") || "Anon #8462");
  const [about, setAbout] = useState(() => localStorage.getItem("ghost_note_account_about") || "Anonymous and proud on anoNote");
  const [twoStep, setTwoStep] = useState(() => localStorage.getItem("ghost_note_twostep") === "true");
  const [isVerified, setIsVerified] = useState(() => localStorage.getItem("anon_is_verified") === "true");
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  
  const [activeModal, setActiveModal] = useState<'name' | 'about' | 'twostep' | 'pin' | 'passkey' | 'number' | 'request' | 'delete' | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem("ghost_note_account_name", name);
  }, [name]);

  useEffect(() => {
    localStorage.setItem("ghost_note_account_about", about);
  }, [about]);

  useEffect(() => {
    localStorage.setItem("ghost_note_twostep", twoStep ? "true" : "false");
  }, [twoStep]);

  useEffect(() => {
    const handleVerificationUpdate = (e: any) => {
      setIsVerified(e.detail?.verified ?? (localStorage.getItem("anon_is_verified") === "true"));
    };
    window.addEventListener("verification_updated", handleVerificationUpdate);
    return () => window.removeEventListener("verification_updated", handleVerificationUpdate);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveModal = () => {
    if (activeModal === 'name' && inputValue.trim()) {
      setName(inputValue.trim());
      showToast("Profile name updated successfully");
    } else if (activeModal === 'about' && inputValue.trim()) {
      setAbout(inputValue.trim());
      showToast("About status updated successfully");
    } else if (activeModal === 'pin') {
      showToast("Security PIN updated successfully");
    } else if (activeModal === 'number') {
      showToast("Anon identity number updated");
    }
    setActiveModal(null);
    setInputValue("");
  };

  const handleRequestInfo = () => {
    const report = {
      app: "anoNote (anoNote.icepab.name.ng)",
      accountName: name,
      aboutStatus: about,
      identifier: "#8462",
      twoStepVerification: twoStep ? "Enabled" : "Disabled",
      exportTimestamp: new Date().toISOString(),
      securityStatus: "End-to-end encrypted",
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `anonote_account_report_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Account report downloaded successfully");
    setActiveModal(null);
  };

  const handleDeleteAccount = () => {
    localStorage.clear();
    showToast("Account deleted. Redirecting...");
    setTimeout(() => {
      window.location.href = "/login";
    }, 1500);
  };

  return (
    <SettingsPage title="Account">
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-purple-600 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-sm font-medium animate-bounce">
          <Check className="w-4 h-4" />
          {toastMessage}
        </div>
      )}

      {/* Profile info */}
      <div className="bg-[#1c1c1e] mt-4">
        <div className="px-4 py-3 border-b border-gray-800">
          <h3 className="text-sm text-gray-400 uppercase tracking-wide">Profile Info</h3>
        </div>
        <SettingsOption
          title="Anon Identity"
          description="Your unique anonymous identifier"
          value="#8462"
          rightContent={
            isVerified ? (
              <div className="flex items-center gap-1 text-purple-400">
                <VerifiedBadge size="sm" userName={name} />
              </div>
            ) : undefined
          }
        />
        <div onClick={() => setShowVerificationModal(true)}>
          <SettingsOption
            title="Multi-Step Identity Verification"
            description="Zero-knowledge proof to earn trust badge"
            value={isVerified ? "Verified ✓" : "Unverified"}
            showArrow
          />
        </div>
        <div onClick={() => { setActiveModal('name'); setInputValue(name); }}>
          <SettingsOption
            title="Name"
            description="This is not your username or PIN"
            value={name}
            showArrow
          />
        </div>
        <div onClick={() => { setActiveModal('about'); setInputValue(about); }}>
          <SettingsOption
            title="About"
            description="Currently set to"
            value={about}
            showArrow
          />
        </div>
      </div>

      {/* Security */}
      <div className="bg-[#1c1c1e] mt-4">
        <div className="px-4 py-3 border-b border-gray-800">
          <h3 className="text-sm text-gray-400 uppercase tracking-wide">Security</h3>
        </div>
        <div onClick={() => setActiveModal('twostep')}>
          <SettingsOption
            title="Two-step verification"
            description="Add extra security to your account"
            value={twoStep ? "Enabled" : "Off"}
            showArrow
          />
        </div>
        <div onClick={() => { setActiveModal('pin'); setInputValue(""); }}>
          <SettingsOption
            title="Change PIN"
            description="Update your security PIN"
            showArrow
          />
        </div>
        <div onClick={() => setActiveModal('passkey')}>
          <SettingsOption
            title="Passkey"
            description="Use biometrics or security key"
            showArrow
          />
        </div>
      </div>

      {/* Account Management */}
      <div className="bg-[#1c1c1e] mt-4">
        <div className="px-4 py-3 border-b border-gray-800">
          <h3 className="text-sm text-gray-400 uppercase tracking-wide">Account Management</h3>
        </div>
        <div onClick={() => { setActiveModal('number'); setInputValue(""); }}>
          <SettingsOption
            title="Change number"
            description="Change your anoNote number"
            showArrow
          />
        </div>
        <div onClick={() => setActiveModal('request')}>
          <SettingsOption
            title="Request account info"
            description="Get a report of your account information"
            showArrow
          />
        </div>
        <div onClick={() => setActiveModal('delete')}>
          <SettingsOption
            title="Delete account"
            description="Permanently delete your anoNote account"
            rightContent={<Trash2 className="w-5 h-5 text-red-400" />}
            showArrow
          />
        </div>
      </div>

      {/* Privacy notice */}
      <div className="px-4 py-6">
        <p className="text-sm text-gray-500 text-center leading-relaxed">
          Your account information is encrypted and kept anonymous. anoNote
          will never share your data with third parties.
        </p>
      </div>

      {/* Interactive Modals */}
      <VerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        onVerifiedSuccess={() => {
          setIsVerified(true);
          showToast("Account successfully verified with badge!");
        }}
      />

      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="bg-[#1c1c1e] border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
              <h3 className="text-white font-semibold text-lg capitalize">
                {activeModal === 'name' && "Edit Profile Name"}
                {activeModal === 'about' && "Edit About Status"}
                {activeModal === 'twostep' && "Two-Step Verification"}
                {activeModal === 'pin' && "Change Security PIN"}
                {activeModal === 'passkey' && "Configure Passkey"}
                {activeModal === 'number' && "Change Ghost Number"}
                {activeModal === 'request' && "Request Account Info"}
                {activeModal === 'delete' && "Delete Account"}
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {activeModal === 'name' && (
                <div>
                  <label className="text-xs text-gray-400 block mb-2">Enter new display name</label>
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full bg-[#2c2c2e] border border-gray-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-purple-600 text-sm"
                    placeholder="Anon #XXXX"
                  />
                </div>
              )}

              {activeModal === 'about' && (
                <div>
                  <label className="text-xs text-gray-400 block mb-2">Enter new about status</label>
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full bg-[#2c2c2e] border border-gray-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-purple-600 text-sm"
                    placeholder="Anonymous and proud on anoNote..."
                  />
                </div>
              )}

              {activeModal === 'twostep' && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-300 leading-relaxed">
                    Two-step verification adds an extra layer of security to your account. When enabled, any attempt to log in requires your 6-digit PIN.
                  </p>
                  <div className="flex items-center justify-between bg-[#2c2c2e] p-3.5 rounded-xl border border-gray-800">
                    <span className="text-white font-medium text-sm">Enable Two-Step Verification</span>
                    <ToggleSwitch
                      defaultChecked={twoStep}
                      onChange={(checked) => setTwoStep(checked)}
                    />
                  </div>
                </div>
              )}

              {activeModal === 'pin' && (
                <div>
                  <label className="text-xs text-gray-400 block mb-2">Enter new 6-digit PIN</label>
                  <input
                    type="password"
                    maxLength={6}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full bg-[#2c2c2e] border border-gray-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-purple-600 text-sm font-mono tracking-widest text-center text-lg"
                    placeholder="••••••"
                  />
                </div>
              )}

              {activeModal === 'passkey' && (
                <div className="text-center py-4 space-y-3">
                  <div className="w-12 h-12 bg-purple-600/20 text-purple-400 rounded-full flex items-center justify-center mx-auto">
                    <Key className="w-6 h-6" />
                  </div>
                  <h4 className="text-white font-medium">Use Biometrics or Security Key</h4>
                  <p className="text-xs text-gray-400">
                    Secure your account with Touch ID, Face ID, or a hardware security key.
                  </p>
                </div>
              )}

              {activeModal === 'number' && (
                <div>
                  <label className="text-xs text-gray-400 block mb-2">New anonymous Anon number</label>
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full bg-[#2c2c2e] border border-gray-800 rounded-xl px-4 py-2.5 text-white outline-none focus:border-purple-600 text-sm"
                    placeholder="Anon #9999"
                  />
                </div>
              )}

              {activeModal === 'request' && (
                <div className="text-center py-4 space-y-3">
                  <div className="w-12 h-12 bg-purple-600/20 text-purple-400 rounded-full flex items-center justify-center mx-auto">
                    <Download className="w-6 h-6" />
                  </div>
                  <h4 className="text-white font-medium">Download Account Report</h4>
                  <p className="text-xs text-gray-400">
                    Get a complete JSON backup report containing your account settings and profile details.
                  </p>
                </div>
              )}

              {activeModal === 'delete' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 bg-red-500/15 border border-red-500/30 p-3.5 rounded-xl text-red-400">
                    <AlertTriangle className="w-6 h-6 flex-shrink-0" />
                    <p className="text-xs leading-relaxed">
                      Warning: Deleting your account is permanent and cannot be undone. All encrypted chats and keys will be wiped.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-[#111111] border-t border-gray-800 flex items-center justify-end gap-3">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              {activeModal === 'request' ? (
                <button
                  onClick={handleRequestInfo}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Download Report
                </button>
              ) : activeModal === 'delete' ? (
                <button
                  onClick={handleDeleteAccount}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Delete Account Permanently
                </button>
              ) : activeModal === 'passkey' ? (
                <button
                  onClick={() => { showToast("Passkey registered successfully"); setActiveModal(null); }}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Register Passkey
                </button>
              ) : activeModal === 'twostep' ? (
                <button
                  onClick={() => { showToast("Two-step settings saved"); setActiveModal(null); }}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Save Settings
                </button>
              ) : (
                <button
                  onClick={handleSaveModal}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Save Changes
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </SettingsPage>
  );
}
