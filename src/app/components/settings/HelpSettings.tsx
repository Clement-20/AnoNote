import { SettingsPage } from "./SettingsPage";
import { SettingsOption } from "./SettingsOption";
import { ShieldCheck, Mail, MessageSquare } from "lucide-react";

export function HelpSettings() {
  return (
    <SettingsPage title="Help">
      {/* Support */}
      <div className="bg-[#111b21] mt-3 border-b border-[#202c33]">
        <div className="px-4 py-3 border-b border-[#202c33]/60">
          <h3 className="text-xs font-semibold text-[#38bdf8] uppercase tracking-wider">Support</h3>
        </div>
        <SettingsOption
          title="Help Center"
          description="Read encryption specs and guides"
          showArrow
        />
        <SettingsOption
          title="Contact Support"
          description="Reach out with feedback or bug reports"
          showArrow
        />
        <SettingsOption
          title="Terms and Privacy Policy"
          showArrow
        />
        <SettingsOption
          title="App Info"
          value="AnoNote v2.0"
        />
      </div>

      {/* About Box */}
      <div className="px-4 py-8 text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-[#111b21] border border-[#202c33] flex items-center justify-center text-3xl mx-auto text-[#38bdf8]">
          <ShieldCheck className="w-8 h-8 text-[#38bdf8]" />
        </div>
        <h3 className="text-lg font-medium text-[#e9edef]">AnoNote</h3>
        <p className="text-xs text-[#8696a0] max-w-sm mx-auto leading-relaxed">
          Minimalist, zero-knowledge anonymous messaging. End-to-end encryption with zero logs and zero phone number requirements.
        </p>
        <p className="text-[11px] text-[#8696a0] pt-4">© 2026 AnoNote. All rights reserved.</p>
      </div>
    </SettingsPage>
  );
}
