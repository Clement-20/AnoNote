import { createBrowserRouter } from "react-router";
import { ChatList } from "./components/ChatList";
import { ChatViewDesktop } from "./components/ChatViewDesktop";
import { ResponsiveLayout } from "./components/ResponsiveLayout";
import { Status } from "./components/Status";
import { Calls } from "./components/Calls";
import { Settings } from "./components/Settings";
import { Profile } from "./components/Profile";
import { NewChat } from "./components/NewChat";
import { ChatInfo } from "./components/ChatInfo";
import { Login } from "./components/Login";
import { SignUp } from "./components/SignUp";
import { GroupChatView } from "./components/GroupChatView";
import { NewGroup } from "./components/NewGroup";
import { GroupInfo } from "./components/GroupInfo";
import { ArchivedChats } from "./components/ArchivedChats";
import { AccountSettings } from "./components/settings/AccountSettings";
import { AnonymitySettings } from "./components/settings/AnonymitySettings";
import { NotificationsSettings } from "./components/settings/NotificationsSettings";
import { PrivacySettings } from "./components/settings/PrivacySettings";
import { AppearanceSettings } from "./components/settings/AppearanceSettings";
import { StorageSettings } from "./components/settings/StorageSettings";
import { HelpSettings } from "./components/settings/HelpSettings";
import { InviteSettings } from "./components/settings/InviteSettings";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/signup",
    Component: SignUp,
  },
  {
    path: "/",
    element: (
      <ResponsiveLayout>
        <ChatList />
      </ResponsiveLayout>
    ),
  },
  {
    path: "/chat/:id",
    Component: ChatViewDesktop,
  },
  {
    path: "/archived",
    Component: ArchivedChats,
  },
  {
    path: "/status",
    element: (
      <ResponsiveLayout>
        <Status />
      </ResponsiveLayout>
    ),
  },
  {
    path: "/calls",
    element: (
      <ResponsiveLayout>
        <Calls />
      </ResponsiveLayout>
    ),
  },
  {
    path: "/settings",
    element: (
      <ResponsiveLayout>
        <Settings />
      </ResponsiveLayout>
    ),
  },
  {
    path: "/settings/account",
    Component: AccountSettings,
  },
  {
    path: "/settings/anonymity",
    Component: AnonymitySettings,
  },
  {
    path: "/settings/notifications",
    Component: NotificationsSettings,
  },
  {
    path: "/settings/privacy",
    Component: PrivacySettings,
  },
  {
    path: "/settings/appearance",
    Component: AppearanceSettings,
  },
  {
    path: "/settings/storage",
    Component: StorageSettings,
  },
  {
    path: "/settings/help",
    Component: HelpSettings,
  },
  {
    path: "/settings/invite",
    Component: InviteSettings,
  },
  {
    path: "/profile",
    Component: Profile,
  },
  {
    path: "/new-chat",
    Component: NewChat,
  },
  {
    path: "/chat/:id/info",
    Component: ChatInfo,
  },
  {
    path: "/group/:id",
    Component: GroupChatView,
  },
  {
    path: "/group/:id/info",
    Component: GroupInfo,
  },
  {
    path: "/new-group",
    Component: NewGroup,
  },
]);
