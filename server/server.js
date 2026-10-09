
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Student = require("./models/Student");

require("dotenv").config();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://mern-labador.vercel.app",
  process.env.CLIENT_URL
]
  .filter(Boolean)
  .map((url) => url.replace(/\/+$/, ""));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.use(express.json());

let connectionPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing");
  }

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(process.env.MONGO_URI)
      .then(() => {
        console.log("Connected to MongoDB");
      })
      .catch((error) => {
        connectionPromise = null;
        throw error;
      });
  }

  await connectionPromise;
};

app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.use("/students", async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("MongoDB connection error:", error);

    res.status(500).json({
      message: "Database connection failed"
    });
  }
});

app.get("/students", async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    console.error("Failed to load students:", error);

    res.status(500).json({
      message: error.message
    });
  }
});

app.post("/students", async (req, res) => {
  try {
    const { name, course, age } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof course !== "string" ||
      !course.trim() ||
      age === "" ||
      age === null ||
      age === undefined ||
      !Number.isFinite(Number(age)) ||
      Number(age) < 0
    ) {
      return res.status(400).json({
        message: "Please provide a valid name, course, and age"
      });
    }

    const student = new Student({
      name: name.trim(),
      course: course.trim(),
      age: Number(age)
    });

    await student.save();

    res.status(201).json(student);
  } catch (error) {
    console.error("Failed to add student:", error);

    res.status(500).json({
      message: error.message
    });
  }
});

app.put("/students/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, course, age } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid student ID"
      });
    }

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof course !== "string" ||
      !course.trim() ||
      age === "" ||
      age === null ||
      age === undefined ||
      !Number.isFinite(Number(age)) ||
      Number(age) < 0
    ) {
      return res.status(400).json({
        message: "Please provide a valid name, course, and age"
      });
    }

    const student = await Student.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        course: course.trim(),
        age: Number(age)
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    res.json(student);
  } catch (error) {
    console.error("Failed to update student:", error);

    res.status(500).json({
      message: error.message
    });
  }
});

app.delete("/students/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid student ID"
      });
    }

    const student = await Student.findByIdAndDelete(id);

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    res.json({
      message: "Student deleted successfully"
    });
  } catch (error) {
    console.error("Failed to delete student:", error);

    res.status(500).json({
      message: error.message
    });
  }
});

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
    