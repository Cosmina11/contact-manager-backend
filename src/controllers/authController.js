const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URL
);

exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Verifică dacă utilizatorul există deja
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Creează utilizator nou
    const user = new User({ username, password });
    await user.save();

    // Generează token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Găsește utilizatorul
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Verifică parola
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generează token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.googleAuth = async (req, res) => {
  try {
    const url = googleClient.generateAuthUrl({
      access_type: "offline",
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/contacts",
      ],
      redirect_uri: process.env.GOOGLE_REDIRECT_URL,
    });
    console.log("Redirect URL:", process.env.GOOGLE_REDIRECT_URL);
    res.json({ url });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.googleCallback = async (req, res) => {
  try {
    const { code } = req.query;
    const { tokens } = await googleClient.getToken(code);

    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { sub: googleId, email } = ticket.getPayload();

    let user = await User.findOne({ googleId });
    if (!user) {
      user = new User({
        username: email,
        googleId,
        googleEmail: email,
        googleAccessToken: tokens.access_token,
        googleRefreshToken: tokens.refresh_token,
      });
      await user.save();
    } else {
      user.googleAccessToken = tokens.access_token;
      if (tokens.refresh_token) {
        user.googleRefreshToken = tokens.refresh_token;
      }
      await user.save();
    }

    const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    // Pentru dezvoltare, returnăm direct JSON
    res.json({
      success: true,
      token: jwtToken,
      user: {
        id: user._id,
        email: user.googleEmail,
      },
    });
  } catch (error) {
    console.error("Google callback error:", error);
    res.status(500).json({
      success: false,
      message: "Authentication failed",
      error: error.message,
    });
  }
};
