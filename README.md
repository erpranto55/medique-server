# MediQueue Server – Tutor Booking System API

This is the backend server of the MediQueue Tutor Booking System. <br>
The server handles authentication, tutor management, booking management, JWT authorization, and MongoDB database operations.<br>

---

## Live API

Server Live Link: https://your-server-url.vercel.app

---

## Features

- JWT Authentication & Authorization<br>
- Add, Update & Delete Tutor APIs<br>
- Tutor Booking Management System<br>
- Booking Cancellation System<br>
- Session Slot Management<br>
- Search Tutors with MongoDB Regex<br>
- Filter Tutors by Date Range<br>
- Protected Private Routes with JWT<br>
- RESTful API Structure<br>
- MongoDB Atlas Database Integration<br>

---

## Technologies Used

- Node.js<br>
- Express.js<br>
- MongoDB<br>
- JWT<br>
- dotenv<br>
- cors<br>
- cookie-parser<br>

---

## API Endpoints

### Authentication

| Method | Endpoint | Description |<br>
| ------ | -------- | ------------------ |<br>
| POST | `/jwt` | Generate JWT Token |<br>

---

### Tutors

| Method | Endpoint | Description |<br>
| ------ | ------------- | ---------------------- |<br>
| GET | `/tutors` | Get All Tutors |<br>
| GET | `/tutors/:id` | Get Single Tutor |<br>
| POST | `/tutors` | Add Tutor |<br>
| PUT | `/tutors/:id` | Update Tutor |<br>
| DELETE | `/tutors/:id` | Delete Tutor |<br>
| GET | `/my-tutors` | Get Logged User Tutors |<br>

---

### Bookings

| Method | Endpoint | Description |<br>
| ------ | --------------- | ----------------- |<br>
| POST | `/bookings` | Create Booking |<br>
| GET | `/bookings` | Get User Bookings |<br>
| PATCH | `/bookings/:id` | Cancel Booking |<br>
| DELETE | `/bookings/:id` | Delete Booking |<br>

---

### Users

| Method | Endpoint | Description |<br>
| ------ | -------- | ------------- |<br>
| POST | `/users` | Save User |<br>
| GET | `/users` | Get All Users |<br>

---

## Environment Variables

Create a `.env` file in the root directory:<br>

```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

---

## Run Locally

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
nodemon index.js
```

### Start Production Server

```bash
node index.js
```

---

## JWT Authentication

This server uses JWT authentication for private routes.<br>

After login:<br>

- JWT token is generated<br>
- Token is stored on client side<br>
- Token must be sent in Authorization headers<br>

Example:

```js
authorization: Bearer your_token
```

---

## Developer

### ER Pranto

Frontend & Backend Developer

[Portfolio](https://erpranto.vercel.app/)<br>
[LinkedIn](https://www.linkedin.com/in/erpranto55/)<br>

---

## 📄 License

This project is created for educational purposes only.<br>
