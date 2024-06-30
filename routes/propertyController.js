import express from "express";
import Property from "../models/Property.js";
import isAuth from "../middlewares/is-auth.js";
import AWS from 'aws-sdk';
const router = express.Router();


AWS.config.update({
    accessKeyId: process.env.YOUR_ACCESS_KEY_ID,
    secretAccessKey: process.env.YOUR_SECRET_ACCESS_KEY,
    region: process.env.YOUR_REGION
});

const s3 = new AWS.S3();

// Function to generate the unique I
/**
 * @swagger
 * components:
 *   schemas:
 *     Property:
 *       type: object
 *       properties:
 *         address:
 *           $ref: '#/components/schemas/PropertyAddress'
 *         propertyTimeTOSell:
 *           type: string
 *         reason:
 *           type: string
 *         propertyDetails:
 *           type: string
 *         propertyName:
 *           type: string
 *         propertyType:
 *           type: string
 *         finishedSqft:
 *           type: number
 *         lotSize:
 *           type: number
 *         builtYear:
 *           type: number
 *         bedrooms:
 *           type: number
 *         fullBaths:
 *           type: number
 *         securityDeposit:
 *           type: number
 *         monthlyRent:
 *           type: number
 *         contact:
 *           type: string
 *         amentities:
 *           type: string
 *     PropertyAddress:
 *       type: object
 *       properties:
 *         propertyAddress:
 *           type: string
 *         unitNumber:
 *           type: string
 *         city:
 *           type: string
 *         state:
 *           type: string
 *         zipcode:
 *           type: number
 *         location:
 *           type: object
 *           properties:
 *             type:
 *               type: string
 *               enum: ['Point']
 *             coordinates:
 *               type: array
 *               items:
 *                 type: number
 */

/**
 * @swagger
 * /api/property/properties:
 *   post:
 *     summary: Create a new property
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Property'
 *     responses:
 *       '201':
 *         description: Property created successfully
 *       '400':
 *         description: Bad request
 */
