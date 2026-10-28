# NexusHR - Responsive Employee Management System

A modern, full-featured Employee Management System web application built with **HTML5**, **CSS3**, **Vanilla JavaScript (ES6+)**, **Bootstrap 5.3**, **Bootstrap Icons**, and **Chart.js**.

---

## 📁 Project Folder Structure

```
creinx/
├── index.html           # Authentication & Glassmorphism Login Page
├── dashboard.html       # Main Analytics Dashboard (KPIs, Chart.js charts, recent activity)
├── employees.html       # Staff Directory & CRUD Management Page
├── css/
│   └── style.css        # Core Design System, CSS variables, dark/light theme, custom scrollbars, component styles
├── js/
│   ├── data.js          # Centralized Data Store (LocalStorage sync, sample dataset, CRUD & search methods)
│   ├── auth.js          # Session handling, authentication guard, demo login helpers
│   ├── dashboard.js     # Dashboard metrics calculation, Chart.js charts, recent hires widget
│   ├── employees.js     # Employee data table, live search, multi-filter, pagination & modal handlers
│   └── app.js           # Shared app UI controller (Theme toggle, sidebar toggle, toast notifications)
└── README.md            # Comprehensive project documentation & usage guide
```

---

## 🌟 Key Features

1. **Authentication Portal (`index.html`)**:
   - Modern glassmorphism UI with ambient background glow effects.
   - Form validation & quick demo account auto-fill buttons (`Admin Role`, `HR Manager`).
   - Session guard that restricts unauthenticated access to system pages.

2. **Analytics Dashboard (`dashboard.html`)**:
   - **KPI Summary Cards**: Animated counters for Total Staff, Active Employees, Departments Count, and Average Salary.
   - **Interactive Charts (Chart.js)**:
     - **Department Breakdown**: Doughnut chart with percentages.
     - **Status Distribution**: Stacked bar chart showing Active, On Leave, and Inactive breakdown per department.
   - **Recent Activity Feed**: Real-time mock audit feed of recent actions.
   - **Recently Onboarded**: Quick view widget for newly joined team members.

3. **Employee Directory & CRUD Management (`employees.html`)**:
   - **Data Table**: Displays employee avatars, full names, email addresses, department badges, designations, statuses, joining dates, salaries, and interactive action buttons.
   - **Real-Time Live Search**: Instantly filters by name, email, designation, or employee ID.
   - **Multi-Criteria Filtering & Sorting**: Filter by Department & Employment Status; sort by Name, Date, or Salary.
   - **Pagination**: Configurable page sizes (6, 10, 25 items) with next/previous controls.
   - **Add & Edit Modal**: Validated forms for creating and editing employee profiles.
   - **View Profile Modal**: Detailed employee ID badge popup.
   - **Delete Confirmation Modal**: Safety prompt before deleting records.
   - **Export to CSV**: Export filtered or full employee lists directly into a `.csv` spreadsheet file.

4. **Modern Design System & Responsive Layout**:
   - **Light / Dark Mode**: Persistent theme toggle powered by CSS variables.
   - **Responsive Sidebar**: Collapsible navigation with mobile overlay drawer.
   - **Bootstrap 5.3 + Custom Styling**: Sleek cards, custom badges, floating Toast notifications.

---

## 🚀 Getting Started / Local Execution

Since this project uses modern standard frontend technologies (HTML, CSS, JS, Bootstrap CDN), no build steps or `node_modules` installation are required!

### Method 1: Double-Click / Direct Browser Opening
Simply open [`index.html`](file:///c:/Users/user/Desktop/creinx/index.html) in any modern Web Browser (Google Chrome, Microsoft Edge, Mozilla Firefox, Safari).

### Method 2: Local HTTP Server (e.g., Live Server / `http-server`)
If using VS Code or Node.js:
```bash
# Using npx http-server
npx http-server ./ -p 8080
```
Then navigate to `http://localhost:8080` in your web browser.

---

## 💡 Quick Demo Credentials

You can click the **Admin Role** or **HR Manager** buttons on the login screen to sign in instantly:
- **Admin Email**: `admin@company.com`
- **HR Manager Email**: `hr.manager@company.com`
- **Password**: `password123` (or any string)

To reset data back to the default sample dataset at any time, click **Reset Demo Data** in the left sidebar menu.
