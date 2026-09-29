import { useState } from "react";
import { SettingsPage } from "./SettingsPage";
import { SettingsOption } from "./SettingsOption";
import { ToggleSwitch } from "./ToggleSwitch";
import { Bell, Check, Send } from "lucide-react";

export function NotificationsSettings() {
  const [showNotif, setShowNotif] = useState(() => localStorage.getItem("anonote_notif") !== "false");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleNotif = (checked: boolean) => {
    setShowNotif(checked);
    localStorage.setItem("anonote_notif", checked ? "true" : "false");
    if (checked && "Notification" in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          showToast("Browser push alerts enabled!");
        } else {
          showToast("Notification permission not granted");
        }
      });
    } else {
      showToast("Notifications turned off");
    }
  };

  const handleTestNotification = () => {
    if (!showNotif) {
      showToast("Please enable notifications switch first");
      return;
    }
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("AnoNote", {
        body: "Encrypted direct message received",
        icon: "/favicon.ico",
      });
      showToast("Test notification dispatched!");
    } else if ("Notification" in window && Notification.permission !== "denied") {
      Notification.requestPermission().then((perm) => {
        if (perm === "granted") {
          new Notification("AnoNote", {
            body: "Encrypted direct message received",
          });
          showToast("Test notification dispatched!");
        } else {
          showToast("Notification permission denied in browser");
        }
      });
    } else {
      showToast("Notifications are blocked in browser preferences");
    }
  };

  return (
    <SettingsPage title="Notifications">
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#0284c7] text-white px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium">
          <Check className="w-4 h-4" />
          {toastMessage}
        </div>
      )}

      {/* Push Notification Tester */}
      <div className="bg-[#111b21] mt-3 p-4 border-b border-[#202c33] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#0284c7]/20 text-[#38bdf8] flex items-center justify-center">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-[#e9edef] font-medium text-sm">System Alerts</h3>
            <p className="text-xs text-[#8696a0]">Test push alerts & badge sound</p>
          </div>
        </div>
        <button
          onClick={handleTestNotification}
          className="bg-[#0284c7] hover:bg-[#0369a1] text-white px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5"
        >
          <Send className="w-3.5 h-3.5" />
          Test Alert
        </button>
      </div>

      {/* Message Notifications */}
      <div className="bg-[#111b21] mt-3 border-b border-[#202c33]">
        <div className="px-4 py-3 border-b border-[#202c33]/60">
          <h3 className="text-xs font-semibold text-[#38bdf8] uppercase tracking-wider">
            Message Notifications
          </h3>
        </div>
        <SettingsOption
          title="Conversation tones"
          description="Play sounds for incoming and outgoing messages"
          rightContent={<ToggleSwitch defaultChecked={showNotif} onChange={handleToggleNotif} />}
        />
        <SettingsOption
          title="Notification tone"
          value="AnoNote Alert (Default)"
          showArrow
        />
        <SettingsOption
          title="Vibrate"
          value="Default"
          showArrow
        />
        <SettingsOption
          title="Reaction notifications"
          description="Show alerts for emoji reactions to messages"
          rightContent={<ToggleSwitch defaultChecked={true} />}
        />
      </div>

      {/* Group Notifications */}
      <div className="bg-[#111b21] mt-3 border-b border-[#202c33]">
        <div className="px-4 py-3 border-b border-[#202c33]/60">
          <h3 className="text-xs font-semibold text-[#38bdf8] uppercase tracking-wider">
            Group Notifications
          </h3>
        </div>
        <SettingsOption
          title="Show group alerts"
          rightContent={<ToggleSwitch defaultChecked={true} />}
        />
        <SettingsOption
          title="Notification tone"
          value="Default"
          showArrow
        />
      </div>

      {/* Calls */}
      <div className="bg-[#111b21] mt-3 border-b border-[#202c33]">
        <div className="px-4 py-3 border-b border-[#202c33]/60">
          <h3 className="text-xs font-semibold text-[#38bdf8] uppercase tracking-wider">
            Calls
          </h3>
        </div>
        <SettingsOption
          title="Ringtone"
          value="AnoNote Ring"
          showArrow
        />
        <SettingsOption
          title="Vibrate on call"
          value="Default"
          showArrow
        />
      </div>
    </SettingsPage>
  );
}
