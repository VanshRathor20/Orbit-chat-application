const express = require("express"); 
const { registerUser } = require("../controller/userController");
const { authUser } = require("../controller/userController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").post(registerUser).get(protect,allUsers);
router.route("/login").post(authUser); 

module.exports = router;