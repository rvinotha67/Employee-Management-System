const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_PATH)) {
    const seed = {
      employees: [
        {
          id: 'EMP-1001',
          name: 'Sarah Jenkins',
          email: 'sarah.jenkins@company.com',
          phone: '+1 (555) 234-5678',
          department: 'Engineering',
          designation: 'Senior Full Stack Developer',
          status: 'Resigning',
          joiningDate: '2021-03-15',
          experienceYears: 5.5,
          salary: 115000,
          skills: 'Node.js, React, PostgreSQL, Docker, AWS',
          manager: 'Robert Thorne (Engineering VP)',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
          projects: ['Core Billing Platform', 'Customer Gateway Microservices'],
          performanceSummary: 'Exceeds Expectations. Key technical contributor to cloud migration.'
        },
        {
          id: 'EMP-1002',
          name: 'Alex Rivera',
          email: 'alex.rivera@company.com',
          phone: '+1 (555) 876-5432',
          department: 'Product',
          designation: 'Lead Product Manager',
          status: 'Resigning',
          joiningDate: '2020-08-10',
          experienceYears: 6.0,
          salary: 130000,
          skills: 'Product Roadmap, User Research, Agile/Scrum, Mixpanel',
          manager: 'Elena Rostova (Chief Product Officer)',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
          projects: ['Enterprise Mobile App', 'AI Analytics Integration'],
          performanceSummary: 'Outstanding leadership. Delivered Q2 mobile roadmap 2 weeks ahead.'
        },
        {
          id: 'EMP-1003',
          name: 'Emily Chen',
          email: 'emily.chen@company.com',
          phone: '+1 (555) 345-6789',
          department: 'Design',
          designation: 'Senior UI/UX Designer',
          status: 'Retained',
          joiningDate: '2022-01-20',
          experienceYears: 4.2,
          salary: 98000,
          skills: 'Figma, Design Systems, Prototyping, Usability Testing',
          manager: 'Alex Rivera (Lead Product Manager)',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          projects: ['Design System 2.0', 'Checkout Flow Redesign'],
          performanceSummary: 'Consistently high quality visual designs and user research feedback.'
        }
      ],
      resignations: [
        {
          id: 'RES-5001',
          employeeId: 'EMP-1001',
          employeeName: 'Sarah Jenkins',
          department: 'Engineering',
          designation: 'Senior Full Stack Developer',
          reason: 'Better Offer',
          noticeDate: '2026-07-15',
          lastWorkingDay: '2026-08-30',
          resignationLetter: 'I am writing to formally announce my resignation from the Senior Developer role. I have accepted an offer that aligns closer with my long-term career goals.',
          comments: 'Available to assist with full technical handover and SOP documentation.',
          status: 'Approved',
          submittedAt: '2026-07-15T09:30:00.000Z'
        }
      ],
      retentions: [
        {
          id: 'RET-8001',
          resignationId: 'RES-5001',
          employeeId: 'EMP-1001',
          employeeName: 'Sarah Jenkins',
          meetingDate: '2026-06-18',
          discussionNotes: 'Discussed employee higher education plans. Offered flexible remote hours (20 hrs/week) and educational tuition sponsorship.',
          promotionOffered: 'Lead UX Architect',
          salaryHikeOffered: 15,
          internalTransfer: 'Design Research Lab',
          flexibleWork: 'Hybrid / Part-Time (20 hrs)',
          otherBenefits: '$5,000 Annual Education Stipend',
          finalDecision: 'Employee Stayed',
          recordedAt: '2026-06-18T16:00:00.000Z'
        }
      ],
      kt: [
        {
          id: 'KT-3001',
          employeeId: 'EMP-1001',
          employeeName: 'Sarah Jenkins',
          category: 'Projects',
          title: 'Core Billing Architecture & Database Schemas',
          description: 'Detailed schema walkthrough for Postgres billing DB, Stripe webhook listeners, and recurring invoice cron workers.',
          priority: 'High',
          status: 'Completed',
          link: 'https://github.com/company/billing-core',
          updatedAt: '2026-07-22'
        }
      ],
      replacements: [
        {
          id: 'REP-4001',
          resigningEmpId: 'EMP-1001',
          resigningEmpName: 'Sarah Jenkins',
          replacementEmpId: 'EMP-1002',
          replacementEmpName: 'Alex Rivera',
          department: 'Engineering',
          reportingManager: 'CTO Office',
          startDate: '2026-08-01',
          trainingPeriodDays: 30,
          status: 'In Handover',
          notes: 'Robert taking over lead maintenance of Billing API & DB.',
          createdAt: '2026-07-20'
        }
      ],
      transitions: [
        {
          id: 'TRN-9001',
          resigningEmpId: 'EMP-1001',
          resigningEmpName: 'Sarah Jenkins',
          replacementEmpName: 'Alex Rivera',
          documentationScore: 90,
          trainingScore: 80,
          shadowScore: 70,
          ktScore: 85,
          handoverScore: 60,
          approvalScore: 50,
          overallStatus: 'In Progress',
          lastUpdated: '2026-07-28'
        }
      ],
      settings: {
        companyName: 'Acme Enterprise Systems Inc.',
        hrEmail: 'hr-support@company.com',
        defaultHandoverDays: 30,
        notificationsEnabled: true,
        emailAlerts: true,
        language: 'English',
        theme: 'light'
      }
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(seed, null, 2));
  }
}

