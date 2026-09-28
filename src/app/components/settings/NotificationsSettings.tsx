import { useState } from "react";
import { SettingsPage } from "./SettingsPage";
import { SettingsOption } from "./SettingsOption";
import { ToggleSwitch } from "./ToggleSwitch";
import { Bell, Check, Send } from "lucide-react";

export function NotificationsSettings() {
  const [showNotif, setShowNotif] = useState(() => localStorage.getItem("ghost_note_notif") !== "false");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleNotif = (checked: boolean) => {
    setShowNotif(checked);
    localStorage.setItem("ghost_note_notif", checked ? "true" : "false");
    if (checked && "Notification" in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          showToast("Browser push notifications enabled!");
        } else {
          showToast("Notification permission denied");
        }
      });
    } else {
      showToast("Notifications disabled");
    }
  };

  const handleTestNotification = () => {
    if (!showNotif) {
      showToast("Please enable 'Show notifications' first");
      return;
    }
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("anoNote 🔒", {
        body: "New encrypted message from Anon #3847",
      });
      showToast("Test notification sent!");
    } else if ("Notification" in window && Notification.permission !== "denied") {
      Notification.requestPermission().then((perm) => {
        if (perm === "granted") {
          new Notification("anoNote 🔒", {
            body: "New encrypted message from Anon #3847",
          });
          showToast("Test notification sent!");
        } else {
          showToast("Notification permission not granted");
        }
      });
    } else {
      showToast("Notifications are blocked in your browser settings");
    }
  };

  return (
    <SettingsPage title="Notifications">
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-purple-600 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-sm font-medium animate-bounce">
          <Check className="w-4 h-4" />
          {toastMessage}
        </div>
      )}

      {/* Test Notification Banner */}
      <div className="bg-[#1c1c1e] mt-4 p-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-600/20 text-purple-400 flex items-center justify-center">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-white font-medium text-sm">Active Notifications</h3>
            <p className="text-xs text-gray-400">Test browser notifications & unread badges</p>
          </div>
        </div>
        <button
          onClick={handleTestNotification}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 shadow"
        >
          <Send className="w-3.5 h-3.5" />
          Test Push Alert
        </button>
      </div>

      {/* Message notifications */}
      <div className="bg-[#1c1c1e] mt-4">
        <div className="px-4 py-3 border-b border-gray-800">
          <h3 className="text-sm text-gray-400 uppercase tracking-wide">
            Message Notifications
          </h3>
        </div>
        <SettingsOption
          title="Show notifications"
          rightContent={<ToggleSwitch defaultChecked={showNotif} onChange={handleToggleNotif} />}
        />
        <SettingsOption
          title="Notification tone"
          value="Default"
          showArrow
        />
        <SettingsOption
          title="Vibrate"
          value="Default"
          showArrow
        />
        <SettingsOption
          title="Popup notification"
          value="No popup"
          showArrow
        />
        <SettingsOption
          title="Use high priority notifications"
          description="Show previews at the top of the screen"
          rightContent={<ToggleSwitch defaultChecked={true} />}
        />
      </div>

      {/* Group notifications */}
      <div className="bg-[#1c1c1e] mt-4">
        <div className="px-4 py-3 border-b border-gray-800">
          <h3 className="text-sm text-gray-400 uppercase tracking-wide">
            Group Notifications
          </h3>
        </div>
        <SettingsOption
          title="Show notifications"
          rightContent={<ToggleSwitch defaultChecked={true} />}
        />
        <SettingsOption
          title="Notification tone"
          value="Default"
          showArrow
        />
      </div>

      {/* Call notifications */}
      <div className="bg-[#1c1c1e] mt-4">
        <div className="px-4 py-3 border-b border-gray-800">
          <h3 className="text-sm text-gray-400 uppercase tracking-wide">
            Call Notifications
          </h3>
        </div>
        <SettingsOption
          title="Ringtone"
          value="Default"
          showArrow
        />
      </div>

      {/* Other */}
      <div className="bg-[#1c1c1e] mt-4">
        <div className="px-4 py-3 border-b border-gray-800">
          <h3 className="text-sm text-gray-400 uppercase tracking-wide">Other</h3>
        </div>
        <SettingsOption
          title="Show reaction notifications"
          rightContent={<ToggleSwitch defaultChecked={true} />}
        />
        <SettingsOption
          title="In-app notification bubbles"
          description="Show unread message counts on chat items"
          rightContent={<ToggleSwitch defaultChecked={true} />}
        />
        <SettingsOption
          title="In-app sounds"
          rightContent={<ToggleSwitch defaultChecked={true} />}
        />
      </div>
    </SettingsPage>
  );
}
