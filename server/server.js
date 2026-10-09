
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Student = require("./models/Student");

require("dotenv").config();

const app = express();

app.use(cors({
    origin: [
        "http://localhost:5173",
        process.env.CLIENT_URL
    ].filter(Boolean),
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

let connectionPromise = null;

const connectDB = async () => {
    if (mongoose.connection.readyState === 1) {
        return;
    }

    if (!connectionPromise) {
        connectionPromise = mongoose.connect(process.env.MONGO_URI)
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

app.use(async (req, res, next) => {
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

app.get("/", (req, res) => {
    res.send("Server is running!");
});

app.get("/students", async (req, res) => {
    try {
        const students = await Student.find();
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post("/students", async (req, res) => {
    try {
        const student = new Student(req.body);
        await student.save();
        res.status(201).json(student);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.delete("/students/:id", async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id);

        if (!student) {
            return res.status(404).json({ message: "Not found" });
        }

        res.json({ message: "Student deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.put("/students/:id", async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!student) {
            return res.status(404).json({ message: "Not found" });
        }

        res.json(student);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = app;

if (require.main === module) {
    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}
