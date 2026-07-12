const express = require("express"); 
const { registerUser, authUser, allUsers, updateUserProfile } = require("../controller/userController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").post(registerUser).get(protect, allUsers).put(protect, updateUserProfile);
router.route("/login").post(authUser); 

module.exports = router;