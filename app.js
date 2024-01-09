require('dotenv').config()
const express = require("express");
const logger = require("morgan");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");
var port = process.env.PORT || 3000;

const authRoute = require("./routes/authController");
const property = require("./routes/propertyController");
const bookings = require("./routes/bookingController");
const wallets = require("./routes/walletController");
const loanApplication = require("./routes/loanApplicationController");
const messages = require("./routes/messageController");
const fruits = require("./routes/fruitController");

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
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
app.use("/api/loans/",loanApplication);
app.use("/api/messages/",messages);
app.use("/api/fruits",fruits);



app.get("/", function (req, res) {
    res.json({ homeresponse: "Welcome to DNBWay" });
});
app.listen(port, function () {
    console.log(`Server Up and running on Port ${port}`);
});