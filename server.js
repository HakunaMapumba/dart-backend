import express from "express";

const app = express();

// Statische Dateien aus dem public-Ordner ausliefern
app.use(express.static("public"));
app.use(express.json());

// Startseite ausliefern
app.get("/", (req, res) => {
  res.sendFile("home.html", { root: "public" });
});

// Render-Port verwenden
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server läuft auf Port", PORT);
});

const mongoose= require ("mongoose");

mongoose. connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MonogDB connected"))
.catch(err => console.error(err));
  