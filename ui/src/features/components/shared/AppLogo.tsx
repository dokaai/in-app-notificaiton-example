import Image from "next/image";

export function AppLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-soft">
        <Image src="/Dokaai_logo.svg" alt="DokaAI logo" width={25} height={25} className="h-8 w-8" />
      </div>
      <div>
        <div className="text-sm font-semibold text-foreground">DokaaI</div>
        <div className="text-xs text-muted-foreground">In-App Notifications</div>
      </div>
    </div>
  );
}
