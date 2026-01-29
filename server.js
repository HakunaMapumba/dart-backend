import express from "express";

const app = express();
app.use(express.static("public"));
app.use(express.json());

// Test-Route
app.get("/", (req, res) => {
  res.sendFile("home.html", { root: "public" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.logt("Server lläuft auf Port", ))

app.listen(3000, () => {
  console.log("Server läuft auf http://localhost:3000");
});
