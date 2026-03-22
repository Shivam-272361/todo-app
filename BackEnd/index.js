const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const todoRoutes = require("./routers/todoRouter");
app.use("/api/v1", todoRoutes);

const { dataBaseConnect } = require("./config/dataBase");
dataBaseConnect();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});