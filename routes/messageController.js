import express from "express";
import Message from "../models/Message.js";

const router = express.Router();

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Function to generate the unique ID
function getMessageID() {
    const prologue = "dndmessage-";
    const randomNumber = getRandomNumber(10000, 99999); // You can adjust the range as needed
    const uniqueID = `${prologue}${randomNumber}`;
    return uniqueID;
}

router.post("/save-message", async (req, res) => {
    try {

        if (
            !req.headers.authorization ||
            !req.headers.authorization.startsWith("Bearer ") ||
            !req.headers.authorization.split(" ")[1]
        ) {
            return res.status(422).json({ message: "Please Provide Token!" });
        }

        const msg = new Message({
            messageId: getMessageID(),
            email: req.body.email,
            messageBody: req.body.messageBody
        });

        msg.save();
        return res.send({ error: false, message: "Message Saved", msg });

    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});


router.get("/list-messages/:email", async (req, res) => {
    try {

        if (
            !req.headers.authorization ||
            !req.headers.authorization.startsWith("Bearer ") ||
            !req.headers.authorization.split(" ")[1]
        ) {
            return res.status(422).json({ message: "Please Provide Token!" });
        }

        const listAllMessages = await Message.find();
        res.status(200).json({ message: "all messages", listAllMessages })

    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

router.get("/list-messages/:messageId", async (req, res) => {
    try {

        if (
            !req.headers.authorization ||
            !req.headers.authorization.startsWith("Bearer ") ||
            !req.headers.authorization.split(" ")[1]
        ) {
            return res.status(422).json({ message: "Please Provide Token!" });
        }

        const listAllMessages = await Message.find({ messageId: messageId });
        res.status(200).json({ message: "all messages", listAllMessages })

    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

export default router;