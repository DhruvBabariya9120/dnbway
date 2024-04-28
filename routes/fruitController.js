import express from "express";
import Fruits from "../models/Fruits.js";

const router = express.Router();
router.post("/register-fruit", async (req, res) => {

    const fruits = new Fruits({
        fruitName: req.body.fruitName,
        price: req.body.price,
    });
    try {
        const savedFruits = await fruits.save();
        res.send({ message: "Fruit Registration Successful", savedFruits });
    } catch (err) {
        res.status(400).send({ message: err });
    }
});


router.get("/showFruits", async (req, res) => {

    try {
        const listAllfruits = await Fruits.find();
        res.status(200).json({ message: "all Fruits", listAllfruits })

    } catch (error) {
        res.status(404).json({ message: error.message });
    }

})


export default router