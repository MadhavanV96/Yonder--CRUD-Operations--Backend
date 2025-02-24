require("dotenv").config();
const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
  name: String,
  age: Number,
  email: String,
  address: String,
  image: String,
  document: String,
  subjects: [{ subjectName: String, mark: Number }],
});

const User = mongoose.model("User", userSchema);

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

app.post("/", upload.fields([{ name: "image" }, { name: "document" }]), async (req, res) => {
  try {
    const { name, age, email, address, subjects } = req.body;
    const newUser = new User({
      name,
      age,
      email,
      address,
      image: req.files["image"][0].path,
      document: req.files["document"][0].path,
      subjects: JSON.parse(subjects),
    });
    await newUser.save();
    console.log(newUser);
    
    res.json({ message: "Form submitted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/data", async (req, res) => {
    try {
      const users = await User.find();
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });


  app.put("/data/:id", async (req, res) => {
    try {
      const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(updatedUser);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  app.delete("/data/:id", async (req, res) => {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.json({ message: "Data deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  

app.listen(5000, () => console.log("Server running on port 5000"));



