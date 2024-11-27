import jwt from "jsonwebtoken";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

export default async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(422).json({ statusCode: 422, message: "Not Authanticated" });
    }
    const [authType, token] = authHeader.split(' ');

    let decodedToken;
    try {
        decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        return res.status(422).json({ statusCode: 422, message: "Not Authanticated" });
    }
    if (!decodedToken) {
        return res.status(422).json({ statusCode: 422, message: "Not Authanticated" });
    }
    req.userId = decodedToken.id;
    req.user = await User.findById(req.userId);
    next();
};