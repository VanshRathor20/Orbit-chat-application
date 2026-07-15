const asyncHandler = require("express-async-handler");
const Chat = require("../Models/chatModel");
const User = require("../Models/userModel");
const Message = require("../Models/messageModel");

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

const getPublicIdFromUrl = (url) => {
  const parts = url.split('/image/upload/');
  if (parts.length < 2) return null;
  const path = parts[1];
  const pathParts = path.split('/');
  if (pathParts[0].match(/^v\d+$/)) {
    pathParts.shift();
  }
  const cleanPath = pathParts.join('/');
  const dotIndex = cleanPath.lastIndexOf('.');
  if (dotIndex !== -1) {
    return cleanPath.substring(0, dotIndex);
  }
  return cleanPath;
};

//@description     Delete Group (DELETE)
//@route           DELETE /api/groups/:groupId
//@access          Protected
const deleteGroup = asyncHandler(async (req, res) => {
  const { groupId } = req.params;

  const chat = await Chat.findOne({ _id: groupId, isGroupChat: true });

  if (!chat) {
    res.status(404);
    throw new Error("Group chat not found");
  }

  // verify req.user._id matches the group's admin field — if not, return 403 Forbidden
  if (chat.groupAdmin.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Only the group admin can delete this group");
  }

  // Delete custom Cloudinary group icon if exists
  if (chat.groupPic && chat.groupPic.includes("res.cloudinary.com")) {
    try {
      const publicId = getPublicIdFromUrl(chat.groupPic);
      if (publicId) {
        const cloudinary = require("cloudinary").v2;
        cloudinary.config({
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET,
        });
        await cloudinary.uploader.destroy(publicId);
      }
    } catch (cloudinaryErr) {
      console.error("Failed to delete group icon from Cloudinary:", cloudinaryErr);
    }
  }

  // Delete all Message documents where conversation/group === groupId (cascade delete)
  await Message.deleteMany({ chat: groupId });

  // Delete the group document from the Group (Chat) collection
  await Chat.deleteOne({ _id: groupId });

  // Emit a socket event "groupDeleted" to all members' sockets
  const io = req.app.get("socketio");
  if (io) {
    chat.users.forEach((userId) => {
      io.to(userId.toString()).emit("groupDeleted", { groupId });
    });
  }

  res.status(200).json({ message: "Group deleted successfully", groupId });
});

//@description     Remove Member from Group (PATCH)
//@route           PATCH /api/groups/:groupId/remove-member
//@access          Protected
const removeMemberPatch = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { memberIdToRemove } = req.body;

  if (!memberIdToRemove) {
    res.status(400);
    throw new Error("Member ID to remove is required");
  }

  // Find the group chat
  const chat = await Chat.findOne({ _id: groupId, isGroupChat: true });

  if (!chat) {
    res.status(404);
    throw new Error("Group chat not found");
  }

  // Verify req.user._id === group.groupAdmin
  if (chat.groupAdmin.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Only the group admin can remove members");
  }

  // Verify memberIdToRemove !== group.groupAdmin
  if (memberIdToRemove.toString() === chat.groupAdmin.toString()) {
    res.status(400);
    throw new Error("Admin cannot be removed from the group");
  }

  // Verify memberIdToRemove is in group.users
  const isMember = chat.users.some(
    (userId) => userId.toString() === memberIdToRemove.toString()
  );

  if (!isMember) {
    res.status(404);
    throw new Error("User is not a member of this group");
  }

  // Pull memberIdToRemove from group.users array, save
  chat.users = chat.users.filter(
    (userId) => userId.toString() !== memberIdToRemove.toString()
  );
  await chat.save();

  // Find the removed user to get their name
  const removedUser = await User.findById(memberIdToRemove);
  const username = removedUser ? removedUser.name : "a member";

  // Create a system message
  let systemMsg = await Message.create({
    sender: req.user._id,
    content: `Admin removed ${username} from the group`,
    chat: groupId,
    messageType: "system",
  });

  systemMsg = await systemMsg.populate("sender", "name pic");
  systemMsg = await systemMsg.populate("chat");
  systemMsg = await User.populate(systemMsg, {
    path: "chat.users",
    select: "name pic email",
  });

  // Update latest message in group
  await Chat.findByIdAndUpdate(groupId, { latestMessage: systemMsg });

  // Populated updated group chat info to return
  let updatedChat = await Chat.findById(groupId)
    .populate("users", "-password")
    .populate("groupAdmin", "-password")
    .populate("createdBy", "name")
    .populate("latestMessage");

  updatedChat = await User.populate(updatedChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  const io = req.app.get("socketio");
  if (io) {
    // 1. Emit socket event "memberRemoved" to remaining group members
    updatedChat.users.forEach((u) => {
      io.to(u._id.toString()).emit("memberRemoved", {
        groupId,
        removedMemberId: memberIdToRemove,
        removedByAdmin: true,
      });

      // Emit the system message to remaining members so it displays in their chat
      io.to(u._id.toString()).emit("message received", systemMsg);
    });

    // 2. Emit a separate socket event directly to the removed user's socket "youWereRemoved"
    io.to(memberIdToRemove.toString()).emit("youWereRemoved", { groupId });
  }

  res.status(200).json(updatedChat);
});

module.exports = {
  renameGroupPatch,
  updateGroupPicPatch,
  deleteGroup,
  removeMemberPatch,
};
