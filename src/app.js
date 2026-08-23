const express= require("express")
const app= express();
app.listen(3000,()=>{
  console.log("Server is set on port 3000");
})

// app.use("/test",(req, res)=>{
//     res.send("Server is Responding Positive ")
// })
app.get("/user",(req,res,next)=>{
  console.log(req.query)
  res.send({
    name:"Waseem Ahmad"
  })
  next()
},((req,res)=>{
  console.log("working")
  res.send("Second")
}))