router.post("/properties", isAuth, async (req, res) => {
    try {
        req.body.userId = req.userId;
        const property = await Property.create(req.body);
        res.status(201).json(property);
    } catch (err) {
        console.log(err);
        res.status(400).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/property/properties/{id}:
 *   put:
 *     summary: Update a property by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Property ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Property'
 *     responses:
 *       '200':
 *         description: Property updated successfully
 *       '404':
 *         description: Property not found
 *       '400':
 *         description: Bad request
 */
router.put("/properties/:id", isAuth, async (req, res) => {
    try {
        const existingProperty = await Property.findById(req.params.id);
        if (!existingProperty) {
            return res.status(404).json({ message: "Property not found" });
        }
        if (existingProperty.userId.toString() !== req.userId) {
            return res.status(401).json({ message: "Not authorized" });
        }
        const property = await Property.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }
        res.status(200).json(property);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/property/properties/user:
 *   get:
 *     summary: Get properties based on user ID
 *     responses:
 *       '200':
 *         description: A list of properties
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Property'
 *       '400':
 *         description: Bad request
 *       '500':
 *         description: Internal server error
 */
router.get("/properties/user/", isAuth, async (req, res) => {
    try {
        // Extract the user ID from the query parameters
        const userId = req.userId;

        // Query properties based on the user ID
        const properties = await Property.find({ userId: userId });

        // Send the properties as a response
        res.status(200).json(properties);
    } catch (err) {
        // Handle errors
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/property/properties/{id}:
 *   delete:
 *     summary: Delete a property by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Property ID
 *     responses:
 *       '200':
 *         description: Property deleted successfully
 *       '404':
 *         description: Property not found
 */
router.delete("/properties/:id", isAuth, async (req, res) => {
    try {
        const existingProperty = await Property.findById(req.params.id);
        if (!existingProperty) {
            return res.status(404).json({ message: "Property not found" });
        }
        if (existingProperty.userId.toString() !== req.userId) {
            return res.status(401).json({ message: "Not authorized" });
        }
        await Property.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Property deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/property/properties:
 *   get:
 *     summary: Get properties within a certain range of latitude and longitude
 *     parameters:
 *       - in: query
 *         name: latitude
 *         schema:
 *           type: number
 *         required: true
 *         description: Latitude coordinate
 *       - in: query
 *         name: longitude
 *         schema:
 *           type: number
 *         required: true
 *         description: Longitude coordinate
 *     responses:
 *       '200':
 *         description: A list of properties within the specified range
 *       '400':
 *         description: Bad request
 *       '500':
 *         description: Internal server error
 */
router.get("/properties", isAuth, async (req, res) => {
    try {
        const latitude = parseFloat(req.query.latitude);
        const longitude = parseFloat(req.query.longitude);
        const range = 25;
        const properties = await Property.aggregate([
            {
                $geoNear: {
                    near: { type: "Point", coordinates: [parseFloat(longitude), parseFloat(latitude)] },
                    key: "address.location",
                    maxDistance: parseFloat(range) * 1609,
                    distanceField: "dist.calculated",
                    spherical: true
                }
            }
        ])
        res.status(200).json(properties);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/property/search:
 *   get:
 *     summary: Search for properties based on address fields and location
 *     parameters:
 *       - in: query
 *         name: propertyAddress
 *         schema:
 *           type: string
 *         description: Property address
 *       - in: query
 *         name: lat
 *         schema:
 *           type: number
 *         description: Latitude for nearby search
 *       - in: query
 *         name: lng
 *         schema:
 *           type: number
 *         description: Longitude for nearby search
 *       - in: query
 *         name: maxDistance
 *         schema:
 *           type: number
 *           default: 5000
 *         description: Maximum distance in meters for nearby search
 *     responses:
 *       '200':
 *         description: A list of properties matching the search criteria
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Property'
 *       '400':
 *         description: Bad request
 *       '500':
 *         description: Internal server error
 */
router.get('/search', isAuth, async (req, res) => {
    try {
        const { propertyAddress, lat, lng, maxDistance = 5000 } = req.query;
        console.log(propertyAddress, lat, lng, maxDistance)
        // Build the query object
        let query = {};
        if (propertyAddress) {
            query['$or'] = [
                { 'address.propertyAddress': { $regex: propertyAddress, $options: 'i' } },
                { 'address.city': { $regex: propertyAddress, $options: 'i' } },
                { 'address.state': { $regex: propertyAddress, $options: 'i' } }
            ];
        }

        // Check if lat and lng are provided for nearby search
        if (lat && lng) {
            query['address.location'] = {
                $near: {
                    $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
                    $maxDistance: parseInt(maxDistance)
                }
            };
        }

        // Execute the query
        const properties = await Property.find(query);
        res.status(200).json(properties);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * @swagger
 * /api/property/{id}:
 *   get:
 *     summary: Get a property by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Property ID
 *     responses:
 *       '200':
 *         description: Property found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Property'
 *       '404':
 *         description: Property not found
 *       '400':
 *         description: Bad request
 */

router.get("/:id", isAuth, async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) {
            return res.status(404).json({ message: "Property not found" });
        }
        res.status(200).json(property);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/property/presigned-Url:
 *   post:
 *     summary: Generate presigned URL for image upload
 *     description: Generates a presigned URL for uploading a image to AWS S3.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fileType:
 *                 type: string
 *                 description: The file type (e.g., jpg, png)
 *                 example: jpg
 *               propertyId:
 *                 type: string
 *                 description: The ID of the property
 *                 example: 123
 *      
 *     responses:
 *       200:
 *         description: Presigned URL generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 presignedUrl:
 *                   type: string
 *                   description: The presigned URL for uploading the profile image
 *       400:
 *         description: Invalid file type
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid file type
 *       500:
 *         description: Failed to generate presigned URL
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to generate presigned URL
 */
router.post("/profile-presigned-Url", isAuth, async (req, res) => {
    try {
        const { fileType, propertyId } = req.body;
        const property = await Property.findById(propertyId);
        if (!property) {
            throw new NotFoundException("Property not found");
        }
        const key = `property/${propertyId}_${Date.now()}.${fileType}`;
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key,
            ContentType: `image/${fileType}`
        };
        const url = await s3.getSignedUrlPromise('putObject', params);
        let image_data = property.images
        image_data.push(key)
        property.images = image_data
        await property.save();
        res.status(200).json({ presignedUrl: url });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

export default router
