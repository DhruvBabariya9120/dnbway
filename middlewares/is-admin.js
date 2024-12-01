export default async (req, res, next) => {

    const user = req.user;
    if (user?.role != 'admin') {
        return res.status(403).json({ statusCode: 403, message: "You are not an admin" });
    }
    next();
};