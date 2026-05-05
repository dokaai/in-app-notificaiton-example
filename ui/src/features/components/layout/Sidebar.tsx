"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SIDEBAR_NAVIGATION } from "@/features/constants/navigation";
import { cn } from "@/features/utils/cn";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-full w-72 shrink-0 border-r bg-white lg:flex lg:flex-col">
      <div className="border-b px-6 py-[22px]">
        <Image
          src="/Dokaai_Full_Logo.png"
          alt="DokaAI"
          width={160}
          height={36}
          className="h-9 w-auto"
          priority
        />
      </div>
      <nav className="flex-1 p-4">
        {SIDEBAR_NAVIGATION.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition",
                isActive
                  ? "bg-primary-light text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
