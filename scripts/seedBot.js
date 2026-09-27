const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

// Load environment variables from backend/.env or root .env
dotenv.config({ path: path.resolve(__dirname, "../backend/.env") });
if (!process.env.MONGO_URI) {
  dotenv.config({ path: path.resolve(__dirname, "../.env") });
}

const User = require("../backend/Models/userModel");

const seedBot = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error("MONGO_URI not found in environment variables.");
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for seeding bot...");

    const BOT_NAME = "Orbit AI";
    const BOT_EMAIL = "ai-bot@orbit.internal";
    const BOT_PIC = "/orbit_favicon-removebg-preview_192.png";

    // Idempotent check & enforcement
    const existingBot = await User.findOne({
      $or: [{ email: BOT_EMAIL }, { isBot: true }],
    });

    if (existingBot) {
      let updated = false;
      if (!existingBot.isBot) {
        existingBot.isBot = true;
        updated = true;
      }
      if (existingBot.pic !== BOT_PIC) {
        existingBot.pic = BOT_PIC;
        updated = true;
      }
      if (updated) {
        await existingBot.save();
        console.log(`Enforced bot properties (pic: ${BOT_PIC}, isBot: true)`);
      }
      console.log(`Bot user verified: ${existingBot.name} (${existingBot.email}) [ID: ${existingBot._id}]`);
      await mongoose.disconnect();
      process.exit(0);
    }

    const botUser = await User.create({
      name: BOT_NAME,
      email: BOT_EMAIL,
      password: "orbit_ai_bot_secret_password_123",
      isBot: true,
      pic: BOT_PIC,
      bio: "Official AI Assistant for Orbit Chat",
    });

    console.log(`Bot user created successfully: ${botUser.name} (${botUser.email}) [ID: ${botUser._id}]`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error seeding bot user:", error);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
};

seedBot();
