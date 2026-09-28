import { SettingsPage } from "./SettingsPage";
import { SettingsOption } from "./SettingsOption";
import { ExternalLink, MessageCircle, Mail, FileText } from "lucide-react";

export function HelpSettings() {
  return (
    <SettingsPage title="Help">
      {/* Help center */}
      <div className="bg-[#1c1c1e] mt-4">
        <div className="px-4 py-3 border-b border-gray-800">
          <h3 className="text-sm text-gray-400 uppercase tracking-wide">Support</h3>
        </div>
        <SettingsOption
          title="Help Center"
          description="Browse FAQs and guides"
          rightContent={<ExternalLink className="w-5 h-5 text-gray-400" />}
          showArrow
        />
        <SettingsOption
          title="Contact Us"
          description="Get in touch with support"
          rightContent={<Mail className="w-5 h-5 text-gray-400" />}
          showArrow
        />
        <SettingsOption
          title="Report a problem"
          description="Let us know if something isn't working"
          rightContent={<MessageCircle className="w-5 h-5 text-gray-400" />}
          showArrow
        />
      </div>

      {/* Legal */}
      <div className="bg-[#1c1c1e] mt-4">
        <div className="px-4 py-3 border-b border-gray-800">
          <h3 className="text-sm text-gray-400 uppercase tracking-wide">Legal</h3>
        </div>
        <SettingsOption
          title="Terms of Service"
          rightContent={<FileText className="w-5 h-5 text-gray-400" />}
          showArrow
        />
        <SettingsOption
          title="Privacy Policy"
          rightContent={<FileText className="w-5 h-5 text-gray-400" />}
          showArrow
        />
        <SettingsOption
          title="Licenses"
          description="Open source licenses"
          showArrow
        />
      </div>

      {/* App info */}
      <div className="bg-[#1c1c1e] mt-4">
        <div className="px-4 py-3 border-b border-gray-800">
          <h3 className="text-sm text-gray-400 uppercase tracking-wide">App Info</h3>
        </div>
        <SettingsOption
          title="App version"
          value="1.0.0"
        />
        <SettingsOption
          title="Check for updates"
          showArrow
        />
      </div>

      {/* About */}
      <div className="px-4 py-6">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-4xl shadow-xl shadow-purple-600/30">
            🛡️
          </div>
          <div>
            <h3 className="text-white text-xl font-semibold mb-1">anoNote</h3>
            <p className="text-xs text-purple-400 font-mono mb-2">anoNote.icepab.name.ng</p>
            <p className="text-sm text-gray-400 leading-relaxed max-w-md mx-auto">
              Anonymous messaging with zero-knowledge end-to-end encryption. Your privacy is our
              absolute priority.
            </p>
          </div>
          <div className="pt-4">
            <p className="text-xs text-gray-500">© 2026 anoNote.icepab.name.ng</p>
            <p className="text-xs text-gray-600 mt-1">All rights reserved</p>
          </div>
        </div>
      </div>

      {/* Quick help */}
      <div className="px-4 pb-6">
        <div className="bg-purple-600/10 border border-purple-600/20 rounded-lg p-4">
          <h4 className="text-white font-medium mb-3">Quick Help</h4>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-white mb-1">How do I stay anonymous?</p>
              <p className="text-xs text-gray-400">
                anoNote automatically generates anonymous Anon IDs. Never share
                personal information in your profile.
              </p>
            </div>
            <div>
              <p className="text-sm text-white mb-1">Are messages really encrypted?</p>
              <p className="text-xs text-gray-400">
                Yes, all messages use end-to-end encryption. Only you and your
                contact can read them.
              </p>
            </div>
            <div>
              <p className="text-sm text-white mb-1">Can I change my Anon ID?</p>
              <p className="text-xs text-gray-400">
                Your Anon ID is your permanent cryptographic identifier on anoNote.icepab.name.ng, but you can customize your display
                name and avatar anytime.
              </p>
            </div>
          </div>
        </div>
      </div>
    </SettingsPage>
  );
}
