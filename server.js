const express = require("express");
const connectDB = require("./config/db");
const app = express();

// Connect to DB
connectDB();

// init middleware
app.use(express.json({ extended: false }));

// Define Route
app.use("/api/users", require("./route/api/users"));
app.use("/api/auth", require("./route/api/auth"));
app.use("/api/profile", require("./route/api/profile"));
app.use("/api/posts", require("./route/api/post"));

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("API running");
});

app.listen(PORT, () => console.log(`server is running on port ${PORT}`));
