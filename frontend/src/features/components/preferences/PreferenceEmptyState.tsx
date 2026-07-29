import { Settings2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function PreferenceEmptyState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center gap-3 py-14 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-primary">
          <Settings2 className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">Oops ! Not Found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            PLease try again in a while !
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
