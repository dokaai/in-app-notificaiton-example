export enum PreferenceChannelKey {
  IN_APP = "in_app",
  EMAIL = "email",
  SMS = "sms",
  CHAT = "chat",
  PUSH = "push",
  WHATS_APP = "whatsApp",
}

export interface PreferenceChannelLevelPreference {
  [PreferenceChannelKey.IN_APP]: boolean;
  [PreferenceChannelKey.EMAIL]: boolean;
  [PreferenceChannelKey.SMS]: boolean;
  [PreferenceChannelKey.CHAT]: boolean;
  [PreferenceChannelKey.PUSH]: boolean;
  [PreferenceChannelKey.WHATS_APP]: boolean;
}

export interface CustomerPreferenceTopic {
  topicId: string;
  topicName: string;
  topicDescription?: string;
  isTopicNotificationOff: boolean;
  topicChannelLevelPreference: PreferenceChannelLevelPreference;
}

export interface CustomerPreferenceGroup {
  groupId: string;
  groupName: string;
  groupDescription?: string;
  isGroupNotificationOff: boolean;
  groupChannelLevelPreference: PreferenceChannelLevelPreference;
  topic: CustomerPreferenceTopic[];
}

export interface GetCustomerPreferencesParams {
  projectId?: string;
}

export interface SaveGroupPreferenceBody {
  isGroupNotificationOff: boolean;
  groupChannelLevelPreference: Partial<PreferenceChannelLevelPreference>;
}

export interface SaveTopicPreferenceBody {
  isTopicNotificationOff: boolean;
  topicChannelLevelPreference: Partial<PreferenceChannelLevelPreference>;
}

export interface SaveGroupPreferenceParams {
  groupId: string;
  body: SaveGroupPreferenceBody;
}

export interface SaveTopicPreferenceParams {
  topicId: string;
  body: SaveTopicPreferenceBody;
}
