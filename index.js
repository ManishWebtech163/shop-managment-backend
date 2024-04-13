const express = require("express");
const fs = require("fs");
const path = require("path");
require('dotenv').config();
const cors = require("cors");

// --
const app = express()
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

const PORT = process.env.PORT || 3000;

// Use cors middleware with specific origin
app.use(cors({
    origin: 'https://shop-managment.vercel.app/'
}));


// Paths
const shopsFilePath = path.join(__dirname, "db", "shops.json");


// Read shops data from file
function readShopsData() {
    try {
        const data = fs.readFileSync(shopsFilePath, { encoding: 'utf8' });
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading shops data:", error);
        return [];
    }
}


// --routes--
// Route to get shops data
app.get("/api/shop_data", (_, res) => {
    const shopsData = readShopsData();
    res.json(shopsData);
});


// Route to delete a shop
app.post("/api/delete_shop", (req, res) => {
    const { location } = req.body;
    let shopsData = readShopsData();

    // Filter out the shop with the given location
    const updatedShopsData = shopsData.filter(shop => shop.location !== location);

    // Write the updated data back to the file
    fs.writeFile(shopsFilePath, JSON.stringify(updatedShopsData), err => {
        if (err) {
            console.error("Error deleting shop:", err);
            res.status(500).send("Delete unsuccessful");
        } else {
            res.send("Delete successful");
        }
    });
});

// Route to add a new shop
app.post("/api/add_shop", (req, res) => {
    const data = req.body;
    let shopsData = readShopsData();

    if (shopsData.some(shop => shop.location === data.location)) {
        res.status(400).send("Shop already exists");
        return;
    }

    // Add the new shop data
    shopsData.push(data);

    // Write the updated data back to the file
    fs.writeFile(shopsFilePath, JSON.stringify(shopsData), err => {
        if (err) {
            console.error("Error adding shop:", err);
            res.status(500).send("Add unsuccessful");
        } else {
            res.send("Add successful");
        }
    });
});

// Start the server
app.listen(PORT, () => {
    console.log("Server is running on port", PORT);
});

module.exports = app;