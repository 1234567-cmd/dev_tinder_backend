
const socket=require("socket.io")

const initializeSocket=(server)=>{
    const io=socket(server,{
        cors:{
            origin:process.env.CORS_ORIGIN,
            methods:["GET","POST"],
            credentials:true
        }
    })
   io.on("connection",(socket)=>{
        console.log("Socket connected",socket.id)
   })
}

module.exports=initializeSocket