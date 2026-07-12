const generateToken=require("../config/generateToken");
const asyncHandler = require("express-async-handler");
const user=require("../Models/userModel");
const registerUser=asyncHandler(async(req,res)=>{
    const {name,email,password,pic}=req.body;

    if  (!name || !email || !password){
        res.status(400);
        throw new Error("Please Enter all the Fields");
    }
    const userExists=await user.findOne({email});
    if(userExists){
        res.status(400);
        throw new Error("User already exists");
    }
    const userCreated=await user.create({
        name,
        email,
        password,
        pic
    });
    if(userCreated){
        res.status(201).json({
            _id:userCreated._id,
            name:userCreated.name,
            email:userCreated.email,
            pic:userCreated.pic,
            bio:userCreated.bio,
            token:generateToken(userCreated._id) 
        })
    }else{
        res.status(400);
        throw new Error("User not found");
    } 
})

const authUser=asyncHandler(async(req,res)=>{
    const {email,password}=req.body;
    const userFound=await user.findOne({email});
    if(userFound && (await userFound.matchPassword(password))){
        res.json({
            _id:userFound._id,
            name:userFound.name,
            email:userFound.email,
            pic:userFound.pic,
            bio:userFound.bio,
            token:generateToken(userFound._id)
        })
    }else{
        res.status(400);
        throw new Error("Invalid Email or Password");
    }
})

const allUsers = asyncHandler(async (req, res) => {
    const keyword = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};
  
    const users = await user.find(keyword).find({ _id: { $ne: req.user._id } });
    res.send(users);
  });

const updateUserProfile = asyncHandler(async (req, res) => {
  const userToUpdate = await user.findById(req.user._id);

  if (userToUpdate) {
    userToUpdate.name = req.body.name || userToUpdate.name;
    userToUpdate.pic = req.body.pic || userToUpdate.pic;
    if (req.body.bio !== undefined) {
      userToUpdate.bio = req.body.bio;
    }

    if (req.body.password) {
      userToUpdate.password = req.body.password;
    }

    const updatedUser = await userToUpdate.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      pic: updatedUser.pic,
      bio: updatedUser.bio,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});
  
module.exports={registerUser,authUser,allUsers,updateUserProfile}; 