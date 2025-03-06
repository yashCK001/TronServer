import express from "express";
import { config } from "dotenv";
import accountRouter from "./routes/accountRoutes.js";
import { mongoDbConnection } from "./config/mongoConnection.js";

config();

const PORT = process.env.PORT;
console.log("PORT", PORT);

const app = express();
app.use(express.json());

app.use("/api/tron", accountRouter);

mongoDbConnection()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening at localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error occurred", error.message);
  });
