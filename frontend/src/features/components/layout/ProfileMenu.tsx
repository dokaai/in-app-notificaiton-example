"use client";

import { ChevronDown, LogOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useDemoStore } from "@/features/store/useDemoStore";
import { cn } from "@/features/utils/cn";
import { disconnectHostSocket } from "@/lib/socket-client";

export function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const logout = useDemoStore((state) => state.logout);
  const customerWorkspaceId = useDemoStore((state) => state.customerWorkspaceId);
  const customerProductSpaceCode = useDemoStore((state) => state.customerProductSpaceCode);
  const customerDetails = useDemoStore((state) => state.customerDetails);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (!open) {
      return;
    }

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [open]);

  function handleLogout() {
    disconnectHostSocket();
    logout();
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex items-center gap-3 rounded-xl border bg-white px-3 py-2 shadow-sm transition hover:bg-muted"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Avatar label={customerDetails?.name ?? "U"} className="h-8 w-8 text-xs" />
        <div className="hidden text-left sm:block">
          <div className="text-sm font-medium text-foreground">{customerDetails?.name ?? "Demo User"}</div>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      {open ? (
        <Card className="absolute right-0 z-20 mt-3 w-64 p-3 shadow-soft">
          <div className="flex items-center gap-3 border-b pb-3">
            <Avatar label={customerDetails?.name ?? "U"} className="h-9 w-9 text-xs" />
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-foreground">
                {customerDetails?.name ?? "Demo User"}
              </div>
            </div>
          </div>
          <div className="space-y-3 border-b py-3 text-sm">
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Workspace</div>
              <div className="truncate font-medium text-foreground">
                {customerWorkspaceId || "Not set"}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Product Space</div>
              <div className="truncate font-medium text-foreground">
                {customerProductSpaceCode || "Not set"}
              </div>
            </div>
          </div>
          <Button className="mt-3 w-full justify-center" variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </Card>
      ) : null}
    </div>
  );
}
