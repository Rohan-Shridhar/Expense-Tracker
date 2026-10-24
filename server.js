const express = require("express");
const db = require("./database");

const app = express();
const PORT = 3000;

app.use(express.json());
app.get("/", (req,res) => {
    res.send("Express backend running.");
});

app.get("/api/health", (req,res) => {
    res.json({
        status: "OK",
        message: "Express API is healthy"
    });
});

app.get("/api/expenses", (req,res) => {
    const expenses = db.prepare(
        "SELECT * FROM expenses ORDER BY date DESC"
    ).all();
    res.json(expenses);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});