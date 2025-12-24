const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

require("dotenv").config();
const patientRoutes = require("./routes/patientRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Ethiopia Clinic Queue System Backend Running");
});

app.use("/api/patients", patientRoutes);

mongoose
  .connect(process.env.MONGO_URI)

  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
