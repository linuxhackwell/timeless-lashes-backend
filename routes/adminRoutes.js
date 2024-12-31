const express = require("express");
const bcrypt = require("bcrypt");
const multer = require("multer");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const Booking = require("../models/Booking");
const Service = require("../models/Service"); // Replace with the actual path to your Service model
const Employee = require("../models/Employee"); // Replace with the actual path to your Employee model
const router = express.Router();

// Configure Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Directory to save uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });


// Register Admin
router.post("/register", upload.single("profilePicture"), async (req, res) => {
  const { name, email, password, secretKey } = req.body;

  if (secretKey !== process.env.ADMIN_SECRET_KEY) {
    return res.status(403).json({ success: false, message: "Invalid secret key" });
  }

  try {
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ success: false, message: "Admin already exists" });
    }

    const profilePicture = req.file ? `/uploads/${req.file.filename}` : null;

    const admin = new Admin({ name, email, password, secretKey, profilePicture, // Save the file path in the database
    });
    await admin.save();

    res.status(201).json({ success: true, message: "Admin registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Middleware to parse cookies
router.use(cookieParser());

// Login Admin
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate email and password
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "3h", // Token expiration
    });

    res.status(200).json({ success: true, token, message: "Login successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// Logout Admin
router.post("/logout", (req, res) => {
  res.clearCookie("adminToken");
  res.status(200).json({ success: true, message: "Logged out successfully" });
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract token from Authorization header

  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.adminId = decoded.id;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: "Invalid token" });
  }
};

// GET /api/admin/profile
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const admin = await Admin.findById(req.adminId).select("-password"); // Exclude password from response

    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    res.status(200).json(admin);
  } catch (error) {
    console.error("Error fetching admin profile:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Update admin profile
router.put("/update", verifyToken, upload.single("profilePicture"), async (req, res) => {
  try {
    const adminId = req.adminId; // Get the admin ID from the token
    const { name, email } = req.body;
    const profilePicture = req.file ? `/uploads/${req.file.filename}` : undefined;

    // Build the update object dynamically
    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (profilePicture) updates.profilePicture = profilePicture;

    // Update the admin details in the database
    const updatedAdmin = await Admin.findByIdAndUpdate(
      adminId,
      { $set: updates },
      { new: true, runValidators: true } // Return the updated document and validate fields
    ).select("-password"); // Exclude password from the response

    if (!updatedAdmin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    res.status(200).json({ success: true, admin: updatedAdmin, message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating admin profile:", error);
    res.status(500).json({ success: false, message: "Failed to update profile" });
  }
});




// Fetch total revenue
router.get("/revenue", async (req, res) => {
  try {
    const bookings = await Booking.find();
    const totalRevenue = bookings.reduce((total, booking) => {
      const servicePrice = parseFloat(booking.service.price) || 0;
      const employeeFee = parseFloat(booking.employee.fee) || 0;
      return total + servicePrice + employeeFee;
    }, 0);
    res.status(200).json({ totalRevenue });
  } catch (error) {
    console.error("Error calculating revenue:", error);
    res.status(500).json({ message: "Failed to fetch revenue" });
  }
});


// Fetch analytics summary
router.get("/analytics", async (req, res) => {
  try {
    const servicesCount = await Service.countDocuments();
    const employeesCount = await Employee.countDocuments();
    const appointmentsCount = await Booking.countDocuments();

    const analyticsData = [
      { label: "Total Services", value: servicesCount },
      { label: "Total Employees", value: employeesCount },
      { label: "Total Appointments", value: appointmentsCount },
    ];

    res.status(200).json(analyticsData);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
});



router.get("/settings", (req, res) => {
  // Simulate fetching settings from DB
  const settings = { theme: "light", notifications: true };
  res.status(200).json(settings);
});

router.put("/settings", (req, res) => {
  try {
    const { theme, notifications } = req.body;
    // Simulate saving settings to DB
    res.status(200).json({ theme, notifications });
  } catch (error) {
    res.status(500).json({ message: "Failed to save settings" });
  }
});


module.exports = router;
