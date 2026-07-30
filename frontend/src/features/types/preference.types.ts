export enum PreferenceChannel {
  EMAIL = "email",
  IN_APP = "inApp",
  SMS = "sms",
  CHAT = "chat",
  PUSH = "push",
  WHATS_APP = "whatsApp",
}

export type PreferenceChannelState = Partial<Record<PreferenceChannel, boolean>>;

export interface PreferenceTopic {
  id: string;
  name: string;
  description?: string;
  isNotificationOff: boolean;
  channels: PreferenceChannelState;
  channelKeys: PreferenceChannel[];
}

export interface PreferenceGroup {
  id: string;
  name: string;
  description?: string;
  isNotificationOff: boolean;
  channels: PreferenceChannelState;
  channelKeys: PreferenceChannel[];
  topics: PreferenceTopic[];
}
