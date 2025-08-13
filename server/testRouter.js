// testRoute.js
import express from 'express';
import connectDB from '../config/db.js';
import User from '../models/User.js';

const router = express.Router();

// router.get('/test-user', async (req, res) => {
//     await connectDB();

//     try {
//         const user = await User.create({
//             _id: "test123",
//             name: "Test User",
//             email: "test@example.com",
//             image: "https://via.placeholder.com/150"
//         });

//         res.json({ success: true, user });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ success: false, error: err.message });
//     }
// });

router.get("/test", async (req, res) => {
  try {
    console.log("Testing DB connection...");
    const users = await User.find();
    res.json({ success: true, users });
  } catch (err) {
    console.error("Error in /test route:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
