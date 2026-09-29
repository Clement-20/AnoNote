import { createBrowserRouter, Navigate } from "react-router";
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
import { LiveCallView } from "./components/LiveCallView";
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
import { AdminConsole } from "./components/AdminConsole";
import { RouteErrorBoundary } from "./components/RouteErrorBoundary";

export const router = createBrowserRouter([
  {
    path: "/",
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        path: "admin020page",
        Component: AdminConsole,
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: "admin",
        element: <Navigate to="/" replace />,
      },
      {
        path: "login",
        Component: Login,
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: "signup",
        Component: SignUp,
        errorElement: <RouteErrorBoundary />,
      },
      {
        index: true,
        element: (
          <ResponsiveLayout>
            <ChatList />
          </ResponsiveLayout>
        ),
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: "chat/:id",
        Component: ChatViewDesktop,
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: "archived",
        Component: ArchivedChats,
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: "status",
        element: (
          <ResponsiveLayout>
            <Status />
          </ResponsiveLayout>
        ),
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: "calls",
        element: (
          <ResponsiveLayout>
            <Calls />
          </ResponsiveLayout>
        ),
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: "call/:id",
        Component: LiveCallView,
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: "settings",
        element: (
          <ResponsiveLayout>
            <Settings />
          </ResponsiveLayout>
        ),
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: "settings/account",
        Component: AccountSettings,
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: "settings/anonymity",
        Component: AnonymitySettings,
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: "settings/notifications",
        Component: NotificationsSettings,
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: "settings/privacy",
        Component: PrivacySettings,
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: "settings/appearance",
        Component: AppearanceSettings,
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: "settings/storage",
        Component: StorageSettings,
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: "settings/help",
        Component: HelpSettings,
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: "settings/invite",
        Component: InviteSettings,
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: "profile",
        Component: Profile,
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: "new-chat",
        Component: NewChat,
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: "chat/:id/info",
        Component: ChatInfo,
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: "group/:id",
        Component: ChatViewDesktop,
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: "group/:id/info",
        Component: GroupInfo,
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: "new-group",
        Component: NewGroup,
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
