import "dotenv/config";
import { connectDB } from "./src/config/connect.js";
import fastify from "fastify";
import { PORT } from "./src/config/config.js";
import { registerRoutes } from "./src/routes/index.js";
import fastifySocketIO from "fastify-socket.io";
import { admin, buildAdminRouter } from "./src/config/setup.js";

const start = async () => {
  try {
    await connectDB(process.env.DATABASE_URI);

    const app = fastify();

    app.register(fastifySocketIO, {
      cors: { origin: "*" },
      pingInterval: 10000,
      pingTimeout: 50000,
      transports: ["websocket"],
    });

    // ✅ Removed duplicate fastifyFormbody registration
    await registerRoutes(app);
    await buildAdminRouter(app);

    const addr = await app.listen({ port: PORT, host: "0.0.0.0" });
    console.log(`Grocery App running on ${addr}${admin.options.rootPath}`);

    app.io.on("connection", (socket) => {
      console.log("A user Connected");
      socket.on("joinRoom", (orderId) => {
        socket.join(orderId);
        console.log(`User Joined Room ${orderId}`);
      });
      socket.on("disconnect", () => {
        console.log("User Disconnected");
      });
    });

  } catch (err) {
    console.error("Startup error:", err);
    process.exit(1);
  }
};

start();