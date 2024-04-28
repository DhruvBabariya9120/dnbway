import jwt from "jsonwebtoken";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

export default async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(422).json("Not Authanticated");
    }
    const [authType, token] = authHeader.split(' ');

    let decodedToken;
    try {
        decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        return res.status(422).json("Not Authantcated");
    }
    if (!decodedToken) {
        return res.status(422).json("Not Authantcated");
    }
    req.userId = decodedToken.id;
    req.user = await User.findById(req.userId);
    next();
};