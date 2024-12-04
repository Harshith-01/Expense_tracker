const express = require("express");
const cron = require("node-cron");

const app = express();
const port = 3000;

// In-memory storage for expenses and reports
const expenses = [];
const reports = { daily: [], weekly: [], monthly: [] };

// Constants
const validCategories = ["Food", "Travel", "Entertainment", "Utilities", "Other"];
const DATE_FORMAT_OPTIONS = { day: 'numeric', month: 'numeric', year: 'numeric' };

app.use(express.json());

// Helper function to filter expenses by category and date range
const filterExpenses = (category, startDate, endDate) => {
    let filtered = expenses;

    if (category) {
        filtered = filtered.filter((exp) => exp.category === category);
    }

    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        filtered = filtered.filter(
            (exp) => new Date(exp.date) >= start && new Date(exp.date) <= end
        );
    }

    return filtered;
};

// Add a new expense
app.post("/expenses", (req, res) => {
    const { category, amount, date } = req.body;

    if (!category || !amount || !date) {
        return res.status(400).json({ status: "error", message: "Missing required fields" });
    }

    if (!validCategories.includes(category)) {
        return res.status(400).json({ status: "error", message: `Invalid category` });
    }

    if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({ status: "error", message: "Amount must be a positive number" });
    }

    const expense = { id: expenses.length + 1, category, amount: parseFloat(amount), date: new Date(date) };
    expenses.push(expense);

    res.status(201).json({ status: "success", data: expense });
});

// Retrieve expenses
app.get("/expenses", (req, res) => {
    const { category, startDate, endDate } = req.query;
    const filteredExpenses = filterExpenses(category, startDate, endDate);

    res.json({ status: "success", data: filteredExpenses });
});

// Analyze spending patterns
app.get("/expenses/analysis", (req, res) => {
    const totalByCategory = expenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
    }, {});

    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    res.json({ status: "success", data: { totalByCategory, totalAmount } });
});

//Retrieve reports
app.get("/reports/:type", (req, res) => {
    const { type } = req.params;

    if (!["daily", "weekly", "monthly"].includes(type)) {
        return res.status(400).json({ status: "error", message: "Invalid report type" });
    }

    res.json({ status: "success", data: reports[type] });
});

// Generate report for a specific period
const generateReport = (period) => {
    const now = new Date();
    let startDate;

    if (period === "daily") {
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);  // Midnight of the previous day
    } else if (period === "weekly") {
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
    } else if (period === "monthly") {
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
    }

    // Filter expenses based on the start and end date
    const filteredExpenses = expenses.filter((exp) => {
        const expenseDate = new Date(exp.date);
        // Adjusting for time zone differences
        return expenseDate >= startDate && expenseDate <= now;
    });

    const totalByCategory = filteredExpenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
    }, {});

    const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    reports[period].push({
        period,
        generatedAt: new Date(),
        totalAmount,
        totalByCategory,
    });
};


//debug
app.get("/trigger-report", (req, res) => {
    generateReport("daily"); 
    res.send("Report triggered!");
});

// Schedule cron jobs to generate reports
cron.schedule("0 0 * * *", () => {
    console.log("Daily cron job triggered");
    generateReport("daily");
    console.log("Daily report generated.");
});

cron.schedule("0 0 * * 0", () => {
    console.log("Weekly cron job triggered");
    generateReport("weekly");
    console.log("Weekly report generated.");
});

cron.schedule("0 0 1 * *", () => {
    console.log("Monthly cron job triggered");
    generateReport("monthly");
    console.log("Monthly report generated.");
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
