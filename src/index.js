import { configDotenv } from "dotenv";
import dbConnect from "./db/dbConnect.js";
import app from "./app.js";

configDotenv({
    path: "./.env",
});

const port = process.env.PORT || 8000;

dbConnect()
    .then(() => {
        app.listen(port, () => {
            console.log(`Server is listening on Port: ${port}`);
        });
    })
    .catch((error) => console.log("Database connection failed!!!: ", error));
