import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors(
    {
        origin: 'http://localhost:3000',
        credentials: true,
    }
))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser());    


//import Routes

import {userRoute} from "./routes/user.route.js";

app.use("/api/v1/users", userRoute);

export default app;