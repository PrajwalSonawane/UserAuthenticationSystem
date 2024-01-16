// Import packages
const express = require("express");
const home = require("./routes/home");
var cors = require('cors');

// Middlewares
const app = express();
app.use(express.json());

// Cors
app.use(cors());

// Routes
app.use("/", home);

// connection
const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Listening to port ${port}`));
