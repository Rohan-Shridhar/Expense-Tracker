
  <h1> Expense Tracker </h1>
  <strong><i>Know where your money goes. Take control of where it grows.</i></strong>

<br></br>
<p align="center">
  A lightweight, full-stack expense tracking application built to make personal finance simpler, smarter, and more visual.
</p>


<p align="center">
  <img src="https://img.shields.io/badge/Status-Active-22c55e?style=for-the-badge" alt="Project status" />
  <img src="https://img.shields.io/badge/Frontend-Vanilla%20JS-f7df1e?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
  <img src="https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Database-SQLite-003b57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite" />
</p>

---
## 🚀 Features

| Feature | Description |
|---|---|
| 📊 **Financial Dashboard** | Get a quick overview of your total spending, expense count, and top spending category. |
| ➕ **Expense Management** | Add, view, edit, and delete expense records. |
| 🔎 **Live Search & Filters** | Find expenses by title, category, or date. |
| 🍩 **Category Breakdown** | Explore spending distribution with a doughnut chart. |
| 📈 **Monthly Spending** | Visualize monthly expenses using a bar chart. |
| 🎯 **Monthly Budget** | Set a budget and track it against your spending. |
| 📤 **CSV Export** | Export expense records for spreadsheets and further analysis. |
| 🌙 **Dark Mode** | Switch themes for a more comfortable experience. |
| 🔔 **Toast Notifications** | Get feedback when actions succeed or fail. |
| 🗄️ **Local Database** | Store expense records in SQLite on your machine. |

## 🛠️ Tech Stack

<p align="center">
  <img src="https://skillicons.dev/icons?i=html,css,js,nodejs,express,sqlite,git,github" alt="Technology stack" />
</p>

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Node.js, Express.js
- **Database:** SQLite with `better-sqlite3`
- **Charts:** Chart.js
- **Version Control:** Git and GitHub

No frontend framework required. Just the fundamentals, put to work.

## ⚡ Get Started

### Prerequisites

Install the following before running the application:

- [Node.js](https://nodejs.org/) — preferably a current LTS release
- [Git](https://git-scm.com/)

### 1. Clone the repository

```bash
git clone https://github.com/rohans-cs24/Expense-Tracker.git
cd Expense-Tracker
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the server

```bash
node server.js
```

### 4. Open the application

Visit:

```text
http://localhost:3000
```

🎉 That's it! Your local expense tracker is ready.

> **Note:** Run the application through the Express server rather than opening `index.html` directly. This allows the frontend to communicate with the backend API.

## 🧭 How It Works

```text
┌─────────────────────────────┐
│        Browser UI           │
│   HTML · CSS · JavaScript   │
└──────────────┬──────────────┘
               │ HTTP requests
               ▼
┌─────────────────────────────┐
│       Express API           │
│  CRUD · Validation · Routes │
└──────────────┬──────────────┘
               │ SQL queries
               ▼
┌─────────────────────────────┐
│         SQLite              │
│     Local expense data      │
└─────────────────────────────┘
```

### API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/health` | Check server health |
| `GET` | `/api/expenses` | Retrieve expenses |
| `POST` | `/api/expenses` | Create an expense |
| `PUT` | `/api/expenses/:id` | Update an expense |
| `DELETE` | `/api/expenses/:id` | Delete an expense |

## 📁 Project Structure

```text
Expense-Tracker/
├── public/
│   ├── index.html       # Application interface
│   ├── style.css        # Styling and themes
│   └── script.js        # Frontend logic and charts
├── database.js          # SQLite connection and schema
├── server.js            # Express server and API routes
├── seed.js              # Optional sample-data seeder
├── package.json         # Project metadata and dependencies
├── package-lock.json    # Locked dependency versions
├── .gitignore
└── README.md
```

*Your exact file structure may differ slightly depending on your latest changes.*

## 💾 Data & Privacy

- Expenses are stored in a local SQLite database.
- Each person running the application locally can have their own database.
- The database file is created automatically when the application initializes.
- Sample data can be added with the seed script, if configured.

**Important:** Do not commit your real expense database or personal financial data to GitHub. Keep `expenses.db` in your `.gitignore`.

The monthly budget and theme preferences are stored in browser `localStorage`, so they are specific to that browser.

## 🔐 Security Notes

- Never commit secrets, credentials, or personal financial records.
- Validate user input on the server.
- Keep dependencies updated.
- Use a proper persistent database before hosting the application for real users.

## 📜 License

[Apache License 2.0](./LICENSE)


<p align="center">
  <strong>
    <a href="https://rohan-mirjankar.is-a.dev">Rohan S Mirjankar</a>
  </strong>
</p>


