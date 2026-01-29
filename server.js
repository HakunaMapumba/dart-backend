import express from "express";

const app = express();
app.use(express.json());

// Test-Route
app.get("/", (req, res) => {
  res.json({ message: "Backend läuft!" });
});

app.listen(3000, () => {
  console.log("Server läuft auf http://localhost:3000");
});
