export default async (err, req, res, next) => {

    // Check if headers have already been sent
    if (res.headersSent) {
        return next(err);
    }

    // Handle specific types of errors
    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({ statusCode: 401, message: 'Unauthorized' });
    }
    console.log(err.name)
    console.log(err)
    // Handle other types of errors
    res.status(500).json({ statusCode: 500, message: 'Internal Server Error' });
}