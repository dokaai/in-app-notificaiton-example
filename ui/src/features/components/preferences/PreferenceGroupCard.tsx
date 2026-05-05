"use client";

import { ChevronDown, Layers3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/features/utils/cn";
import {
  PreferenceChannelState,
  PreferenceGroup,
} from "@/features/types/preference.types";
import {
  PreferenceChannelEditor,
  PreferenceOffSwitch,
} from "@/features/components/preferences/PreferenceChannelEditor";

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
    <Card className="overflow-hidden rounded-3xl border-slate-200 shadow-sm">
      <CardContent className="p-0">
        <div className="px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-light text-primary">
                  <Layers3 className="h-5 w-5" />
                </div>
                <div className="flex min-h-9 flex-col justify-between">
                  <div className="flex items-center gap-2">
                    <p className="text-base font-semibold text-foreground">{group.name}</p>
                    <PreferenceOffSwitch
                      checked={!group.isNotificationOff}
                      onChange={() =>
                        void onToggleGroupNotificationOff(!group.isNotificationOff)
                      }
                    />
                  </div>
                  <p className="text-sm text-muted-foreground -mt-0.5">
                    {group.topics.length} Topic{group.topics.length === 1 ? "" : "s"}
                  </p>
                </div>
              </div>

              {group.description ? (
                <p className="text-sm text-muted-foreground">{group.description}</p>
              ) : null}

              <div className="pt-1">
                <PreferenceChannelEditor
                  title={group.name}
                  notificationOff={group.isNotificationOff}
                  channels={group.channels}
                  onSaveChannels={onSaveGroupChannels}
                  onToggleNotificationOff={onToggleGroupNotificationOff}
                  hideHeader
                />
              </div>
            </div>

            {hasTopics ? (
              <button
                type="button"
                onClick={onToggleTopics}
                className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-foreground transition hover:bg-slate-50"
              >
                Manage Topics
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    topicsExpanded && "rotate-180"
                  )}
                />
              </button>
            ) : null}
          </div>
        </div>

        {hasTopics && topicsExpanded ? (
          <div className="border-t border-slate-200 bg-slate-50/60 px-5 py-5 sm:px-6">
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Topics</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Update topic-level channels directly from the rows below.
                </p>
              </div>

              <div className="space-y-3">
                {group.topics.map((topic) => (
                  <div
                    key={topic.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    <div className="space-y-2">
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
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
