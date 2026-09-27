const asyncHandler = require("express-async-handler");
const Message = require("../Models/messageModel");
const User = require("../Models/userModel");
const Chat = require("../Models/chatModel");
const { getAIReply } = require("../services/aiService");

//@description     Get all Messages
//@route           GET /api/message/:chatId
//@access          Protected
const allMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");
    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//@description     Create New Message
//@route           POST /api/message/
//@access          Protected
const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  const isImage = content && (content.match(/\.(jpeg|jpg|gif|png)$/i) || content.includes("res.cloudinary.com"));
  const messageType = isImage ? "image" : "text";

  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
    messageType: messageType,
  };

  try {
    var message = await Message.create(newMessage);

    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email isBot",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    // Broadcast to users in the chat room via sockets
    const io = req.app.get("socketio");
    if (io) {
      message.chat.users.forEach((userItem) => {
        if (userItem._id.toString() === req.user._id.toString()) return;
        io.to(userItem._id.toString()).emit("message received", message);
      });
    }

    res.json(message);

    // Check if the chat's other participant is the bot
    const botUser = message.chat.users.find(
      (userItem) => (userItem.isBot || userItem.email === "ai-bot@orbit.internal") && userItem._id.toString() !== req.user._id.toString()
    );

    console.log("Bot user detection triggered. botUser found:", botUser ? `${botUser.name} (${botUser._id})` : "None");

    if (botUser) {
      (async () => {
        try {
          // Fetch last 10 messages for context
          const last10Messages = await Message.find({ chat: chatId })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate("sender", "isBot");

          const chronologicalMessages = last10Messages.reverse();

          const formattedMessages = [
            {
              role: "system",
              content: "You are a helpful assistant inside a chat app called Orbit. Keep replies concise.",
            },
          ];

          chronologicalMessages.forEach((msg) => {
            const senderId = msg.sender?._id ? msg.sender._id.toString() : msg.sender?.toString();
            const isBotSender =
              senderId === botUser._id.toString() || (msg.sender && msg.sender.isBot);

            formattedMessages.push({
              role: isBotSender ? "assistant" : "user",
              content: msg.content || "",
            });
          });

          console.log("Calling Gemini for bot reply with messages count:", formattedMessages.length);

          let botReplyContent;
          try {
            botReplyContent = await getAIReply(formattedMessages);
            console.log("Gemini reply received successfully:", botReplyContent);
          } catch (aiError) {
            console.error("AI service error in messageController:", aiError);
            botReplyContent = "Sorry, I couldn't process that right now.";
          }

          var newBotMessage = {
            sender: botUser._id,
            content: botReplyContent,
            chat: chatId,
            messageType: "text",
          };

          var botMessage = await Message.create(newBotMessage);
          botMessage = await botMessage.populate("sender", "name pic");
          botMessage = await botMessage.populate("chat");
          botMessage = await User.populate(botMessage, {
            path: "chat.users",
            select: "name pic email isBot",
          });

          await Chat.findByIdAndUpdate(chatId, { latestMessage: botMessage });

          if (io) {
            botMessage.chat.users.forEach((userItem) => {
              if (userItem._id.toString() === botUser._id.toString()) return;
              console.log("Emitting bot message to user:", userItem._id.toString());
              io.to(userItem._id.toString()).emit("message received", botMessage);
            });
          }
        } catch (botErr) {
          console.error("Error processing bot response:", botErr);
        }
      })();
    }
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = { allMessages, sendMessage };

