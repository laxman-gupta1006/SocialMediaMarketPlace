const mongoose = require("mongoose");

mongoose.connect("mongodb://socialsphereUser:StrongPassword123@192.168.2.250:27017/socialsphere", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("Connected to MongoDB ✅");
}).catch(err => {
  console.error("MongoDB connection error:", err);
});
