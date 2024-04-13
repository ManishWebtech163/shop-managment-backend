const express = require("express")
const fs = require("fs")
require('dotenv').config()

// --
const app = express()
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies


// --
const shopsFilePath = "./db/shops.json";
// Function to read shops data from file
function readShopsData() {
    return JSON.parse(fs.readFileSync(shopsFilePath, { encoding: 'utf8' }));
}


// --serve front end --
app.use(express.static("dist"));
app.get("/", (_, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
})

// --routes--
app.get("/api/shop_data", (_, res) => {
    const shopsData = readShopsData();
    res.send(shopsData);
})

// --remove location--
app.post("/api/delete_shop", (req, res) => {
    const { location } = req.body
    let shopsData = readShopsData();

    // Filter out the shop with the given location
    const removeLocation = shopsData.filter(f => f.location !== location);
    // Write the updated data back to the file
    fs.writeFile(shopsFilePath, JSON.stringify(removeLocation), err => {
        if (err) {
            res.send("delete unsuccess")
        } else {
            // If successful, send the updated data
            shopsData = readShopsData(); // Read the updated data
            res.send("delete success")
        }
    })
})


// --add shop--
app.post("/api/add_shop", (req, res) => {
    const data = req.body
    let shopsData = readShopsData();

    if (shopsData.some(s => s.location === data.location)) {
        res.send("Data already exist")
        return;
    }
    // Filter out the shop with the given location
    const addedData = [...shopsData, data];
    // Write the updated data back to the file
    fs.writeFile(shopsFilePath, JSON.stringify(addedData), err => {
        if (err) {
            res.send("add unsuccess")
        } else {
            // If successful, send the updated data
            shopsData = readShopsData(); // Read the updated data
            res.send("add success")
        }
    })
})


// --lisitin app--
app.listen(process.env.PORT, () => {
    console.log("Start server on this port", process.env.PORT);
})