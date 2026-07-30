"use client";

import type {
  CustomerPreferenceGroup,
} from "@backend/types";
import { PreferenceChannelKey } from "@backend/types";
import type {
  PreferenceChannelState,
  PreferenceChannel,
  PreferenceGroup as UiPreferenceGroup,
  PreferenceTopic as UiPreferenceTopic,
} from "@/features/types/preference.types";
import { PreferenceChannel as UiPreferenceChannel } from "@/features/types/preference.types";

const API_TO_UI_CHANNEL_KEYS: Partial<Record<PreferenceChannelKey, PreferenceChannel>> = {
  [PreferenceChannelKey.EMAIL]: UiPreferenceChannel.EMAIL,
  [PreferenceChannelKey.IN_APP]: UiPreferenceChannel.IN_APP,
  [PreferenceChannelKey.SMS]: UiPreferenceChannel.SMS,
  [PreferenceChannelKey.CHAT]: UiPreferenceChannel.CHAT,
  [PreferenceChannelKey.PUSH]: UiPreferenceChannel.PUSH,
  [PreferenceChannelKey.WHATS_APP]: UiPreferenceChannel.WHATS_APP,
};

const UI_TO_API_CHANNEL_KEYS: Record<PreferenceChannel, PreferenceChannelKey> = {
  [UiPreferenceChannel.EMAIL]: PreferenceChannelKey.EMAIL,
  [UiPreferenceChannel.IN_APP]: PreferenceChannelKey.IN_APP,
  [UiPreferenceChannel.SMS]: PreferenceChannelKey.SMS,
  [UiPreferenceChannel.CHAT]: PreferenceChannelKey.CHAT,
  [UiPreferenceChannel.PUSH]: PreferenceChannelKey.PUSH,
  [UiPreferenceChannel.WHATS_APP]: PreferenceChannelKey.WHATS_APP,
};

function getPreferenceChannelKeys(
  preference?: Partial<Record<PreferenceChannelKey, boolean>>
) {
  if (!preference) {
    return [];
  }

  return Object.values(PreferenceChannelKey).flatMap((apiKey) =>
    Object.prototype.hasOwnProperty.call(preference, apiKey) &&
    API_TO_UI_CHANNEL_KEYS[apiKey]
      ? [API_TO_UI_CHANNEL_KEYS[apiKey]]
      : []
  );
}

export function mapPreferenceChannelState(
  preference?: Partial<Record<PreferenceChannelKey, boolean>>
) {
  return getPreferenceChannelKeys(preference).reduce<PreferenceChannelState>(
    (channels, uiKey) => ({
      ...channels,
      [uiKey]: Boolean(preference?.[UI_TO_API_CHANNEL_KEYS[uiKey]]),
    }),
    {}
  );
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
    channelKeys: getPreferenceChannelKeys(group.groupChannelLevelPreference),
    topics: group.topic.map((topic) => ({
      id: topic.topicId,
      name: topic.topicName,
      description: topic.topicDescription,
      isNotificationOff: Boolean(topic.isTopicNotificationOff),
      channels: mapPreferenceChannelState(topic.topicChannelLevelPreference),
      channelKeys: getPreferenceChannelKeys(topic.topicChannelLevelPreference),
    })),
  }));
}

export function mapUiChannelsToPreferencePayload(
  channels: PreferenceChannelState,
  channelKeys: PreferenceChannel[]
) {
  return channelKeys.reduce<Partial<Record<PreferenceChannelKey, boolean>>>(
    (payload, uiKey) => ({
      ...payload,
      [UI_TO_API_CHANNEL_KEYS[uiKey]]: Boolean(channels[uiKey]),
    }),
    {}
  );
}

export function buildSaveGroupPreferencePayload(group: UiPreferenceGroup) {
  return {
    isGroupNotificationOff: Boolean(group.isNotificationOff),
    groupChannelLevelPreference: mapUiChannelsToPreferencePayload(
      group.channels,
      group.channelKeys
    ),
  };
}

export function buildSaveTopicPreferencePayload(topic: UiPreferenceTopic) {
  return {
    isTopicNotificationOff: Boolean(topic.isNotificationOff),
    topicChannelLevelPreference: mapUiChannelsToPreferencePayload(
      topic.channels,
      topic.channelKeys
    ),
  };
}
