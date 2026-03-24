const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: "*"
}));
app.use(express.json());

app.get("/health", (_req, res) => {
    res.status(200).json({
        success: true,
        message: "Service is healthy",
    });
});
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

const todoRoutes = require("./routers/todoRouter");
app.use("/api/v1", todoRoutes);

const { dataBaseConnect } = require("./config/dataBase");
dataBaseConnect();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
