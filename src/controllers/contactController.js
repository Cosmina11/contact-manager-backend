const Contact = require("../models/Contact");
const googlePeopleService = require("../services/googlePeopleService");

exports.getAllContacts = async (req, res) => {
  try {
    console.log("Getting contacts for user ID:", req.user.userId);

    // Verificăm dacă userId este valid
    if (!req.user.userId) {
      throw new Error("User ID is missing");
    }

    // Căutăm contactele
    const contacts = await Contact.find({ userId: req.user.userId });

    // Verificăm dacă contacts este un array
    if (!Array.isArray(contacts)) {
      console.error("Contacts is not an array:", contacts);
      return res.status(500).json({
        message: "Invalid response format",
        contacts: contacts,
      });
    }

    console.log("contacts", contacts);
    res.json(contacts);
  } catch (error) {
    console.error("Error in getAllContacts:", error);
    res.status(500).json({
      message: "Error fetching contacts",
      error: error.message,
      stack: error.stack,
    });
  }
};

exports.createContact = async (req, res) => {
  try {
    console.log("Creating contact. User ID:", req.user.userId);
    console.log("Request body:", req.body);

    // Validăm datele de intrare
    if (!req.body.firstName || !req.body.lastName) {
      return res.status(400).json({
        message: "First name and last name are required",
      });
    }

    const contactData = {
      ...req.body,
      userId: req.user.userId,
    };

    console.log("Contact data to save:", contactData);

    const contact = new Contact(contactData);
    const savedContact = await contact.save();

    console.log("Saved contact:", savedContact);

    res.status(201).json(savedContact);
  } catch (error) {
    console.error("Error creating contact:", error);
    res.status(400).json({
      message: "Error creating contact",
      error: error.message,
      stack: error.stack,
    });
  }
};

exports.updateContact = async (req, res) => {
  try {
    console.log("Updating contact:", req.params.id);
    console.log("Update data:", req.body);

    const contact = await Contact.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.userId, // Asigură că contactul aparține utilizatorului
      },
      req.body,
      { new: true } // Returnează documentul actualizat
    );

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    console.log("Updated contact:", contact);
    res.json(contact);
  } catch (error) {
    console.error("Error updating contact:", error);
    res.status(400).json({
      message: "Error updating contact",
      error: error.message,
    });
  }
};

exports.deleteContact = async (req, res) => {
  try {
    console.log("Deleting contact:", req.params.id);

    const contact = await Contact.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId, // Asigură că contactul aparține utilizatorului
    });

    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    console.log("Deleted contact:", contact);
    res.json({ message: "Contact deleted successfully" });
  } catch (error) {
    console.error("Error deleting contact:", error);
    res.status(400).json({
      message: "Error deleting contact",
      error: error.message,
    });
  }
};
