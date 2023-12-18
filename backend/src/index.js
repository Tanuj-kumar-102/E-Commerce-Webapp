import dotenv from "dotenv";
import connectDB from "./db/db.js";
import { app } from "./app.js";

dotenv.config({path: './env'})

const port = 8000;

connectDB()
.then(() => {
    app.listen(port);
    console.log(`app listened ${port}`);
})
.catch((Error) => {
    console.log("error in app listen", Error);
})