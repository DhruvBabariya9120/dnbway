import express from "express";
import Booking from "../models/Bookings.js";

const router = express.Router();
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Function to generate the unique ID
function generateUniqueBookingID() {
    const prologue = "dnbBooking-";
    const randomNumber = getRandomNumber(10000, 99999); // You can adjust the range as needed
    const uniqueID = `${prologue}${randomNumber}`;
    return uniqueID;
}


router.post("/register-booking", async (req, res) => {
    try {

        if (
            !req.headers.authorization ||
            !req.headers.authorization.startsWith("Bearer ") ||
            !req.headers.authorization.split(" ")[1]
        ) {
            return res.status(422).json({ message: "Please Provide Token!" });
        }

        const bookingId = generateUniqueBookingID();
        const propertyType = req.body.propertyType;
        const bookingRequestorName = req.body.bookingRequestorName;
        const bookingRequestorEmail = req.body.bookingRequestorEmail;
        const bookingRequestorFromDate = req.body.bookingRequestorFromDate;
        const bookingRequestorToDate = req.body.bookingRequestorToDate;
        const bookingPrice = req.body.bookingPrice;
        const bookingPaymentMethod = req.body.bookingPaymentMethod;
        const bookingRequestorPaymentType = req.body.bookingRequestorPaymentType;


        const booking = new Booking({
            bookingId: bookingId,
            propertyType: propertyType,
            bookingRequestorName: bookingRequestorName,
            bookingRequestorEmail: bookingRequestorEmail,
            bookingRequestorFromDate: bookingRequestorFromDate,
            bookingRequestorToDate: bookingRequestorToDate,
            bookingPrice: bookingPrice,
            bookingPaymentMethod: bookingPaymentMethod,
            bookingRequestorPaymentType: bookingRequestorPaymentType,
            isLoanPayment: false,
            bookingStatus: true
        });

        const myBooking = await booking.save();
        res.send({ message: "Booking Complete", myBooking });


    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});


router.put("/edit-booking/:bookingId", async (req, res) => {
    try {

        if (
            !req.headers.authorization ||
            !req.headers.authorization.startsWith("Bearer ") ||
            !req.headers.authorization.split(" ")[1]
        ) {
            return res.status(422).json({ message: "Please Provide Token!" });
        }

        const bookingId = req.params.bookingId;
        const bookingRequestorFromDate = req.body.bookingRequestorFromDate;
        const bookingRequestorToDate = req.body.bookingRequestorToDate;
        const bookingPrice = req.body.bookingPrice;
        const isLoanPayment = req.body.isLoanPayment;

        const bookingInfo = await Booking.findOneAndUpdate({ bookingId: bookingId }, { $set: { bookingRequestorFromDate: bookingRequestorFromDate, bookingRequestorToDate: bookingRequestorToDate, bookingPrice: bookingPrice, isLoanPayment: isLoanPayment } });
        return res.send({ error: false, message: "Booking Updated", bookingInfo });

    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});


router.put("/cancel-booking/:bookingId", async (req, res) => {
    try {

        if (
            !req.headers.authorization ||
            !req.headers.authorization.startsWith("Bearer ") ||
            !req.headers.authorization.split(" ")[1]
        ) {
            return res.status(422).json({ message: "Please Provide Token!" });
        }


        const bookingId = req.params.bookingId;
        const bookingStatus = false;

        const bookingInfo = await Booking.findOneAndUpdate({ bookingId: bookingId }, { $set: { bookingStatus: bookingStatus } });
        return res.send({ error: false, message: "Booking Canceled" });


    } catch (error) {
        res.status(404).json({ message: error.message });
    }
})


export default router;