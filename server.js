const express = require("express");

const app=express();
const PORT=4000;
const cors=require('cors');
const mongoose=require('mongoose');
const { MONGODB_URL } = require('./config');


mongoose.connect(MONGODB_URL);

mongoose.connection.on('connected',()=>{
    console.log("DB connected");
})
mongoose.connection.on('error',(error)=>{
    console.log("some error occured");
})

require('./models/user_model');

app.use(cors());
app.use(express.json());

require('./models/user_model');
app.use(require('./routes/user_routes'));



app.get("/Welcome", (req,res)=>{
 res.status(200).json({"msg":"Hello world"});
});

app.listen(PORT,()=>{
    console.log("server is running");
});