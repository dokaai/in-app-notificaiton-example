import { Bell, LayoutDashboard, Settings2 } from "lucide-react";

export const SIDEBAR_NAVIGATION: {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
}[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
];

export const TOPBAR_NAVIGATION: {
  label: string;
  href: string;
  icon: typeof Bell;
}[] = [
  {
    label: "Notifications",
    href: "/notification",
    icon: Bell,
  },
  {
    label: "Preferences",
    href: "/preferences",
    icon: Settings2,
  },
];
