const { google } = require("googleapis");
const { OAuth2 } = google.auth;

class GooglePeopleService {
  constructor() {
    this.oauth2Client = new OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URL
    );

    this.peopleService = google.people({
      version: "v1",
      auth: this.oauth2Client,
    });
  }

  setCredentials(tokens) {
    this.oauth2Client.setCredentials(tokens);
  }

  async getContacts() {
    try {
      const response = await this.peopleService.people.connections.list({
        resourceName: "people/me",
        pageSize: 100,
        personFields: "names,emailAddresses,phoneNumbers,photos",
      });
      return response.data.connections || [];
    } catch (error) {
      console.error("Error fetching contacts:", error);
      throw error;
    }
  }

  async createContact(contactData) {
    try {
      const response = await this.peopleService.people.createContact({
        requestBody: {
          names: [
            {
              givenName: contactData.firstName,
              familyName: contactData.lastName,
            },
          ],
          emailAddresses: [
            {
              value: contactData.email,
            },
          ],
          phoneNumbers: [
            {
              value: contactData.phone,
            },
          ],
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error creating contact:", error);
      throw error;
    }
  }

  async updateContact(resourceName, contactData) {
    try {
      const response = await this.peopleService.people.updateContact({
        resourceName: resourceName,
        updatePersonFields: "names,emailAddresses,phoneNumbers",
        requestBody: {
          names: [
            {
              givenName: contactData.firstName,
              familyName: contactData.lastName,
            },
          ],
          emailAddresses: [
            {
              value: contactData.email,
            },
          ],
          phoneNumbers: [
            {
              value: contactData.phone,
            },
          ],
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error updating contact:", error);
      throw error;
    }
  }

  async deleteContact(resourceName) {
    try {
      await this.peopleService.people.deleteContact({
        resourceName: resourceName,
      });
      return true;
    } catch (error) {
      console.error("Error deleting contact:", error);
      throw error;
    }
  }
}

module.exports = new GooglePeopleService();
