const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Patient = require("../models/patient");
const { model } = require("mongoose");

router.post("/register", async (req, res) => {
  const { name, email, password, phone } = req.body;

  // Basic input validation
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Name, email and password are required" });
  }

  try {
    let patient = await Patient.findOne({ email });
    if (patient) {
      return res.status(400).json({ message: "Patient already exists" });
    }

    patient = new Patient({
      name,
      email,
      password,
      phone,
    });

    await patient.save();

    // Ensure JWT secret is configured
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET not set");
      return res
        .status(500)
        .json({ message: "Server configuration error: JWT_SECRET not set" });
    }

    const token = jwt.sign({ id: patient._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(201).json({
      token,
      patient: {
        id: patient._id,
        name,
        email,
        phone,
      },
    });
  } catch (err) {
    console.error(" Register Error", err);
    const response =
      process.env.NODE_ENV === "production"
        ? { message: "Server error" }
        : { message: "Server error", error: err.message };
    res.status(500).json(response);
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" , });
  }

  try {
    const patient = await Patient.findOne({ email});
    if (!patient) {
      return res.status(400).json ({ message: "Invalid email or password" ,})
    }

    const isMatch = await bcrypt.compare(password, patient.password);
    if(!isMatch) {
      return res. status(400).json({ message: "Invalid email or password" , })
    }

    const token = jwt.sign({ id: patient._id} , process.env.JWT_SECRET, {expiresIn: "1d"})

    res.status(200).json({
      token,
      patient:{
        id: patient._id,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
      },
    });
  } catch(err){
    console.error("Login Error", err.message);
    res.status(500).json({ message: "Server error", error:err.messages,})
  }
});

module.exports = router;
