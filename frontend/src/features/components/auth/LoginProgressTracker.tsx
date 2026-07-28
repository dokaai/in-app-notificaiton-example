"use client";

import { AlertCircle, CheckCircle2, LoaderCircle, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/features/utils/cn";

export type LoginProgressStepKey =
  | "customer"
  | "socket";

export type LoginProgressStatus =
  | "idle"
  | "pending"
  | "loading"
  | "success"
  | "error";

export interface LoginProgressStep {
  key: LoginProgressStepKey;
  title: string;
  description: string;
  status: LoginProgressStatus;
}

function StepIcon({ status }: { status: LoginProgressStatus }) {
  if (status === "success") {
    return <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
  }

  if (status === "loading") {
    return <LoaderCircle className="h-5 w-5 animate-spin text-primary" />;
  }

  if (status === "error") {
    return <AlertCircle className="h-5 w-5 text-red-600" />;
  }

  return <Wifi className="h-5 w-5 text-slate-400" />;
}

export function LoginProgressTracker({
  steps,
  onRetry,
  onBack,
}: {
  steps: LoginProgressStep[];
  onRetry: () => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h3 className="text-2xl font-semibold text-foreground mt-8">Preparing your session</h3>
        <p className="text-sm leading-6 text-muted-foreground">
          We are validating your request to allow access to the dashboard
        </p>
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => (
          <div
            key={step.key}
            className={cn(
              "rounded-2xl border p-4 transition",
              step.status === "success" && "border-emerald-200 bg-emerald-50/60",
              step.status === "loading" && "border-primary/20 bg-primary-light/50",
              step.status === "error" && "border-red-200 bg-red-50/70",
              (step.status === "pending" || step.status === "idle") &&
                "border-slate-200 bg-slate-50"
            )}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                <StepIcon status={step.status} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    Step {index + 1}
                  </span>
                </div>
                <p className="mt-1 text-sm font-semibold text-foreground">{step.title}</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{step.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Button type="button" onClick={onRetry}>
          Retry
        </Button>
        <Button variant="outline" type="button" onClick={onBack}>
          Back to sign in
        </Button>
      </div>
    </div>
  );
}
