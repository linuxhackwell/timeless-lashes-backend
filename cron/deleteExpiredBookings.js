// cron/deleteExpiredBookings.js
const cron = require("node-cron");
const Booking = require("../models/Booking"); // Adjust the path to your model

// Schedule a task to delete expired bookings
cron.schedule("0 * * * *", async () => {
  try {
    const now = new Date();
    
    const expiredBookings = await Booking.find({
      $or: [
        { date: { $lt: now.toISOString().split("T")[0] } }, // Past dates
        { date: now.toISOString().split("T")[0], timeSlot: { $lt: `${now.getHours()}:${now.getMinutes()}` } } // Today, earlier times
      ],
    });

    if (expiredBookings.length > 0) {
      const deleteCount = await Booking.deleteMany({
        $or: [
          { date: { $lt: now.toISOString().split("T")[0] } },
          { date: now.toISOString().split("T")[0], timeSlot: { $lt: `${now.getHours()}:${now.getMinutes()}` } }
        ],
      });
      console.log(`Deleted ${deleteCount.deletedCount} expired bookings at ${new Date().toISOString()}.`);
    }
  } catch (error) {
    console.error("Error during cleanup of expired bookings:", error);
  }
});
