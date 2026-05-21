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

let usersCollection;

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

// ================= GET ALL TUTORS WITH SEARCH =================
app.get("/tutors", async (req, res) => {
  try {
    const search = req.query.search || "";

    const query = {
      name: {
        $regex: search,
        $options: "i",
      },
    };

    const result = await tutorsCollection.find(query).toArray();

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

    const tutorId = bookingData.tutorId;

    // FIND TUTOR
    const tutor = await tutorsCollection.findOne({
      _id: new ObjectId(tutorId),
    });

    // TUTOR NOT FOUND
    if (!tutor) {
      return res.status(404).send({
        message: "Tutor not found",
      });
    }

    // CHECK SLOT
    if (tutor.totalSlot <= 0) {
      return res.send({
        success: false,
        message: "No available slots left",
      });
    }

    // SAVE BOOKING
    const result = await bookingsCollection.insertOne({
      ...bookingData,

      status: "booked",

      bookedAt: new Date(),
    });

    // DECREASE SLOT
    await tutorsCollection.updateOne(
      {
        _id: new ObjectId(tutorId),
      },
      {
        $inc: {
          totalSlot: -1,
        },
      },
    );

    res.send({
      success: true,
      message: "Booking successful",
      result,
    });
  } catch (error) {
    console.log(error);

    res.status(500).send({
      success: false,
      message: "Booking Failed",
    });
  }
});

// ================= Cancel BOOKING =================
app.patch("/bookings/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const booking = await bookingsCollection.findOne({
      _id: new ObjectId(id),
    });

    // BOOKING NOT FOUND
    if (!booking) {
      return res.status(404).send({
        message: "Booking not found",
      });
    }

    // UPDATE STATUS
    const result = await bookingsCollection.updateOne(
      {
        _id: new ObjectId(id),
      },
      {
        $set: {
          status: "cancelled",
        },
      },
    );

    // RETURN SLOT
    await tutorsCollection.updateOne(
      {
        _id: new ObjectId(booking.tutorId),
      },
      {
        $inc: {
          totalSlot: 1,
        },
      },
    );

    res.send({
      success: true,
      message: "Booking cancelled",
      result,
    });
  } catch (error) {
    console.log(error);

    res.status(500).send({
      success: false,
      message: "Failed to cancel booking",
    });
  }
});

// ================= GET MY BOOKINGS =================
app.get("/bookings", async (req, res) => {
  try {
    const email = req.query.email;

    const query = {
      studentEmail: email,
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

// ================= SAVE USER =================
app.post("/users", async (req, res) => {
  try {
    const userData = req.body;

    // CHECK EXISTING USER
    const query = {
      email: userData.email,
    };

    const existingUser = await usersCollection.findOne(query);

    // IF USER EXISTS
    if (existingUser) {
      return res.send({
        message: "User already exists",
      });
    }

    // SAVE NEW USER
    const result = await usersCollection.insertOne(userData);

    res.send(result);
  } catch (error) {
    console.log(error);

    res.status(500).send({
      message: "Failed To Save User",
    });
  }
});

// GET ALL USERS
app.get("/users", async (req, res) => {
  try {
    const result = await usersCollection.find().toArray();

    res.send(result);
  } catch (error) {
    console.log(error);

    res.status(500).send({
      message: "Failed To Fetch Users",
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

    usersCollection = database.collection("users");
  } catch (error) {
    console.log("MongoDB Connection Failed:", error);
  }
}

run().catch(console.dir);

// ================= SERVER =================
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
