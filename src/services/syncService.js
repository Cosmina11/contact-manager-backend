const Contact = require("../models/Contact");
const User = require("../models/User");
const googlePeopleService = require("./googlePeopleService");

class SyncService {
  async syncContacts(userId) {
    try {
      const user = await User.findById(userId);
      if (!user.googleAccessToken) {
        throw new Error("User not connected to Google");
      }

      // Set credentials for Google People API
      googlePeopleService.setCredentials({
        access_token: user.googleAccessToken,
        refresh_token: user.googleRefreshToken,
      });

      // Get Google contacts
      const googleContacts = await googlePeopleService.getContacts();

      // Get local contacts
      const localContacts = await Contact.find({ userId });

      // Sync Google -> Local
      for (const googleContact of googleContacts) {
        const names = googleContact.names?.[0] || {};
        const emails = googleContact.emailAddresses?.[0] || {};
        const phones = googleContact.phoneNumbers?.[0] || {};

        console.log("googleContact", googleContact);
        if (names.givenName && names.familyName) {
          await Contact.findOneAndUpdate(
            {
              firstName: names.givenName,
              lastName: names.familyName,
            },
            {
              firstName: names.givenName || "",
              lastName: names.familyName || "",
              email: emails.value || "",
              phone: phones.value || "",
              lastSyncedAt: new Date(),
              userId: userId,
            },
            { upsert: true }
          );
        }
      }

      // Sync Local -> Google
      for (const localContact of localContacts) {
        if (!localContact.googleResourceName) {
          // Create new contact in Google
          const googleContact = await googlePeopleService.createContact({
            firstName: localContact.firstName,
            lastName: localContact.lastName,
            email: localContact.email,
            phone: localContact.phone,
          });

          localContact.googleResourceName = googleContact.resourceName;
          localContact.lastSyncedAt = new Date();
          await localContact.save();
        }
      }

      // Update user's last sync time
      user.lastSync = new Date();
      await user.save();

      return true;
    } catch (error) {
      console.error("Sync error:", error);
      throw error;
    }
  }
}

module.exports = new SyncService();
