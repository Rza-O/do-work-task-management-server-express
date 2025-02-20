require('dotenv').config();
const cors = require('cors');
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

app.listen(port, () => {
   console.log(`Do-Work server is running at ${port}`)
})