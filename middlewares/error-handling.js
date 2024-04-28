export default async (err, req, res, next) => {
    console.error(err.stack); // Log the error

    // Check if headers have already been sent
    if (res.headersSent) {
        return next(err);
    }

    // Handle specific types of errors
    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    // Handle other types of errors
    res.status(500).json({ message: 'Internal Server Error' });
}