const express = require("express");
const { renameGroupPatch } = require("../controller/groupController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/:groupId/rename").patch(protect, renameGroupPatch);

module.exports = router;
