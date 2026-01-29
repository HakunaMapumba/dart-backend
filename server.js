import express from "express";

const app = express();

// Ordner für statische Dateien (HTML, CSS, JS, Bilder)
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
