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
    customerId,
  }: GetCustomerPreferencesParams) {
    return this.transport.getCustomerPreferences({
      projectId,
      customerId,
    }) as Promise<CustomerPreferenceGroup[] | unknown>;
  }

  async saveGroupPreference({
    projectId,
    customerId,
    groupId,
    body,
  }: SaveGroupPreferenceParams) {
    return this.transport.saveGroupPreference({
      projectId,
      customerId,
      groupId,
      body,
    });
  }

  async saveTopicPreference({
    projectId,
    customerId,
    topicId,
    body,
  }: SaveTopicPreferenceParams) {
    return this.transport.saveTopicPreference({
      projectId,
      customerId,
      topicId,
      body,
    });
  }
}
