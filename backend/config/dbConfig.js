const mongoose = require("mongoose");

mongoose.connect("mongodb://socialsphereUser:StrongPassword123@localhost:27017/socialsphere", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("Connected to MongoDB ✅");
}).catch(err => {
  console.error("MongoDB connection error:", err);
});
