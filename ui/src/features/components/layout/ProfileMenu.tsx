"use client";

import { Check, ChevronDown, LogOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/features/hooks/useToast";
import { useSdkStore } from "@/features/store/useSdkStore";
import { cn } from "@/features/utils/cn";
import { disconnectHostSocket } from "@/lib/inapp-sdk";

export function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const [tokenDraft, setTokenDraft] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const logout = useSdkStore((state) => state.logout);
  const updateJwtToken = useSdkStore((state) => state.updateJwtToken);
  const orgId = useSdkStore((state) => state.orgId);
  const customerId = useSdkStore((state) => state.customerId);
  const jwtToken = useSdkStore((state) => state.jwtToken);
  const customerDetails = useSdkStore((state) => state.customerDetails);
  const toast = useToast();

  useEffect(() => {
    setTokenDraft(jwtToken);
  }, [jwtToken, open]);

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

  function handleSaveJwtToken() {
    const nextToken = tokenDraft.trim();

    if (!nextToken) {
      toast.error("JWT token is required.");
      return;
    }

    if (nextToken === jwtToken) {
      toast.info("JWT token is already up to date.");
      return;
    }

    updateJwtToken(nextToken);
    toast.success("JWT token updated successfully.");
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
          <div className="text-xs text-muted-foreground">{customerDetails?.email ?? "demo@dokaai.ai"}</div>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      {open ? (
        <Card className="absolute right-0 z-20 mt-3 w-72 p-4 shadow-soft">
          <div className="space-y-1 border-b pb-3">
            <div className="text-sm font-medium text-foreground">{customerDetails?.name ?? "Demo User"}</div>
            <div className="text-xs text-muted-foreground">{customerDetails?.email ?? "demo@dokaai.ai"}</div>
          </div>
          <div className="space-y-3 py-3 text-sm">
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">orgId</div>
              <div className="truncate text-foreground">{orgId}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">customerId</div>
              <div className="truncate text-foreground">{customerId}</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">jwtToken</div>
              <div className="flex items-center gap-2">
                <Input
                  value={tokenDraft}
                  onChange={(event) => setTokenDraft(event.target.value)}
                  placeholder="Update JWT token"
                  className="h-10 text-xs"
                />
                <Button
                  className="h-10 w-10 shrink-0 justify-center rounded-lg px-0"
                  onClick={handleSaveJwtToken}
                  aria-label="Save JWT token"
                  title="Save JWT token"
                >
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <Button className="w-full justify-center" variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </Card>
      ) : null}
    </div>
  );
}
