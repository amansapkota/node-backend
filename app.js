import "dotenv/config";
import { connectDB } from "./src/config/connect.js";
import fastify from "fastify";
import {PORT} from "./src/config/config.js";
import {registerRoutes} from "./src/routes/index.js"
import fastifySocketIO from "fastify-socket.io";
<<<<<<< HEAD
import { admin, buildAdminRouter } from "./src/config/setup.js";
=======
import fastifyFormbody from "@fastify/formbody";
import AdminJSFastify from "@adminjs/fastify";
import { admin } from "./admin.js";
>>>>>>> 18069d5 ( integrate AdminJS  with  admin dashboard)


const start = async ()=>{
await connectDB(process.env.DATABASE_URI);
const app = fastify()

app.register(fastifySocketIO, {
    cors:{
        origin:"*"
    },
    pingInterval:10000,
    pingTimeout:50000,
    transports:['websocket']
})

<<<<<<< HEAD
await registerRoutes(app)
await buildAdminRouter(app)
=======
  await app.register(fastifyFormbody);

  // Build the router here, passing the app instance
  await AdminJSFastify.buildRouter(admin, app);

  await registerRoutes(app);
>>>>>>> 18069d5 ( integrate AdminJS  with  admin dashboard)


app.listen({port:PORT, host:'192.168.240.1'}, (err,addr) => {
    if(err){
        console.log(err);
    } else {
        console.log(`Grocery App running on http://localhost:${PORT}${admin.options.rootPath}`)
    }
})

app.ready().then(()=> {
    app.io.on('connection', (socket)=> {
        console.log("A user Connected")
        socket.on("joinRoom", (orderId)=> {
            socket.join(orderId);
            console.log(`User Joined Room ${orderId}`)
        })
        socket.on('disconnect',() => {
            console.log("User Disconnected")
        })
    })
})
}

start()