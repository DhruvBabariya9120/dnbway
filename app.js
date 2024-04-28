import dotenv from "dotenv";
import express from "express";
import logger from "morgan";
import cors from "cors";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import authRoute from "./routes/authController.js";
import property from "./routes/propertyController.js";
import bookings from "./routes/bookingController.js";
import wallets from "./routes/walletController.js";
import loanApplication from "./routes/loanApplicationController.js";
import messages from "./routes/messageController.js";
import fruits from "./routes/fruitController.js";
import specs from './swaggerConfig.js';
import swaggerUi from 'swagger-ui-express';
import errorHandling from "./middlewares/error-handling.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors())

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Inside the file, after the `specs` definition...

// Route to export Swagger JSON
app.get('/swagger-json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
});
app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

mongoose.set("strictQuery", false);
mongoose.connect(
    process.env.MONGODB_URI,
    { useNewUrlParser: true },
    (err) => {
        if (err) {
            console.error("Error connecting to MongoDB:", err);
        } else {
            console.log("Db Connected");
        }
    }
);

app.use("/api/auth/", authRoute);
app.use("/api/property/", property);
app.use("/api/booking/", bookings);
app.use("/api/wallet/", wallets);
app.use("/api/loans/", loanApplication);
app.use("/api/messages/", messages);
app.use("/api/fruits", fruits);

app.use(errorHandling)

app.get("/", function (req, res) {
    res.json({ homeresponse: "Welcome to DNBWay" });
});
app.listen(port, function () {
    console.log(`Server Up and running on Port ${port}`);
});