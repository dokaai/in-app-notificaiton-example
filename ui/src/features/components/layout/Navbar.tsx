"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TOPBAR_NAVIGATION } from "@/features/constants/navigation";
import { useSdkStore } from "@/features/store/useSdkStore";
import { ProfileMenu } from "@/features/components/layout/ProfileMenu";
import { SocketStatusBadge } from "@/features/components/layout/SocketStatusBadge";
import { cn } from "@/features/utils/cn";
import { disconnectHostSocket } from "@/lib/inapp-sdk";

export function Navbar() {
  const pathname = usePathname();
  const isAuthenticated = useSdkStore((state) => state.isAuthenticated);
  const unreadCount = useSdkStore((state) => state.unreadCount);
  const socketStatus = useSdkStore((state) => state.socketStatus);
  const setSocketStatus = useSdkStore((state) => state.setSocketStatus);
  const bumpSocketSubscriptionNonce = useSdkStore((state) => state.bumpSocketSubscriptionNonce);

  function handleSocketAction() {
    if (!isAuthenticated) {
      return;
    }

    if (socketStatus === "connected" || socketStatus === "connecting") {
      disconnectHostSocket();
      setSocketStatus("disconnected");
      return;
    }

    setSocketStatus("connecting");
    bumpSocketSubscriptionNonce();
  }

  return (
    <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur">
      <div className="flex min-h-20 flex-wrap items-center justify-between gap-4 px-6 py-3 lg:px-8">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={!isAuthenticated}
            onClick={handleSocketAction}
          >
            <RefreshCw className="h-4 w-4" />
            {socketStatus === "connected" || socketStatus === "connecting"
              ? "Disconnect"
              : "Reconnect"}
          </Button>
          <SocketStatusBadge status={socketStatus} />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1.5">
            {TOPBAR_NAVIGATION.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex h-11 w-11 items-center justify-center rounded-lg transition",
                    isActive
                      ? "bg-white text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  aria-label={item.label}
                  title={item.label}
                >
                  <Icon className="h-[18px] w-[18px]" />
                  {item.href === "/notification" && unreadCount > 0 ? (
                    <span className="absolute right-1 top-1 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-4 text-white">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}
