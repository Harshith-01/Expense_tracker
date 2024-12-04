Expense Tracker and Report Generation
This project is a basic Expense Tracker API that allows you to manage expenses, view analysis, and generate daily, weekly, and monthly reports. It is built with Node.js and Express, and uses the node-cron package to schedule automatic report generation.

Features
Add Expenses: Allows users to add expenses with a category, amount, and date.
Retrieve Expenses: Fetches expenses with optional filters for category and date range.
Expense Analysis: Provides an analysis of expenses by category and total amount spent.
Generate Reports: Automatically generates daily, weekly, and monthly reports using cron jobs.
Report Retrieval: Retrieves generated reports for daily, weekly, and monthly periods.
Technologies Used
Node.js: JavaScript runtime for building the server.
Express: Web framework for building the API.
node-cron: Cron job scheduler for automatically generating reports.
In-memory storage: Stores expenses and reports in memory.
