const router = require("express").Router();
const Property = require("../models/Property");


function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Function to generate the unique ID
function generateUniqueID() {
    const prologue = "dbbproperty-";
    const randomNumber = getRandomNumber(1000, 9999); // You can adjust the range as needed
    const uniqueID = `${prologue}${randomNumber}`;
    return uniqueID;
}

router.post("/register-property", async (req, res) => {
    try {

        if (
            !req.headers.authorization ||
            !req.headers.authorization.startsWith("Bearer ") ||
            !req.headers.authorization.split(" ")[1]
        ) {
            return res.status(422).json({ message: "Please Provide Token!" });
        }

        const generatedID = generateUniqueID();
        const propertyType = req.body.propertyType;
        const landlordName = req.body.landlordName;
        const landlordTelephone = req.body.landlordTelephone;
        const landlordEmail = req.body.landlordEmail;
        const landlordAddress = req.body.landlordAddress;
        const propertyreqType = req.body.propertyreqType;
        const propertyDetails = req.body.propertyDetails;
        const price = req.body.price;

        const saveProperty = new Property({

            generatedID: generatedID,
            propertyType: propertyType,
            landlordName: landlordName,
            landlordTelephone: landlordTelephone,
            landlordEmail: landlordEmail,
            landlordAddress: landlordAddress,
            propertyreqType: propertyreqType,
            propertyDetails: propertyDetails,
            price: price
        });

        const myProperty = await saveProperty.save();
        res.send({ message: "Property Registration Successful", myProperty });

    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});


router.get("/getAllProperties", async (req, res) => {
    try {

        if (
            !req.headers.authorization ||
            !req.headers.authorization.startsWith("Bearer ") ||
            !req.headers.authorization.split(" ")[1]
        ) {
            return res.status(422).json({ message: "Please Provide Token!" });
        }

        const listAllProperties = await Property.find();
        res.status(200).json(listAllProperties)


    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

router.get("/getAllProperties/:generatedID", async (req, res) => {
    try {

        if (
            !req.headers.authorization ||
            !req.headers.authorization.startsWith("Bearer ") ||
            !req.headers.authorization.split(" ")[1]
        ) {
            return res.status(422).json({ message: "Please Provide Token!" });
        }

        const listAllProperties = await Property.find({ generatedID: req.params.generatedID });
        res.status(200).json(listAllProperties)


    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});



module.exports = router;