function readDb() {
  ensureDataFile();
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function writeDb(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function generateId(prefix, start) {
  return `${prefix}-${Math.floor(start + Math.random() * 9000)}`;
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please enter both email and password.' });
  }

  const normalized = String(email).trim().toLowerCase();
  const isAdmin = normalized.includes('admin');
  const safePassword = String(password).trim();

  if (normalized === 'admin@company.com' && safePassword === 'password123' || normalized === 'hr.manager@company.com' && safePassword === 'password123') {
    const formattedName = normalized.split('@')[0].split('.').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
    const user = {
      name: formattedName || 'HR Admin',
      email: normalized,
      role: isAdmin ? 'Senior HR Director' : 'People Operations Manager',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formattedName)}&background=2563eb&color=fff`,
      loggedInAt: new Date().toISOString()
    };
    return res.json({ success: true, user });
  }

  return res.status(401).json({ success: false, message: 'Invalid email or password.' });
});

app.get('/api/employees', (req, res) => {
  const db = readDb();
  res.json(db.employees || []);
});

app.get('/api/employees/:id', (req, res) => {
  const db = readDb();
  const employee = (db.employees || []).find(item => item.id === req.params.id);
  if (!employee) return res.status(404).json({ message: 'Employee not found' });
  res.json(employee);
});

app.post('/api/employees', (req, res) => {
  const db = readDb();
  const employee = { ...req.body, id: generateId('EMP', 1000) };
  db.employees = [employee, ...(db.employees || [])];
  writeDb(db);
  res.status(201).json(employee);
});

app.put('/api/employees/:id', (req, res) => {
  const db = readDb();
  const index = (db.employees || []).findIndex(item => item.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Employee not found' });
  db.employees[index] = { ...db.employees[index], ...req.body };
  writeDb(db);
  res.json(db.employees[index]);
});

app.delete('/api/employees/:id', (req, res) => {
  const db = readDb();
  const before = db.employees.length;
  db.employees = (db.employees || []).filter(item => item.id !== req.params.id);
  if (db.employees.length === before) return res.status(404).json({ message: 'Employee not found' });
  writeDb(db);
  res.json({ success: true });
});

app.get('/api/resignations', (req, res) => {
  const db = readDb();
  res.json(db.resignations || []);
});

app.post('/api/resignations', (req, res) => {
  const db = readDb();
  const resignation = { id: generateId('RES', 5000), ...req.body, submittedAt: new Date().toISOString() };
  db.resignations = [resignation, ...(db.resignations || [])];
  if (req.body.employeeId) {
    const employee = (db.employees || []).find(item => item.id === req.body.employeeId);
    if (employee) employee.status = 'Resigning';
  }
  writeDb(db);
  res.status(201).json(resignation);
});

app.put('/api/resignations/:id', (req, res) => {
  const db = readDb();
  const index = (db.resignations || []).findIndex(item => item.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Resignation not found' });
  db.resignations[index] = { ...db.resignations[index], ...req.body };
  writeDb(db);
  res.json(db.resignations[index]);
});

app.get('/api/retentions', (req, res) => {
  const db = readDb();
  res.json(db.retentions || []);
});

app.post('/api/retentions', (req, res) => {
  const db = readDb();
  const retention = { id: generateId('RET', 8000), ...req.body, recordedAt: new Date().toISOString() };
  db.retentions = [retention, ...(db.retentions || [])];
  writeDb(db);
  res.status(201).json(retention);
});

app.get('/api/kt', (req, res) => {
  const db = readDb();
  res.json(db.kt || []);
});

app.post('/api/kt', (req, res) => {
  const db = readDb();
  const item = { id: generateId('KT', 3000), ...req.body, updatedAt: new Date().toISOString().split('T')[0] };
  db.kt = [item, ...(db.kt || [])];
  writeDb(db);
  res.status(201).json(item);
});

app.put('/api/kt/:id', (req, res) => {
  const db = readDb();
  const index = (db.kt || []).findIndex(item => item.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Knowledge item not found' });
  db.kt[index] = { ...db.kt[index], ...req.body, updatedAt: new Date().toISOString().split('T')[0] };
  writeDb(db);
  res.json(db.kt[index]);
});

app.delete('/api/kt/:id', (req, res) => {
  const db = readDb();
  const before = db.kt.length;
  db.kt = (db.kt || []).filter(item => item.id !== req.params.id);
  if (db.kt.length === before) return res.status(404).json({ message: 'Knowledge item not found' });
  writeDb(db);
  res.json({ success: true });
});

app.get('/api/replacements', (req, res) => {
  const db = readDb();
  res.json(db.replacements || []);
});

app.post('/api/replacements', (req, res) => {
  const db = readDb();
  const replacement = { id: generateId('REP', 4000), ...req.body, createdAt: new Date().toISOString().split('T')[0] };
  db.replacements = [replacement, ...(db.replacements || [])];
  writeDb(db);
  res.status(201).json(replacement);
});

app.get('/api/transitions', (req, res) => {
  const db = readDb();
  res.json(db.transitions || []);
});

app.put('/api/transitions/:id', (req, res) => {
  const db = readDb();
  const index = (db.transitions || []).findIndex(item => item.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Transition not found' });
  db.transitions[index] = { ...db.transitions[index], ...req.body, lastUpdated: new Date().toISOString().split('T')[0] };
  writeDb(db);
  res.json(db.transitions[index]);
});

app.get('/api/settings', (req, res) => {
  const db = readDb();
  res.json(db.settings || {});
});

app.put('/api/settings', (req, res) => {
  const db = readDb();
  db.settings = { ...(db.settings || {}), ...req.body };
  writeDb(db);
  res.json(db.settings);
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Server error' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
