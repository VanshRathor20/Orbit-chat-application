const express = require("express");
const {
  renameGroupPatch,
  updateGroupPicPatch,
  deleteGroup,
  removeMemberPatch,
} = require("../controller/groupController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/:groupId").delete(protect, deleteGroup);
router.route("/:groupId/rename").patch(protect, renameGroupPatch);
router.route("/:groupId/picture").patch(protect, updateGroupPicPatch);
router.route("/:groupId/remove-member").patch(protect, removeMemberPatch);

module.exports = router;
