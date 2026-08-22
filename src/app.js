const express= require("express")
const app= express();
app.listen(3000,()=>{
  console.log("Server is set on port 3000");
})

app.use("/test",(req, res)=>{
    res.send("Server is Responding Positive ")
})