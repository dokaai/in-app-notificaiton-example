"use client";

import { Bell, Check, Mail, MessageCircleMore, MessageSquareText, Smartphone } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/features/utils/cn";
import {
  PreferenceChannel,
  PreferenceChannelState,
} from "@/features/types/preference.types";

const CHANNEL_OPTIONS: {
  key: PreferenceChannel;
  label: string;
  shortLabel: string;
  icon: typeof Mail;
}[] = [
  { key: PreferenceChannel.EMAIL, label: "Email", shortLabel: "Email", icon: Mail },
  { key: PreferenceChannel.IN_APP, label: "In-App", shortLabel: "In-app", icon: Bell },
  { key: PreferenceChannel.SMS, label: "SMS", shortLabel: "SMS", icon: MessageSquareText },
  { key: PreferenceChannel.PUSH, label: "Push", shortLabel: "Push", icon: Smartphone },
  { key: PreferenceChannel.WHATS_APP, label: "WhatsApp", shortLabel: "WhatsApp", icon: MessageCircleMore },
];

function areChannelStatesEqual(
  left: PreferenceChannelState,
  right: PreferenceChannelState
) {
  return CHANNEL_OPTIONS.every(({ key }) => left[key] === right[key]);
}

export function PreferenceOffSwitch({
  checked,
  onChange,
  compact = false,
}: {
  checked: boolean;
  onChange: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={cn(
        "relative inline-flex items-center rounded-full border transition",
        compact ? "h-5 w-8" : "h-6 w-10",
        checked
          ? "border-primary/30 bg-primary"
          : "border-slate-300 bg-slate-200"
      )}
    >
      <span
        className={cn(
          "inline-block rounded-full bg-white shadow-sm transition-transform",
          compact ? "h-3.5 w-3.5" : "h-4 w-4",
          checked
            ? compact
              ? "translate-x-4"
              : "translate-x-5"
            : "translate-x-1"
        )}
      />
    </button>
  );
}

export function PreferenceChannelEditor({
  title,
  description,
  notificationOff,
  channels,
  onSaveChannels,
  onToggleNotificationOff,
  compact = false,
  hideHeader = false,
}: {
  title: string;
  description?: string;
  notificationOff: boolean;
  channels: PreferenceChannelState;
  onSaveChannels: (channels: PreferenceChannelState) => void | Promise<void>;
  onToggleNotificationOff: (notificationOff: boolean) => void | Promise<void>;
  compact?: boolean;
  hideHeader?: boolean;
}) {
  const [draftChannels, setDraftChannels] = useState(channels);

  useEffect(() => {
    setDraftChannels(channels);
  }, [channels]);

  const isDirty = useMemo(
    () => !areChannelStatesEqual(channels, draftChannels),
    [channels, draftChannels]
  );

  function toggleChannel(channel: PreferenceChannel) {
    setDraftChannels((current) => ({
      ...current,
      [channel]: !current[channel],
    }));
  }

  return (
    <div className="space-y-2">
      {!hideHeader ? (
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <p className={cn("font-semibold text-foreground", compact ? "text-sm" : "text-base")}>
                {title}
              </p>
              <div className="shrink-0">
                <PreferenceOffSwitch
                  checked={!notificationOff}
                  onChange={() => void onToggleNotificationOff(!notificationOff)}
                  compact={compact}
                />
              </div>
            </div>
            {description ? (
              <p className="text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        {CHANNEL_OPTIONS.map(({ key, label, shortLabel, icon: Icon }) => {
          const isActive = draftChannels[key];

          return (
            <button
              key={key}
              type="button"
              onClick={() => toggleChannel(key)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition",
                compact && "px-2.5 py-1.5 text-xs",
                isActive
                  ? "border-primary/20 bg-primary-light text-primary"
                  : "border-slate-200 bg-slate-100 text-slate-500 hover:bg-slate-200"
              )}
            >
              <Icon className={cn(compact ? "h-3.5 w-3.5" : "h-4 w-4")} />
              <span>{compact ? shortLabel : label}</span>
            </button>
          );
        })}
        <Button
          type="button"
          size={compact ? "sm" : "default"}
          disabled={!isDirty}
          className={cn(
            "shrink-0 rounded-full",
            compact ? "h-7 w-7 px-0" : "h-8 w-8 px-0"
          )}
          onClick={() => void onSaveChannels(draftChannels)}
          aria-label="Save preference changes"
          title="Save preference changes"
        >
          <Check className={cn(compact ? "h-4 w-4" : "h-[18px] w-[18px]")} />
        </Button>
      </div>
    </div>
  );
}
