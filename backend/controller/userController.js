const asyncHandler = require("express-async-handler");
const user=require("../Models/userModel");
const registerUser=asyncHandler(async()=>{
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
            pic:userCreated.pic
        })
    }else{
        res.status(400);
        throw new Error("User not found");
    } 
})

module.exports={registerUser}