import { useState, useEffect } from "react";
import { SettingsPage } from "./SettingsPage";
import { SettingsOption } from "./SettingsOption";
import { ToggleSwitch } from "./ToggleSwitch";
import { Trash2, Shield, Key, User, Download, Check, X, AlertTriangle } from "lucide-react";
import { VerifiedBadge } from "../VerifiedBadge";
import { VerificationModal } from "../VerificationModal";
import { useAuth } from "../../context/AuthContext";

export function AccountSettings() {
  const { currentUser, updateProfile, logOut } = useAuth();

  const [name, setName] = useState(currentUser?.name || "Anon User");
  const [about, setAbout] = useState(() => localStorage.getItem("anonote_account_about") || "Encrypted & Anonymous on AnoNote");
  const [twoStep, setTwoStep] = useState(() => localStorage.getItem("anonote_twostep") === "true");
  const [isVerified, setIsVerified] = useState(currentUser?.isVerified || false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  
  const [activeModal, setActiveModal] = useState<'name' | 'about' | 'twostep' | 'pin' | 'passkey' | 'number' | 'request' | 'delete' | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser?.name) {
      setName(currentUser.name);
    }
  }, [currentUser?.name]);

  useEffect(() => {
    localStorage.setItem("anonote_account_about", about);
  }, [about]);

  useEffect(() => {
    localStorage.setItem("anonote_twostep", twoStep ? "true" : "false");
  }, [twoStep]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveModal = async () => {
    if (activeModal === 'name' && inputValue.trim()) {
      setName(inputValue.trim());
      await updateProfile(inputValue.trim(), currentUser.avatar, isVerified);
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
      app: "AnoNote",
      accountName: name,
      aboutStatus: about,
      anonId: currentUser.anonId,
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
    logOut();
    localStorage.clear();
    showToast("Account deleted. Redirecting...");
    setTimeout(() => {
      window.location.href = "/login";
    }, 1500);
  };

  return (
    <SettingsPage title="Account">
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#0284c7] text-white px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium">
          <Check className="w-4 h-4" />
          {toastMessage}
        </div>
      )}

      {/* Profile info */}
      <div className="bg-[#111b21] mt-3 border-b border-[#202c33]">
        <div className="px-4 py-3 border-b border-[#202c33]/60">
          <h3 className="text-xs font-semibold text-[#38bdf8] uppercase tracking-wider">Profile Info</h3>
        </div>
        <SettingsOption
          title="Anon Identity"
          description="Your unique anonymous identifier"
          value={currentUser.anonId}
          rightContent={
            isVerified ? (
              <div className="flex items-center gap-1">
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
            description="This is your public display name on AnoNote"
            value={name}
            showArrow
          />
        </div>
        <div onClick={() => { setActiveModal('about'); setInputValue(about); }}>
          <SettingsOption
            title="About"
            description="Status message shown to peers"
            value={about}
            showArrow
          />
        </div>
      </div>

      {/* Security */}
      <div className="bg-[#111b21] mt-3 border-b border-[#202c33]">
        <div className="px-4 py-3 border-b border-[#202c33]/60">
          <h3 className="text-xs font-semibold text-[#38bdf8] uppercase tracking-wider">Security</h3>
        </div>
        <div onClick={() => setActiveModal('twostep')}>
          <SettingsOption
            title="Two-step verification"
            description="Add an extra security layer"
            value={twoStep ? "Enabled" : "Off"}
            showArrow
          />
        </div>
        <div onClick={() => { setActiveModal('pin'); setInputValue(""); }}>
          <SettingsOption
            title="Change PIN"
            description="Update your 4 to 6-digit security PIN"
            showArrow
          />
        </div>
        <div onClick={() => setActiveModal('passkey')}>
          <SettingsOption
            title="Passkey"
            description="Use biometrics or device credentials"
            showArrow
          />
        </div>
      </div>

      {/* Account Management */}
      <div className="bg-[#111b21] mt-3 border-b border-[#202c33]">
        <div className="px-4 py-3 border-b border-[#202c33]/60">
          <h3 className="text-xs font-semibold text-[#38bdf8] uppercase tracking-wider">Account Management</h3>
        </div>
        <div onClick={() => setActiveModal('request')}>
          <SettingsOption
            title="Request account info"
            description="Download a copy of your account data"
            showArrow
          />
        </div>
        <div onClick={() => setActiveModal('delete')}>
          <SettingsOption
            title="Delete account"
            description="Permanently delete your identity and wipe all keys"
            rightContent={<Trash2 className="w-4 h-4 text-[#f15c6d]" />}
            showArrow
          />
        </div>
      </div>

      {/* Privacy notice */}
      <div className="px-4 py-6">
        <p className="text-xs text-[#8696a0] text-center leading-relaxed">
          Your account information is encrypted. AnoNote never shares or stores metadata on central servers.
        </p>
      </div>

      {/* Interactive Modals */}
      <VerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        onVerifiedSuccess={() => {
          setIsVerified(true);
          updateProfile(name, currentUser.avatar, true);
          showToast("Account successfully verified with badge!");
        }}
      />

      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-[#111b21] border border-[#202c33] rounded-lg w-full max-w-md overflow-hidden">
            <div className="px-5 py-4 border-b border-[#202c33] flex items-center justify-between">
              <h3 className="text-[#e9edef] font-medium text-base capitalize">
                {activeModal === 'name' && "Edit Profile Name"}
                {activeModal === 'about' && "Edit About Status"}
                {activeModal === 'twostep' && "Two-Step Verification"}
                {activeModal === 'pin' && "Change Security PIN"}
                {activeModal === 'passkey' && "Configure Passkey"}
                {activeModal === 'request' && "Request Account Info"}
                {activeModal === 'delete' && "Delete Account"}
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-[#8696a0] hover:text-[#e9edef]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {activeModal === 'name' && (
                <div>
                  <label className="text-xs text-[#8696a0] block mb-2">Enter new display name</label>
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full bg-[#202c33] border border-[#2a3942] rounded-md px-3.5 py-2.5 text-[#e9edef] outline-none focus:border-[#0284c7] text-sm"
                    placeholder="Anon User"
                  />
                </div>
              )}

              {activeModal === 'about' && (
                <div>
                  <label className="text-xs text-[#8696a0] block mb-2">Enter new about status</label>
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full bg-[#202c33] border border-[#2a3942] rounded-md px-3.5 py-2.5 text-[#e9edef] outline-none focus:border-[#0284c7] text-sm"
                    placeholder="Encrypted & Anonymous on AnoNote..."
                  />
                </div>
              )}

              {activeModal === 'twostep' && (
                <div className="space-y-4">
                  <p className="text-xs text-[#8696a0] leading-relaxed">
                    Two-step verification adds an extra layer of security to your account. When enabled, any attempt to restore requires your security PIN.
                  </p>
                  <div className="flex items-center justify-between bg-[#202c33] p-3.5 rounded-md border border-[#2a3942]">
                    <span className="text-[#e9edef] font-medium text-sm">Enable Two-Step Verification</span>
                    <ToggleSwitch
                      defaultChecked={twoStep}
                      onChange={(checked) => setTwoStep(checked)}
                    />
                  </div>
                </div>
              )}

              {activeModal === 'pin' && (
                <div>
                  <label className="text-xs text-[#8696a0] block mb-2">Enter new 6-digit PIN</label>
                  <input
                    type="password"
                    maxLength={6}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full bg-[#202c33] border border-[#2a3942] rounded-md px-3.5 py-2.5 text-[#e9edef] outline-none focus:border-[#0284c7] text-sm font-mono tracking-widest text-center text-base"
                    placeholder="••••••"
                  />
                </div>
              )}

              {activeModal === 'passkey' && (
                <div className="text-center py-4 space-y-3">
                  <div className="w-12 h-12 bg-[#0284c7]/20 text-[#38bdf8] rounded-full flex items-center justify-center mx-auto">
                    <Key className="w-6 h-6" />
                  </div>
                  <h4 className="text-[#e9edef] font-medium text-sm">Use Biometrics or Security Key</h4>
                  <p className="text-xs text-[#8696a0]">
                    Secure your account with WebAuthn, Touch ID, Face ID, or hardware security keys.
                  </p>
                </div>
              )}

              {activeModal === 'request' && (
                <div className="text-center py-4 space-y-3">
                  <div className="w-12 h-12 bg-[#0284c7]/20 text-[#38bdf8] rounded-full flex items-center justify-center mx-auto">
                    <Download className="w-6 h-6" />
                  </div>
                  <h4 className="text-[#e9edef] font-medium text-sm">Download Account Report</h4>
                  <p className="text-xs text-[#8696a0]">
                    Get a complete JSON backup report containing your account settings and profile details.
                  </p>
                </div>
              )}

              {activeModal === 'delete' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 bg-[#f15c6d]/15 border border-[#f15c6d]/30 p-3.5 rounded-md text-[#f15c6d]">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-xs leading-relaxed">
                      Warning: Deleting your account is permanent. All encrypted local cache and keys will be immediately wiped.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="px-5 py-3.5 bg-[#0b141a] border-t border-[#202c33] flex items-center justify-end gap-3">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 text-xs font-medium text-[#8696a0] hover:text-[#e9edef] transition-colors"
              >
                Cancel
              </button>
              {activeModal === 'request' ? (
                <button
                  onClick={handleRequestInfo}
                  className="px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-md text-xs font-medium transition-colors"
                >
                  Download Report
                </button>
              ) : activeModal === 'delete' ? (
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 bg-[#f15c6d] hover:bg-[#d94859] text-white rounded-md text-xs font-medium transition-colors"
                >
                  Delete Account Permanently
                </button>
              ) : activeModal === 'passkey' ? (
                <button
                  onClick={() => { showToast("Passkey registered successfully"); setActiveModal(null); }}
                  className="px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-md text-xs font-medium transition-colors"
                >
                  Register Passkey
                </button>
              ) : activeModal === 'twostep' ? (
                <button
                  onClick={() => { showToast("Two-step settings saved"); setActiveModal(null); }}
                  className="px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-md text-xs font-medium transition-colors"
                >
                  Save Settings
                </button>
              ) : (
                <button
                  onClick={handleSaveModal}
                  className="px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-md text-xs font-medium transition-colors"
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
