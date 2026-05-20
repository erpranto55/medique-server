const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

dotenv.config();

const app = express();

const port = process.env.PORT || 5000;

// ================= MIDDLEWARE =================
app.use(cors());

app.use(express.json());

// ================= VARIABLES =================
let tutorsCollection;

let bookingsCollection;

// ================= MONGODB URI =================
const uri = process.env.MONGODB_URI;

// ================= CLIENT =================
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,

    strict: true,

    deprecationErrors: true,
  },
});

// ================= ROOT ROUTE =================
app.get("/", (req, res) => {
  res.send("MediQueue Server Running");
});

// ================= GET ALL TUTORS =================
app.get("/tutors", async (req, res) => {
  try {
    const result = await tutorsCollection.find().toArray();

    res.send(result);
  } catch (error) {
    console.log("Error fetching tutors:", error);

    res.status(500).send({
      message: "Failed to fetch tutors",
    });
  }
});

// ================= GET MY TUTORS =================
app.get("/my-tutors", async (req, res) => {
  try {
    const email = req.query.email;

    const query = {
      email: email,
    };

    const result = await tutorsCollection.find(query).toArray();

    res.send(result);
  } catch (error) {
    console.log(error);

    res.status(500).send({
      message: "Failed To Fetch Tutors",
    });
  }
});

// ================= GET SINGLE TUTOR =================
app.get("/tutors/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const query = {
      _id: new ObjectId(id),
    };

    const result = await tutorsCollection.findOne(query);

    res.send(result);
  } catch (error) {
    console.log("Error fetching tutor:", error);

    res.status(500).send({
      message: "Failed to fetch tutor",
    });
  }
});

// ================= ADD TUTOR =================
app.post("/tutors", async (req, res) => {
  try {
    const tutorData = req.body;

    const result = await tutorsCollection.insertOne(tutorData);

    res.send(result);
  } catch (error) {
    console.log("Error adding tutor:", error);

    res.status(500).send({
      message: "Failed to add tutor",
    });
  }
});

// ================= UPDATE TUTOR =================
app.put("/tutors/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const updatedData = req.body;

    const query = {
      _id: new ObjectId(id),
    };

    const updatedDoc = {
      $set: updatedData,
    };

    const result = await tutorsCollection.updateOne(query, updatedDoc);

    res.send(result);
  } catch (error) {
    console.log("Error updating tutor:", error);

    res.status(500).send({
      message: "Failed to update tutor",
    });
  }
});

// ================= DELETE TUTOR =================
app.delete("/tutors/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const query = {
      _id: new ObjectId(id),
    };

    const result = await tutorsCollection.deleteOne(query);

    res.send(result);
  } catch (error) {
    console.log("Error deleting tutor:", error);

    res.status(500).send({
      message: "Failed to delete tutor",
    });
  }
});

// ================= CREATE BOOKING =================
app.post("/bookings", async (req, res) => {
  try {
    const bookingData = req.body;

    const result = await bookingsCollection.insertOne(bookingData);

    res.send(result);
  } catch (error) {
    console.log("Booking Error:", error);

    res.status(500).send({
      message: "Booking Failed",
    });
  }
});

// ================= GET MY BOOKINGS =================
app.get("/bookings", async (req, res) => {
  try {
    const email = req.query.email;

    const query = {
      email: email,
    };

    const result = await bookingsCollection.find(query).toArray();

    res.send(result);
  } catch (error) {
    console.log(error);

    res.status(500).send({
      message: "Failed To Fetch Bookings",
    });
  }
});

// ================= DELETE BOOKING =================
app.delete("/bookings/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const query = {
      _id: new ObjectId(id),
    };

    const result = await bookingsCollection.deleteOne(query);

    res.send(result);
  } catch (error) {
    console.log(error);

    res.status(500).send({
      message: "Failed To Delete Booking",
    });
  }
});

// ================= DATABASE CONNECTION =================
async function run() {
  try {
    await client.connect();

    await client.db("admin").command({
      ping: 1,
    });

    console.log("MongoDB Connected Successfully");

    const database = client.db("mediqueueDB");

    tutorsCollection = database.collection("tutors");

    bookingsCollection = database.collection("bookings");
  } catch (error) {
    console.log("MongoDB Connection Failed:", error);
  }
}

run().catch(console.dir);

// ================= SERVER =================
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
