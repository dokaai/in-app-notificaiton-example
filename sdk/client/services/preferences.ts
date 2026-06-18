import {
  CustomerPreferenceGroup,
  GetCustomerPreferencesParams,
  InAppNotificationTransport,
  SaveGroupPreferenceParams,
  SaveTopicPreferenceParams,
} from "@/shared/types";

export class PreferencesService {
  constructor(private readonly transport: InAppNotificationTransport) {}

  async getAll({
    projectId,
  }: GetCustomerPreferencesParams) {
    return this.transport.getCustomerPreferences({
      projectId,
    }) as Promise<CustomerPreferenceGroup[] | unknown>;
  }

  async saveGroupPreference({
    groupId,
    body,
  }: SaveGroupPreferenceParams) {
    return this.transport.saveGroupPreference({
      groupId,
      body,
    });
  }

  async saveTopicPreference({
    topicId,
    body,
  }: SaveTopicPreferenceParams) {
    return this.transport.saveTopicPreference({
      topicId,
      body,
    });
  }
}
