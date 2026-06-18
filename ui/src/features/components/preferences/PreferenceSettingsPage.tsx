"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PreferenceGroupCard } from "@/features/components/preferences/PreferenceGroupCard";
import { PreferenceSettingsSkeleton } from "@/features/components/preferences/PreferenceSettingsSkeleton";
import { PageHeader } from "@/features/components/shared/PageHeader";
import { useToast } from "@/features/hooks/useToast";
import { useInAppSdkClient } from "@/features/providers/InAppSdkHostProvider";
import { MOCK_PREFERENCE_GROUPS } from "@/features/constants/mockPreferences";
import {
  PreferenceChannelState,
  PreferenceGroup,
} from "@/features/types/preference.types";
import { getApiErrorMessage, getApiSuccessMessage } from "@/lib/api-feedback";
import {
  buildSaveGroupPreferencePayload,
  buildSaveTopicPreferencePayload,
  fetchHostPreferences,
  mapSdkPreferencesToUiGroups,
} from "@/lib/inapp-sdk";

export function PreferenceSettingsPage() {
  const client = useInAppSdkClient();
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [expandedGroupIds, setExpandedGroupIds] = useState<string[]>([]);
  const [groups, setGroups] = useState<PreferenceGroup[]>(MOCK_PREFERENCE_GROUPS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    async function loadPreferences() {
      setIsLoading(true);

      try {
        const response = await fetchHostPreferences(client);

        if (isCancelled) {
          return;
        }

        const mappedGroups = mapSdkPreferencesToUiGroups(response.preferences);
        setGroups(mappedGroups);
        setExpandedGroupIds([]);
      } catch (error) {
        if (isCancelled) {
          return;
        }

        toast.error(
          getApiErrorMessage(error, "Unable to fetch customer preferences.")
        );
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadPreferences();

    return () => {
      isCancelled = true;
    };
  }, [client, toast]);

  const filteredGroups = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return groups;
    }

    return groups.filter((group) => {
      const matchesGroup =
        group.name.toLowerCase().includes(normalizedSearch) ||
        group.description?.toLowerCase().includes(normalizedSearch);
      const matchesTopic = group.topics.some(
        (topic) =>
          topic.name.toLowerCase().includes(normalizedSearch) ||
          topic.description?.toLowerCase().includes(normalizedSearch)
      );

      return Boolean(matchesGroup || matchesTopic);
    });
  }, [groups, search]);

  function toggleExpandedGroup(groupId: string) {
    setExpandedGroupIds((current) =>
      current.includes(groupId)
        ? current.filter((id) => id !== groupId)
        : [...current, groupId]
    );
  }

  async function saveGroupChannels(
    groupId: string,
    channels: PreferenceChannelState
  ) {
    const targetGroup = groups.find((group) => group.id === groupId);

    if (!targetGroup) {
      return;
    }

    try {
      const response = await client.preferences.saveGroupPreference({
        groupId,
        body: buildSaveGroupPreferencePayload({
          ...targetGroup,
          channels,
          isNotificationOff: targetGroup.isNotificationOff,
        }),
      });

      setGroups((current) =>
        current.map((group) =>
          group.id === groupId
            ? {
                ...group,
                channels,
              }
            : group
        )
      );

      toast.success(
        getApiSuccessMessage(response, "Notification group updated successfully")
      );
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Unable to update notification group.")
      );
    }
  }

  async function saveTopicChannels(
    groupId: string,
    topicId: string,
    channels: PreferenceChannelState
  ) {
    const targetGroup = groups.find((group) => group.id === groupId);
    const targetTopic = targetGroup?.topics.find((topic) => topic.id === topicId);

    if (!targetTopic) {
      return;
    }

    try {
      const response = await client.preferences.saveTopicPreference({
        topicId,
        body: buildSaveTopicPreferencePayload({
          ...targetTopic,
          channels,
          isNotificationOff: targetTopic.isNotificationOff,
        }),
      });

      setGroups((current) =>
        current.map((group) =>
          group.id === groupId
            ? {
                ...group,
                topics: group.topics.map((topic) =>
                  topic.id === topicId
                    ? {
                        ...topic,
                        channels,
                      }
                    : topic
                ),
              }
            : group
        )
      );

      toast.success(
        getApiSuccessMessage(response, "Notification topic updated successfully")
      );
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Unable to update notification topic.")
      );
    }
  }

  async function toggleGroupNotificationOff(groupId: string, notificationOff: boolean) {
    const targetGroup = groups.find((group) => group.id === groupId);

    if (!targetGroup) {
      return;
    }

    try {
      const response = await client.preferences.saveGroupPreference({
        groupId,
        body: buildSaveGroupPreferencePayload({
          ...targetGroup,
          isNotificationOff: notificationOff,
        }),
      });

      setGroups((current) =>
        current.map((group) =>
          group.id === groupId
            ? {
                ...group,
                isNotificationOff: notificationOff,
              }
            : group
        )
      );

      toast.success(
        getApiSuccessMessage(response, "Notification group updated successfully")
      );
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Unable to update notification group.")
      );
    }
  }

  async function toggleTopicNotificationOff(
    groupId: string,
    topicId: string,
    notificationOff: boolean
  ) {
    const targetGroup = groups.find((group) => group.id === groupId);
    const targetTopic = targetGroup?.topics.find((topic) => topic.id === topicId);

    if (!targetTopic) {
      return;
    }

    try {
      const response = await client.preferences.saveTopicPreference({
        topicId,
        body: buildSaveTopicPreferencePayload({
          ...targetTopic,
          isNotificationOff: notificationOff,
        }),
      });

      setGroups((current) =>
        current.map((group) =>
          group.id === groupId
            ? {
                ...group,
                topics: group.topics.map((topic) =>
                  topic.id === topicId
                    ? {
                        ...topic,
                        isNotificationOff: notificationOff,
                      }
                    : topic
                ),
              }
            : group
        )
      );

      toast.success(
        getApiSuccessMessage(response, "Notification topic updated successfully")
      );
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Unable to update notification topic.")
      );
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Preference Settings"
        description="Control which channels are enabled for each group and topic before notifications are delivered."
      />

      {isLoading ? (
        <PreferenceSettingsSkeleton />
      ) : null}

      {!isLoading && filteredGroups.length === 0 ? (
        <Card className="rounded-3xl border-dashed border-slate-300 shadow-none">
          <CardContent className="py-12 text-center">
            <p className="text-base font-medium text-foreground">No matching preferences found</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Try a different group or topic keyword.
            </p>
          </CardContent>
        </Card>
      ) : !isLoading ? (
        <div className="space-y-4">
          {filteredGroups.map((group) => (
            <PreferenceGroupCard
              key={group.id}
              group={group}
              topicsExpanded={expandedGroupIds.includes(group.id)}
              onToggleTopics={() => toggleExpandedGroup(group.id)}
              onSaveGroupChannels={(channels) => saveGroupChannels(group.id, channels)}
              onToggleGroupNotificationOff={(notificationOff) =>
                toggleGroupNotificationOff(group.id, notificationOff)
              }
              onSaveTopicChannels={(topicId, channels) =>
                saveTopicChannels(group.id, topicId, channels)
              }
              onToggleTopicNotificationOff={(topicId, notificationOff) =>
                toggleTopicNotificationOff(group.id, topicId, notificationOff)
              }
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
