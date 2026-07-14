const express = require("express");
const { renameGroupPatch, updateGroupPicPatch } = require("../controller/groupController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/:groupId/rename").patch(protect, renameGroupPatch);
router.route("/:groupId/picture").patch(protect, updateGroupPicPatch);

module.exports = router;
