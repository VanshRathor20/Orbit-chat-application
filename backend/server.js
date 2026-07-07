const express = require("express");
const chats = require("./data/data");
const dotenv=require("dotenv");
dotenv.config();
const app = express();

app.get("/", (req, resp) => {
  resp.end("Server is running");
});

app.get("/api/chat", (req, resp) => {
  resp.send(chats);
});
app.get("/api/chat/:id",(req,res)=>{
    const singleChat=chats.find((c)=>c._id===req.params.id)
    res.send(singleChat)
})

const PORT =process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
