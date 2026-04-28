import { settingsModel } from "./settings.models";

export const settingsService = {
  async getSettings() {
    let settings = await settingsModel.findOne();
    if (!settings) {
      settings = await settingsModel.create({});
    }
    return settings;
  },

  async updateSettings(data: any) {
    let settings = await settingsModel.findOne();
    if (!settings) {
      return settingsModel.create(data);
    }
    return settingsModel.findByIdAndUpdate(settings._id, data, { returnDocument: "after" });
  }
};
