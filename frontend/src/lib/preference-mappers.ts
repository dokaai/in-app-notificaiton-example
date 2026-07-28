"use client";

import type {
  CustomerPreferenceGroup,
  PreferenceChannelKey,
} from "@backend/types";
import type {
  PreferenceChannelState,
  PreferenceGroup as UiPreferenceGroup,
  PreferenceTopic as UiPreferenceTopic,
} from "@/features/types/preference.types";

export function mapPreferenceChannelState(
  preference: Record<PreferenceChannelKey, boolean>
) {
  return {
    email: Boolean(preference.email),
    inApp: Boolean(preference.in_app),
    sms: Boolean(preference.sms),
    push: Boolean(preference.push),
    whatsApp: Boolean(preference.whatsApp),
  };
}

export function mapPreferencesToUiGroups(
  groups: CustomerPreferenceGroup[]
) {
  return groups.map((group) => ({
    id: group.groupId,
    name: group.groupName,
    description: group.groupDescription,
    isNotificationOff: Boolean(group.isGroupNotificationOff),
    channels: mapPreferenceChannelState(group.groupChannelLevelPreference),
    topics: group.topic.map((topic) => ({
      id: topic.topicId,
      name: topic.topicName,
      description: topic.topicDescription,
      isNotificationOff: Boolean(topic.isTopicNotificationOff),
      channels: mapPreferenceChannelState(topic.topicChannelLevelPreference),
    })),
  }));
}

export function mapUiChannelsToPreferencePayload(
  channels: PreferenceChannelState
) {
  return {
    email: Boolean(channels.email),
    in_app: Boolean(channels.inApp),
    sms: Boolean(channels.sms),
    push: Boolean(channels.push),
    whatsApp: Boolean(channels.whatsApp),
  };
}

export function buildSaveGroupPreferencePayload(group: UiPreferenceGroup) {
  return {
    isGroupNotificationOff: Boolean(group.isNotificationOff),
    groupChannelLevelPreference: mapUiChannelsToPreferencePayload(group.channels),
  };
}

export function buildSaveTopicPreferencePayload(topic: UiPreferenceTopic) {
  return {
    isTopicNotificationOff: Boolean(topic.isNotificationOff),
    topicChannelLevelPreference: mapUiChannelsToPreferencePayload(topic.channels),
  };
}
