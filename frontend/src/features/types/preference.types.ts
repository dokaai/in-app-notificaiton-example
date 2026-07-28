export enum PreferenceChannel {
  EMAIL = "email",
  IN_APP = "inApp",
  SMS = "sms",
  PUSH = "push",
  WHATS_APP = "whatsApp",
}

export interface PreferenceChannelState {
  email: boolean;
  inApp: boolean;
  sms: boolean;
  push: boolean;
  whatsApp: boolean;
}

export interface PreferenceTopic {
  id: string;
  name: string;
  description?: string;
  isNotificationOff: boolean;
  channels: PreferenceChannelState;
}

export interface PreferenceGroup {
  id: string;
  name: string;
  description?: string;
  isNotificationOff: boolean;
  channels: PreferenceChannelState;
  topics: PreferenceTopic[];
}
