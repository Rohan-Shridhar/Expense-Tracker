
const API_URL = "http://localhost:3000/api/expenses";

const expenseForm = document.getElementById("expense-form");
const expenseList = document.getElementById("expense-list");
const totalExpenses = document.getElementById("total-expenses");
const startDateInput = document.getElementById("start-date");
const endDateInput = document.getElementById("end-date");
const categoryFilter = document.getElementById("filter-category");
const searchInput = document.getElementById("search-input");

// Load and display expenses
async function loadExpenses() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to fetch expenses");
        }

        const expenses = await response.json();

        displayExpenses(expenses);
    } catch (error) {
        console.error("Error loading expenses:", error);
        expenseList.textContent = "Unable to load expenses. Please try again.";
        totalExpenses.textContent = "Total: unavailable";
    }
}

// Display expenses and calculate total
function displayExpenses(expenses) {
    expenseList.replaceChildren();

    const total = expenses.reduce(
        (sum, expense) => sum + expense.amount,
        0
    );
        
    document.getElementById("dashboard-total").textContent =
        `₹${total.toFixed(2)}`;

    document.getElementById("dashboard-count").textContent =
        expenses.length;

    const categoryTotals = {};

    expenses.forEach((expense) => {
        categoryTotals[expense.category] =
            (categoryTotals[expense.category] || 0) + expense.amount;
    });

    const topCategory = Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1])[0];

    document.getElementById("dashboard-category").textContent =
        topCategory ? topCategory[0] : "—";


    totalExpenses.textContent =
        `Total spent: ₹${total.toFixed(2)} (${expenses.length} expenses)`;

    if (expenses.length === 0) {
        const message = document.createElement("p");
        message.textContent = "No expenses yet. Add your first expense!";
        expenseList.appendChild(message);
        return;
    }

    expenses.forEach((expense) => {
        const card = document.createElement("article");
        card.className = "expense-card";

        const details = document.createElement("div");
        details.className = "expense-details";

        const title = document.createElement("h3");
        title.textContent = expense.title;

        const info = document.createElement("p");
        info.textContent =
            `${expense.category} • ${expense.date}`;

        const amount = document.createElement("p");
        amount.className = "expense-amount";
        amount.textContent = `₹${expense.amount.toFixed(2)}`;

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-button";

        deleteButton.addEventListener("click", () => {
            deleteExpense(expense.id);
        });

        details.append(title, info, amount);
        card.append(details, deleteButton);
        expenseList.appendChild(card);
    });
}

// Add a new expense
expenseForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const expense = {
        title: document.getElementById("title").value.trim(),
        amount: Number(document.getElementById("amount").value),
        category: document.getElementById("category").value,
        date: document.getElementById("date").value
    };

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(expense)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Failed to add expense");
        }

        expenseForm.reset();
        await loadExpenses();
    } catch (error) {
        console.error("Error adding expense:", error);
        alert(error.message);
    }
});

// Delete an expense
async function deleteExpense(id) {
    const confirmed = confirm("Are you sure you want to delete this expense?");

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Failed to delete expense");
        }

        await loadExpenses();
    } catch (error) {
        console.error("Error deleting expense:", error);
        alert(error.message);
    }
}


async function applyFilters() {
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;
    const selectedCategory = categoryFilter.value;
    const searchTerm = searchInput.value.trim().toLowerCase();

    if (startDate && endDate && startDate > endDate) {
        alert("The start date cannot be after the end date.");
        return;
    }

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to fetch expenses");
        }

        const expenses = await response.json();

        const filteredExpenses = expenses.filter((expense) => {
            const matchesStartDate = !startDate || expense.date >= startDate;
            const matchesEndDate = !endDate || expense.date <= endDate;
            const matchesCategory =
                !selectedCategory || expense.category === selectedCategory;
            const matchesSearch =
                expense.title.toLowerCase().includes(searchTerm);

            return matchesStartDate &&
                matchesEndDate &&
                matchesCategory &&
                matchesSearch;
        });

        displayExpenses(filteredExpenses);
    } catch (error) {
        console.error("Error filtering expenses:", error);
        alert("Unable to filter expenses. Please try again.");
    }
}

document.getElementById("filter-button")
    .addEventListener("click", applyFilters);

searchInput.addEventListener("input", applyFilters);
categoryFilter.addEventListener("change", applyFilters);
startDateInput.addEventListener("change", applyFilters);
endDateInput.addEventListener("change", applyFilters);

document.getElementById("clear-filter-button")
    .addEventListener("click", () => {
        startDateInput.value = "";
        endDateInput.value = "";
        categoryFilter.value = "";
        searchInput.value = "";

        loadExpenses();
    });

// Load expenses when the page opens
loadExpenses();
