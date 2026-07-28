"use client";

import { Bell, ChevronDown } from "lucide-react";
import {
  PreferenceChannelEditor,
  PreferenceOffSwitch,
} from "@/features/components/preferences/PreferenceChannelEditor";
import {
  PreferenceChannelState,
  PreferenceGroup,
} from "@/features/types/preference.types";
import { cn } from "@/features/utils/cn";

export function PreferenceGroupCard({
  group,
  topicsExpanded,
  onToggleTopics,
  onSaveGroupChannels,
  onToggleGroupNotificationOff,
  onSaveTopicChannels,
  onToggleTopicNotificationOff,
}: {
  group: PreferenceGroup;
  topicsExpanded: boolean;
  onToggleTopics: () => void;
  onSaveGroupChannels: (channels: PreferenceChannelState) => void | Promise<void>;
  onToggleGroupNotificationOff: (notificationOff: boolean) => void | Promise<void>;
  onSaveTopicChannels: (
    topicId: string,
    channels: PreferenceChannelState
  ) => void | Promise<void>;
  onToggleTopicNotificationOff: (
    topicId: string,
    notificationOff: boolean
  ) => void | Promise<void>;
}) {
  const hasTopics = group.topics.length > 0;

  return (
    <section className="border-b border-slate-200 last:border-b-0">
      <div className="px-5 py-5 sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <Bell className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-base font-semibold text-foreground">{group.name}</p>
                {group.description ? (
                  <p className="text-sm leading-5 text-muted-foreground">{group.description}</p>
                ) : null}
                <p className="text-xs font-medium text-muted-foreground">
                  {group.topics.length} topic{group.topics.length === 1 ? "" : "s"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <span className="hidden text-sm font-medium text-muted-foreground sm:inline">
              {group.isNotificationOff ? "Off" : "On"}
            </span>
            <PreferenceOffSwitch
              checked={!group.isNotificationOff}
              onChange={() =>
                void onToggleGroupNotificationOff(!group.isNotificationOff)
              }
            />
          </div>
        </div>

        <div className="ml-0 mt-4 sm:ml-12">
          <PreferenceChannelEditor
            title={group.name}
            notificationOff={group.isNotificationOff}
            channels={group.channels}
            onSaveChannels={onSaveGroupChannels}
            onToggleNotificationOff={onToggleGroupNotificationOff}
            hideHeader
          />
        </div>

        {hasTopics ? (
          <button
            type="button"
            onClick={onToggleTopics}
            className="ml-0 mt-4 inline-flex items-center gap-1 rounded-md px-0 text-sm font-semibold text-primary transition hover:text-primary-hover sm:ml-12"
          >
            Manage topic preferences
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                topicsExpanded && "rotate-180"
              )}
            />
          </button>
        ) : null}
      </div>

      {hasTopics && topicsExpanded ? (
        <div className="border-t border-slate-200 bg-slate-50/70">
          {group.topics.map((topic) => (
            <div
              key={topic.id}
              className="border-b border-slate-200 px-5 py-4 last:border-b-0 sm:px-6"
            >
              <div className="sm:ml-12">
                <PreferenceChannelEditor
                  title={topic.name}
                  description={topic.description}
                  notificationOff={topic.isNotificationOff}
                  channels={topic.channels}
                  onSaveChannels={(channels) => onSaveTopicChannels(topic.id, channels)}
                  onToggleNotificationOff={(notificationOff) =>
                    onToggleTopicNotificationOff(topic.id, notificationOff)
                  }
                  compact
                />
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
