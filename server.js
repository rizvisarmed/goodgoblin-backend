const http = require("http");

const { app } = require("./app");
const { prisma } = require("./utils");
const { APP_PORT } = require("./config");

process.on("uncaughtException", (err) => {
  console.log(`[uncaughtException] Shutting down server ...`);
  console.log(err.name, err.message);
  console.log(err);
  process.exit(1);
});

const httpServer = http.createServer(app);

const server = httpServer.listen(APP_PORT, async () => {
  try {
    await prisma.$connect();
    console.log("Connected to SQL database");
    console.log("server up and running:", APP_PORT);
  } catch (error) {
    console.log(
      "There is some problem, server is not connected to SQL database"
    );
  }
});

process.on("uncaughtException", (err) => {
  console.log(`[uncaughtException] Shutting down server ...`);
  console.log(err);
  server.close(() => {
    process.exit(1);
  });
});
