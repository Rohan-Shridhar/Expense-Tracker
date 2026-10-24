const API_URL = "http://localhost:3000/api/expenses";

const expenseForm = document.getElementById("expense-form");
const expenseList = document.getElementById("expense-list");
const totalExpenses = document.getElementById("total-expenses");
const startDateInput = document.getElementById("start-date");
const endDateInput = document.getElementById("end-date");
const categoryFilter = document.getElementById("filter-category");
const searchInput = document.getElementById("search-input");

let categoryChart = null;
let monthlyChart = null;

const budgetForm = document.getElementById("budget-form");
const budgetAmountInput = document.getElementById("budget-amount");

const budgetSpent = document.getElementById("budget-spent");
const budgetRemaining = document.getElementById("budget-remaining");
const budgetProgress = document.getElementById("budget-progress");

let monthlyBudget = Number(localStorage.getItem("monthlyBudget")) || 0;
budgetAmountInput.value = monthlyBudget || "";


function showToast(message, type = "success") {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");

    toast.className = `toast ${type === "error" ? "error" : ""}`;
    toast.setAttribute("role", type === "error" ? "alert" : "status");
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Load and display expenses
async function loadExpenses() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to fetch expenses");
        }

        const expenses = await response.json();

        displayExpenses(expenses);
        updateBudget(expenses);
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

    const chartCanvas = document.getElementById("category-chart");

    if (chartCanvas && window.Chart) {
        const labels = Object.keys(categoryTotals);
        const values = Object.values(categoryTotals);

        if (categoryChart) {
            categoryChart.destroy();
        }

        categoryChart = new Chart(chartCanvas, {
            type: "doughnut",
            data: {
                labels,
                datasets: [{
                    label: "Spending",
                    data: values
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: "bottom"
                    },
                    tooltip: {
                        callbacks: {
                            label(context) {
                                return `${context.label}: ₹${context.parsed.toFixed(2)}`;
                            }
                        }
                    }
                }
            }
        });
    }
        
    const monthlyTotals = {};

    expenses.forEach((expense) => {
        const month = expense.date.slice(0, 7); // YYYY-MM
        monthlyTotals[month] = (monthlyTotals[month] || 0) + expense.amount;
    });

    const monthlyLabels = Object.keys(monthlyTotals).sort();
    const monthlyValues = monthlyLabels.map((month) => monthlyTotals[month]);

    const monthlyCanvas = document.getElementById("monthly-chart");

    if (monthlyCanvas && window.Chart) {
        if (monthlyChart) {
            monthlyChart.destroy();
        }

        monthlyChart = new Chart(monthlyCanvas, {
            type: "bar",
            data: {
                labels: monthlyLabels,
                datasets: [{
                    label: "Monthly Spending (₹)",
                    data: monthlyValues,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: "Amount (₹)"
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: "Month"
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label(context) {
                                return `Spent: ₹${context.parsed.y.toFixed(2)}`;
                            }
                        }
                    }
                }
            }
        });
    }


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

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.textContent = "Edit";
        editButton.className = "edit-button";

        editButton.addEventListener("click", () => {
            document.getElementById("cancel-edit-button").hidden = false;
            document.getElementById("title").value = expense.title;
            document.getElementById("amount").value = expense.amount;
            document.getElementById("category").value = expense.category;
            document.getElementById("date").value = expense.date;

            expenseForm.dataset.editingId = expense.id;

            expenseForm.querySelector('button[type="submit"]').textContent =
                "Save Changes";

            expenseForm.scrollIntoView({ behavior: "smooth" });
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-button";

        deleteButton.addEventListener("click", () => {
            deleteExpense(expense.id);
        });

        details.append(title, info, amount);
        const actions = document.createElement("div");
        actions.className = "expense-actions";
        actions.append(editButton, deleteButton);

        card.append(details, actions);
        expenseList.appendChild(card);
    });
}

