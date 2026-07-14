const asyncHandler = require("express-async-handler");
const Chat = require("../Models/chatModel");
const User = require("../Models/userModel");

//@description     Rename Group (PATCH)
//@route           PATCH /api/groups/:groupId/rename
//@access          Protected
const renameGroupPatch = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { name } = req.body;

  if (!name || !name.trim()) {
    res.status(400);
    throw new Error("Name is required");
  }

  // Find the group chat
  const chat = await Chat.findOne({ _id: groupId, isGroupChat: true });

  if (!chat) {
    res.status(404);
    throw new Error("Group chat not found");
  }

  // Check if the requesting user is a member of the group
  const isMember = chat.users.some(
    (userId) => userId.toString() === req.user._id.toString()
  );

  if (!isMember) {
    res.status(403);
    throw new Error("You must be a member of the group to rename it");
  }

  chat.chatName = name.trim();
  await chat.save();

  // Populate the updated chat info
  let updatedChat = await Chat.findById(groupId)
    .populate("users", "-password")
    .populate("groupAdmin", "-password")
    .populate("createdBy", "name")
    .populate("latestMessage");

  updatedChat = await User.populate(updatedChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  // Emit a socket event "group-renamed" to all group members
  const io = req.app.get("socketio");
  if (io) {
    // Emit to room represent by groupId
    io.to(groupId).emit("group-renamed", { groupId, newName: name.trim() });

    // Also emit individually to user rooms just in case
    updatedChat.users.forEach((u) => {
      io.to(u._id.toString()).emit("group-renamed", { groupId, newName: name.trim() });
    });
  }

  res.status(200).json(updatedChat);
});

//@description     Update Group Picture (PATCH)
//@route           PATCH /api/groups/:groupId/picture
//@access          Protected
const updateGroupPicPatch = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { picture } = req.body;

  if (!picture || !picture.trim()) {
    res.status(400);
    throw new Error("Picture URL is required");
  }

  // Find the group chat
  const chat = await Chat.findOne({ _id: groupId, isGroupChat: true });

  if (!chat) {
    res.status(404);
    throw new Error("Group chat not found");
  }

  // Check if the requesting user is a member of the group
  const isMember = chat.users.some(
    (userId) => userId.toString() === req.user._id.toString()
  );

  if (!isMember) {
    res.status(403);
    throw new Error("You must be a member of the group to update its picture");
  }

  chat.groupPic = picture.trim();
  await chat.save();

  // Populate the updated chat info
  let updatedChat = await Chat.findById(groupId)
    .populate("users", "-password")
    .populate("groupAdmin", "-password")
    .populate("createdBy", "name")
    .populate("latestMessage");

  updatedChat = await User.populate(updatedChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  // Emit a socket event "group-picture-updated" to all group members
  const io = req.app.get("socketio");
  if (io) {
    // Emit to room represent by groupId
    io.to(groupId).emit("group-picture-updated", { groupId, newPic: picture.trim() });

    // Also emit individually to user rooms just in case
    updatedChat.users.forEach((u) => {
      io.to(u._id.toString()).emit("group-picture-updated", { groupId, newPic: picture.trim() });
    });
  }

  res.status(200).json(updatedChat);
});

module.exports = { renameGroupPatch, updateGroupPicPatch };
