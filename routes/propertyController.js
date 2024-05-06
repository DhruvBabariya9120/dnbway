import express from "express";
import Property from "../models/Property.js";
import isAuth from "../middlewares/is-auth.js";
const router = express.Router();


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
export default router
