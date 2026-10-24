const express = require("express");
const db = require("./database");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors({
    origin: "http://127.0.0.1:5500"
}));
app.use(express.static("public"));
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

// Retrive all expenses from the database
app.get("/api/expenses", (req,res) => {
    const expenses = db.prepare(
        "SELECT * FROM expenses ORDER BY date DESC"
    ).all();
    res.json(expenses);
});

// Add a new expense to the database
app.post("/api/expenses", (req,res) => {
    const { title, amount, category, date } = req.body;

    if(!title || typeof title !== "string"  || !title.trim()){
        return res.status(400)
        .json({ error: "Title is required and must be a non-empty string." });  
    }
    if(typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0){
        return res.status(400)
        .json({ error: "Amount is required and must be a finite positive number." });  
    }
    if(!category || typeof category !== "string"  || !category.trim()){
        return res.status(400)
        .json({ error: "Category is required and must be a non-empty string." });  
    }
    if(!date || typeof date !== "string"  || !/^\d{4}-\d{2}-\d{2}$/.test(date)){
        return res.status(400)
        .json({ error: "Date is required and must use YYYY-MM-DD format" });  
    }

    const result = db.prepare(`
        INSERT INTO expenses (title, amount, category, date)
        VALUES (?, ?, ?, ?)
    `);
    result.run(title.trim(), amount, category.trim(), date);

    const expense = db.prepare(
        "SELECT * FROM expenses WHERE id = ?"
    ).get(result.lastInsertRowid);

    return res.status(201)
    .json(expense);
});

// Delete an expense from the database
app.delete("/api/expenses/:id", (req,res) => {
    const id = Number(req.params.id);

    if(!Number.isInteger(id)  || id <= 0){
        return res.status(400)
        .json({
            error: "Invalid expense ID"
        });
    }

    const result = db.prepare(
        "DELETE FROM expenses WHERE id = ?"
    ).run(id);

    if(result.changes === 0){
        return res.status(404)
        .json({
            error: `Expense with id ${id} not found`
        });
    }

    return res.status(200)
    .json({
        message: `Expense with ${id} deleted successfully`
    });
});

// Update an expense in the database
app.put("/api/expenses/:id", (req, res) => {
    const id = Number(req.params.id);
    const { title, amount, category, date } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            error: "Invalid expense ID"
        });
    }

    if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({
            error: "Title is required"
        });
    }

    if (typeof amount !== "number" ||
        !Number.isFinite(amount) || amount <= 0) {
        return res.status(400).json({
            error: "Amount must be a positive number"
        });
    }

    if (typeof category !== "string" || !category.trim()) {
        return res.status(400).json({
            error: "Category is required"
        });
    }

    if (typeof date !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({
            error: "Date must use YYYY-MM-DD format"
        });
    }

    const result = db.prepare(`
        UPDATE expenses
        SET title = ?, amount = ?, category = ?, date = ?
        WHERE id = ?
    `).run(title.trim(), amount, category.trim(), date, id);

    if (result.changes === 0) {
        return res.status(404).json({
            error: `Expense with ID ${id} not found`
        });
    }

    const updatedExpense = db.prepare(
        "SELECT * FROM expenses WHERE id = ?"
    ).get(id);

    return res.json(updatedExpense);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});