// Add a new expense
expenseForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const wasEditing = Boolean(expenseForm.dataset.editingId);

    const expense = {
        title: document.getElementById("title").value.trim(),
        amount: Number(document.getElementById("amount").value),
        category: document.getElementById("category").value,
        date: document.getElementById("date").value
    };

    try {
        const editingId = expenseForm.dataset.editingId;

        const url = editingId
            ? `${API_URL}/${editingId}`
            : API_URL;

        const method = editingId ? "PUT" : "POST";

        const response = await fetch(url, {
            method,
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
    delete expenseForm.dataset.editingId;

    expenseForm.querySelector('button[type="submit"]').textContent =
        "Add Expense";

    cancelEditButton.hidden = true;

    showToast(wasEditing
        ? "Expense updated successfully!"
        : "Expense added successfully!");

    await loadExpenses();
    } catch (error) {
        console.error("Error adding expense:", error);
        showToast(error.message, "error");;
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
        showToast(error.message, "error");;
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

const cancelEditButton = document.getElementById("cancel-edit-button");

cancelEditButton.addEventListener("click", () => {
    expenseForm.reset();
    delete expenseForm.dataset.editingId;

    expenseForm.querySelector('button[type="submit"]').textContent =
        "Add Expense";

    cancelEditButton.hidden = true;
});


function updateBudget(expenses) {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(
        now.getMonth() + 1
    ).padStart(2, "0")}`;

    const monthlySpent = expenses
        .filter((expense) => expense.date.startsWith(currentMonth))
        .reduce((sum, expense) => sum + expense.amount, 0);

    const remaining = monthlyBudget - monthlySpent;

    budgetSpent.textContent = `Spent this month: ₹${monthlySpent.toFixed(2)}`;
    budgetRemaining.textContent =
        `Remaining: ₹${remaining.toFixed(2)}`;

    budgetProgress.value = monthlyBudget > 0
        ? Math.min((monthlySpent / monthlyBudget) * 100, 100)
        : 0;

    budgetProgress.max = 100;

    budgetProgress.style.accentColor =
        monthlyBudget > 0 && monthlySpent > monthlyBudget
            ? "#dc2626"
            : "#16a34a";
}

budgetForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const amount = Number(budgetAmountInput.value);

    if (!Number.isFinite(amount) || amount <= 0) {
        alert("Please enter a valid budget greater than zero.");
        return;
    }

    monthlyBudget = amount;
    localStorage.setItem("monthlyBudget", String(monthlyBudget));

    loadExpenses();
});


document.getElementById("export-button")
    .addEventListener("click", async () => {
        try {
            const response = await fetch(API_URL);

            if (!response.ok) {
                throw new Error("Failed to fetch expenses");
            }

            const expenses = await response.json();

            const startDate = startDateInput.value;
            const endDate = endDateInput.value;
            const selectedCategory = categoryFilter.value;
            const searchTerm = searchInput.value.trim().toLowerCase();

            if (startDate && endDate && startDate > endDate) {
                alert("The start date cannot be after the end date.");
                return;
            }

            const filteredExpenses = expenses.filter((expense) => {
                return (
                    (!startDate || expense.date >= startDate) &&
                    (!endDate || expense.date <= endDate) &&
                    (!selectedCategory ||
                        expense.category === selectedCategory) &&
                    expense.title.toLowerCase().includes(searchTerm)
                );
            });

            const escapeCSV = (value) =>
                `"${String(value).replace(/"/g, '""')}"`;

            const rows = [
                ["ID", "Title", "Amount", "Category", "Date"],
                ...filteredExpenses.map((expense) => [
                    expense.id,
                    expense.title,
                    expense.amount,
                    expense.category,
                    expense.date
                ])
            ];

            const csv = rows
                .map((row) => row.map(escapeCSV).join(","))
                .join("\r\n");

            const blob = new Blob(["\uFEFF" + csv], {
                type: "text/csv;charset=utf-8;"
            });

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.download = "expenses.csv";
            link.click();

            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error exporting expenses:", error);
            alert("Unable to export expenses. Please try again.");
        }
    });


const themeToggle = document.getElementById("theme-toggle");

// Restore the saved theme when the page opens
const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
}

function updateThemeButton() {
    const isDark = document.body.classList.contains("dark-mode");

    themeToggle.textContent = isDark
        ? "☀️ Light Mode"
        : "🌙 Dark Mode";
}

updateThemeButton();

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");

    const isDark = document.body.classList.contains("dark-mode");

    localStorage.setItem("theme", isDark ? "dark" : "light");

    updateThemeButton();
});

// Load expenses when the page opens
loadExpenses();