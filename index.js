const express = require("express");

const cors = require("cors");

const dotenv = require("dotenv");

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

dotenv.config();

const app = express();

const port = process.env.PORT || 5000;

// MIDDLEWARE
app.use(cors());

app.use(express.json());

// MONGODB URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// CLIENT
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,

    strict: true,

    deprecationErrors: true,
  },
});

async function run() {
  try {
    // DATABASE
    const database = client.db("mediqueueDB");

    // COLLECTION
    const tutorsCollection = database.collection("tutors");

    const bookingsCollection = database.collection("bookings");

    // TEST ROUTE
    app.get("/", (req, res) => {
      res.send("MediQueue Server Running");
    });

    // ADD TUTOR
    app.post("/tutors", async (req, res) => {
      const tutor = req.body;

      const result = await tutorsCollection.insertOne(tutor);

      res.send(result);
    });

    // GET ALL TUTORS
    app.get("/tutors", async (req, res) => {
      const result = await tutorsCollection.find().toArray();

      res.send(result);
    });

    // GET MY TUTORS
    app.get("/my-tutors/:email", async (req, res) => {
      const email = req.params.email;

      const query = {
        email,
      };

      const result = await tutorsCollection.find(query).toArray();

      res.send(result);
    });

    // DELETE TUTOR
    app.delete("/tutors/:id", async (req, res) => {
      const id = req.params.id;

      const query = {
        _id: new ObjectId(id),
      };

      const result = await tutorsCollection.deleteOne(query);

      res.send(result);
    });

    // UPDATE TUTOR
    app.put("/tutors/:id", async (req, res) => {
      const id = req.params.id;

      const updatedTutor = req.body;

      const query = {
        _id: new ObjectId(id),
      };

      const updateDoc = {
        $set: updatedTutor,
      };

      const result = await tutorsCollection.updateOne(query, updateDoc);

      res.send(result);
    });

    // BOOKINGS
    app.post("/bookings", async (req, res) => {
      const booking = req.body;

      const result = await bookingsCollection.insertOne(booking);

      res.send(result);
    });

    // MY BOOKINGS
    app.get("/bookings/:email", async (req, res) => {
      const email = req.params.email;

      const query = {
        email,
      };

      const result = await bookingsCollection.find(query).toArray();

      res.send(result);
    });

    console.log("MongoDB Connected");
  } finally {
  }
}

run().catch(console.dir);

// SERVER
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
