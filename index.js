const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// ================= MIDDLEWARE =================
app.use(
  cors({
    origin: ["http://localhost:3000", "https://medique-ashy.vercel.app"],
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

// ================= COLLECTION VARIABLES =================
let tutorsCollection;
let bookingsCollection;
let usersCollection;

// ================= MONGODB URI =================
const uri = process.env.MONGODB_URI;

// ================= MONGODB CLIENT =================
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// ================= ROOT =================
app.get("/", (req, res) => {
  res.send("MediQueue Server Running");
});

// ================= JWT =================
app.post("/jwt", async (req, res) => {
  const user = req.body;

  const token = jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.send({ token });
});

// ================= VERIFY TOKEN =================
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send({
      message: "Unauthorized Access",
    });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
    if (error) {
      return res.status(401).send({
        message: "Unauthorized Access",
      });
    }

    req.decoded = decoded;
    next();
  });
};

// ================= GET ALL TUTORS =================
app.get("/tutors", async (req, res) => {
  try {
    const { search = "", startDate, endDate } = req.query;

    const query = {
      name: {
        $regex: search,
        $options: "i",
      },
    };

    if (startDate && endDate) {
      query.sessionStartDate = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    const result = await tutorsCollection.find(query).toArray();

    res.send(result);
  } catch (error) {
    console.log(error);

    res.status(500).send({
      message: "Failed to fetch tutors",
    });
  }
});

// ================= GET MY TUTORS =================
app.get("/my-tutors", verifyToken, async (req, res) => {
  try {
    const email = req.query.email;

    if (req.decoded.email !== email) {
      return res.status(403).send({
        message: "Forbidden Access",
      });
    }

    const query = { email };

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

    const result = await tutorsCollection.findOne({
      _id: new ObjectId(id),
    });

    res.send(result);
  } catch (error) {
    console.log(error);

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
    console.log(error);

    res.status(500).send({
      message: "Failed to add tutor",
    });
  }
});

// ================= UPDATE TUTOR =================
app.put("/tutors/:id", verifyToken, async (req, res) => {
  try {
    const id = req.params.id;
    const updatedData = req.body;

    if (req.decoded.email !== updatedData.email) {
      return res.status(403).send({
        message: "Forbidden Access",
      });
    }

    const result = await tutorsCollection.updateOne(
      {
        _id: new ObjectId(id),
      },
      {
        $set: updatedData,
      },
    );

    res.send(result);
  } catch (error) {
    console.log(error);

    res.status(500).send({
      message: "Failed to update tutor",
    });
  }
});

// ================= DELETE TUTOR =================
app.delete("/tutors/:id", verifyToken, async (req, res) => {
  try {
    const id = req.params.id;

    const tutor = await tutorsCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!tutor) {
      return res.status(404).send({
        message: "Tutor not found",
      });
    }

    if (req.decoded.email !== tutor.email) {
      return res.status(403).send({
        message: "Forbidden Access",
      });
    }

    const result = await tutorsCollection.deleteOne({
      _id: new ObjectId(id),
    });

    res.send(result);
  } catch (error) {
    console.log(error);

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

    const tutor = await tutorsCollection.findOne({
      _id: new ObjectId(tutorId),
    });

    if (!tutor) {
      return res.status(404).send({
        success: false,
        message: "Tutor not found",
      });
    }

    // CHECK SLOT
    if (tutor.totalSlot <= 0) {
      return res.send({
        success: false,
        message: "This session is fully booked",
      });
    }

    // PREVENT DUPLICATE BOOKING
    const existingBooking = await bookingsCollection.findOne({
      tutorId,
      studentEmail: bookingData.studentEmail,
    });

    if (existingBooking) {
      return res.send({
        success: false,
        message: "You already booked this tutor",
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
      insertedId: result.insertedId,
      message: "Booking successful",
    });
  } catch (error) {
    console.log(error);

    res.status(500).send({
      success: false,
      message: "Booking Failed",
    });
  }
});

// ================= GET MY BOOKINGS =================
app.get("/bookings", verifyToken, async (req, res) => {
  try {
    const email = req.query.email;

    if (req.decoded.email !== email) {
      return res.status(403).send({
        message: "Forbidden Access",
      });
    }

    const result = await bookingsCollection
      .find({
        studentEmail: email,
      })
      .sort({
        status: 1,
        bookedAt: -1,
      })
      .toArray();

    res.send(result);
  } catch (error) {
    console.log(error);

    res.status(500).send({
      message: "Failed To Fetch Bookings",
    });
  }
});

// ================= CANCEL BOOKING =================
app.patch("/bookings/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const booking = await bookingsCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!booking) {
      return res.status(404).send({
        message: "Booking not found",
      });
    }

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

// ================= DELETE BOOKING =================
app.delete("/bookings/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const result = await bookingsCollection.deleteOne({
      _id: new ObjectId(id),
    });

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

    const existingUser = await usersCollection.findOne({
      email: userData.email,
    });

    if (existingUser) {
      return res.send({
        message: "User already exists",
      });
    }

    const result = await usersCollection.insertOne(userData);

    res.send(result);
  } catch (error) {
    console.log(error);

    res.status(500).send({
      message: "Failed To Save User",
    });
  }
});

// ================= GET USERS =================
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

// ================= UPDATE USER =================
app.put("/users/:email", verifyToken, async (req, res) => {
  try {
    const email = req.params.email;
    const updatedUser = req.body;

    if (req.decoded.email !== email) {
      return res.status(403).send({
        message: "Forbidden Access",
      });
    }

    const result = await usersCollection.updateOne(
      { email },
      {
        $set: updatedUser,
      },
      { upsert: true },
    );

    res.send(result);
  } catch (error) {
    console.log(error);

    res.status(500).send({
      message: "Failed To Update User",
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
