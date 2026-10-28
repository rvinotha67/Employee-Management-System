/**
 * Centralized Data Layer for Employee Transition & Knowledge Management System
 * Syncs with LocalStorage & Provides CRUD Operations & Initial Seed Data
 */

// Storage Keys
const KEYS = {
  EMPLOYEES: 'ems_employees_db',
  RESIGNATIONS: 'ems_resignations_db',
  RETENTIONS: 'ems_retentions_db',
  KT: 'ems_kt_db',
  REPLACEMENTS: 'ems_replacements_db',
  TRANSITIONS: 'ems_transitions_db',
  SETTINGS: 'ems_settings_db'
};

const API_BASE_URL = (typeof window !== 'undefined' && window.API_BASE_URL) || 'http://localhost:3000/api';

const BackendSync = {
  async request(endpoint, options = {}) {
    if (typeof fetch !== 'function') return null;

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(errorText || `Request failed with status ${response.status}`);
      }

      const text = await response.text();
      if (typeof window !== 'undefined' && window.App && typeof window.App.updateBackendStatus === 'function') {
        window.App.updateBackendStatus('online', 'Backend online');
      }
      return text ? JSON.parse(text) : null;
    } catch (error) {
      if (typeof window !== 'undefined' && window.App && typeof window.App.updateBackendStatus === 'function') {
        window.App.updateBackendStatus('offline', 'Local fallback');
      }
      console.warn(`Backend sync request failed for ${endpoint}:`, error.message);
      return null;
    }
  },

  async syncAllFromBackend() {
    const routes = [
      { key: KEYS.EMPLOYEES, endpoint: '/employees' },
      { key: KEYS.RESIGNATIONS, endpoint: '/resignations' },
      { key: KEYS.RETENTIONS, endpoint: '/retentions' },
      { key: KEYS.KT, endpoint: '/kt' },
      { key: KEYS.REPLACEMENTS, endpoint: '/replacements' },
      { key: KEYS.TRANSITIONS, endpoint: '/transitions' },
      { key: KEYS.SETTINGS, endpoint: '/settings' }
    ];

    for (const route of routes) {
      const data = await this.request(route.endpoint);
      if (data !== null) {
        localStorage.setItem(route.key, JSON.stringify(data));
      }
    }
  },

  async create(endpoint, payload) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async update(endpoint, payload) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
};

// Initial Realistic Employee Dataset
const INITIAL_EMPLOYEES = [
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
  },
  {
    id: 'EMP-1004',
    name: 'Michael Vance',
    email: 'michael.vance@company.com',
    phone: '+1 (555) 987-6543',
    department: 'Marketing',
    designation: 'Growth Marketing Director',
    status: 'Active',
    joiningDate: '2019-11-05',
    experienceYears: 7.5,
    salary: 125000,
    skills: 'SEO, Performance Marketing, Hubspot, Paid Acquisition',
    manager: 'Sarah Jenkins (Marketing C-Level)',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    projects: ['Q3 Organic Search Campaign', 'Product Launch Event'],
    performanceSummary: 'Grew inbound pipeline by 42% year-over-year.'
  },
  {
    id: 'EMP-1005',
    name: 'Jessica Taylor',
    email: 'jessica.taylor@company.com',
    phone: '+1 (555) 456-7890',
    department: 'Human Resources',
    designation: 'HR Operations Manager',
    status: 'Active',
    joiningDate: '2021-04-12',
    experienceYears: 5.0,
    salary: 88000,
    skills: 'HRIS, Onboarding, Offboarding, Employee Engagement',
    manager: 'David Kim (VP People)',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    projects: ['Global HR Portal', 'Benefits Review 2026'],
    performanceSummary: 'Streamlined employee onboarding duration by 30%.'
  },
  {
    id: 'EMP-1006',
    name: 'David Kim',
    email: 'david.kim@company.com',
    phone: '+1 (555) 654-3210',
    department: 'Finance',
    designation: 'Financial Analyst Lead',
    status: 'Active',
    joiningDate: '2022-09-01',
    experienceYears: 4.0,
    salary: 95000,
    skills: 'Financial Modeling, Forecasting, NetSuite, Excel/VBA',
    manager: 'Robert Thorne (CFO)',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    projects: ['Annual Budget Planning', 'Cost Optimization Audit'],
    performanceSummary: 'Helped identify $120k in operational cost savings.'
  },
  {
    id: 'EMP-1007',
    name: 'Sophia Martinez',
    email: 'sophia.martinez@company.com',
    phone: '+1 (555) 789-0123',
    department: 'Sales',
    designation: 'Account Executive',
    status: 'Resigned',
    joiningDate: '2023-05-18',
    experienceYears: 3.5,
    salary: 85000,
    skills: 'B2B Sales, Salesforce, Deal Negotiation, Account Mgmt',
    manager: 'Michael Vance (VP Sales)',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    projects: ['Enterprise Sales Push Q2', 'Partner Channel Outreach'],
    performanceSummary: 'Achieved 115% quota attainment in Q1.'
  },
  {
    id: 'EMP-1008',
    name: 'Robert Thorne',
    email: 'robert.thorne@company.com',
    phone: '+1 (555) 210-9876',
    department: 'Engineering',
    designation: 'DevOps Lead Architect',
    status: 'Active',
    joiningDate: '2020-02-14',
    experienceYears: 8.0,
    salary: 135000,
    skills: 'Kubernetes, Terraform, AWS CI/CD, Python, Linux',
    manager: 'CTO Office',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    projects: ['Multi-Cloud Migration', 'Zero Downtime Deployment Pipeline'],
    performanceSummary: 'Maintained 99.99% system availability.'
  }
];

// Initial Resignation Requests Dataset
const INITIAL_RESIGNATIONS = [
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
  },
  {
    id: 'RES-5002',
    employeeId: 'EMP-1002',
    employeeName: 'Alex Rivera',
    department: 'Product',
    designation: 'Lead Product Manager',
    reason: 'Career Growth',
    noticeDate: '2026-07-20',
    lastWorkingDay: '2026-09-05',
    resignationLetter: 'Please accept this email as notification that I am resigning from my position as Lead Product Manager.',
    comments: 'Requesting smooth transition period for product roadmap review.',
    status: 'Retention Discussion',
    submittedAt: '2026-07-20T14:15:00.000Z'
  },
  {
    id: 'RES-5003',
    employeeId: 'EMP-1003',
    employeeName: 'Emily Chen',
    department: 'Design',
    designation: 'Senior UI/UX Designer',
    reason: 'Higher Education',
    noticeDate: '2026-06-10',
    lastWorkingDay: '2026-07-31',
    resignationLetter: 'I plan to pursue a Master in Human-Computer Interaction starting this fall.',
    comments: 'Open to part-time or flexible work options if available.',
    status: 'Approved',
    submittedAt: '2026-06-10T11:00:00.000Z'
  },
  {
    id: 'RES-5004',
    employeeId: 'EMP-1007',
    employeeName: 'Sophia Martinez',
    department: 'Sales',
    designation: 'Account Executive',
    reason: 'Relocation',
    noticeDate: '2026-05-01',
    lastWorkingDay: '2026-06-15',
    resignationLetter: 'Relocating to West Coast due to family requirements.',
    comments: 'Completed client contact handovers.',
    status: 'Approved',
    submittedAt: '2026-05-01T10:00:00.000Z'
  }
];

// Initial Retention Discussions Dataset
const INITIAL_RETENTIONS = [
  {
    id: 'RET-8001',
    resignationId: 'RES-5003',
    employeeId: 'EMP-1003',
    employeeName: 'Emily Chen',
    meetingDate: '2026-06-18',
    discussionNotes: 'Discussed employee higher education plans. Offered flexible remote hours (20 hrs/week) and educational tuition sponsorship.',
    promotionOffered: 'Lead UX Architect',
    salaryHikeOffered: 15,
    internalTransfer: 'Design Research Lab',
    flexibleWork: 'Hybrid / Part-Time (20 hrs)',
    otherBenefits: '$5,000 Annual Education Stipend',
    finalDecision: 'Employee Stayed',
    recordedAt: '2026-06-18T16:00:00.000Z'
  },
  {
    id: 'RET-8002',
    resignationId: 'RES-5001',
    employeeId: 'EMP-1001',
    employeeName: 'Sarah Jenkins',
    meetingDate: '2026-07-18',
    discussionNotes: 'Offered 12% salary raise and Principal Tech Lead position. Employee expressed strong interest in cloud startup environment and decided to proceed with resignation.',
    promotionOffered: 'Principal Engineer',
    salaryHikeOffered: 12,
    internalTransfer: 'Cloud Innovation Group',
    flexibleWork: 'Full Remote',
    otherBenefits: 'Stock Options Allocation',
    finalDecision: 'Employee Resigned',
    recordedAt: '2026-07-18T15:30:00.000Z'
  }
];

// Initial Knowledge Transfer (KT) Dataset
const INITIAL_KT = [
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
  },
  {
    id: 'KT-3002',
    employeeId: 'EMP-1001',
    employeeName: 'Sarah Jenkins',
    category: 'Daily Responsibilities',
    title: 'Daily Deployment & Health Monitoring',
    description: 'Check Datadog alert boards every morning at 9:00 AM, inspect AWS ECS service metrics, and triage Sentry error spikes.',
    priority: 'High',
    status: 'Completed',
    link: 'https://datadog.com/dashboard/billing',
    updatedAt: '2026-07-23'
  },
  {
    id: 'KT-3003',
    employeeId: 'EMP-1001',
    employeeName: 'Sarah Jenkins',
    category: 'Development Environment',
    title: 'Local Docker Environment Setup SOP',
    description: 'Run docker-compose up --build. Set local .env variables using 1Password vault "Eng-Local-Dev". Run pnpm db:migrate.',
    priority: 'Medium',
    status: 'In Progress',
    link: 'https://wiki.company.internal/sop/local-docker',
    updatedAt: '2026-07-25'
  },
  {
    id: 'KT-3004',
    employeeId: 'EMP-1001',
    employeeName: 'Sarah Jenkins',
    category: 'Client Information',
    title: 'Enterprise Billing Webhooks API Key Management',
    description: 'Key contacts for Enterprise Client ACME Corp & TechCorp for API integrations. Renewal dates and key webhook endpoints.',
    priority: 'High',
    status: 'Verified',
    link: '',
    updatedAt: '2026-07-26'
  },
  {
    id: 'KT-3005',
    employeeId: 'EMP-1001',
    employeeName: 'Sarah Jenkins',
    category: 'Checklist',
    title: 'Repository Admin Rights Handover & AWS Key Rotation',
    description: 'Transfer admin access on GitHub org repos and revoke personal IAM tokens upon last day.',
    priority: 'High',
    status: 'Not Started',
    link: '',
    updatedAt: '2026-07-28'
  },
  {
    id: 'KT-3006',
    employeeId: 'EMP-1002',
    employeeName: 'Alex Rivera',
    category: 'Projects',
    title: 'Q3 Mobile App Launch Specification & User Stories',
    description: 'Jira backlog list for v3.2 release, wireframes on Figma, and stakeholder sync matrix.',
    priority: 'High',
    status: 'In Progress',
    link: 'https://jira.company.internal/browse/MOB-300',
    updatedAt: '2026-07-24'
  }
];

// Initial Replacement Pairings Dataset
const INITIAL_REPLACEMENTS = [
  {
    id: 'REP-4001',
    resigningEmpId: 'EMP-1001',
    resigningEmpName: 'Sarah Jenkins',
    replacementEmpId: 'EMP-1008',
    replacementEmpName: 'Robert Thorne',
    department: 'Engineering',
    reportingManager: 'CTO Office',
    startDate: '2026-08-01',
    trainingPeriodDays: 30,
    status: 'In Handover',
    notes: 'Robert taking over lead maintenance of Billing API & DB.',
    createdAt: '2026-07-20'
  },
  {
    id: 'REP-4002',
    resigningEmpId: 'EMP-1007',
    resigningEmpName: 'Sophia Martinez',
    replacementEmpId: 'EMP-1006',
    replacementEmpName: 'David Kim',
    department: 'Sales',
    reportingManager: 'Michael Vance',
    startDate: '2026-06-01',
    trainingPeriodDays: 14,
    status: 'Completed',
    notes: 'Accounts successfully transferred in Salesforce.',
    createdAt: '2026-05-10'
  }
];

// Initial Transition Progress (6 Pillars) Dataset
const INITIAL_TRANSITIONS = [
  {
    id: 'TRN-9001',
    resigningEmpId: 'EMP-1001',
    resigningEmpName: 'Sarah Jenkins',
    replacementEmpName: 'Robert Thorne',
    documentationScore: 90, // %
    trainingScore: 80,
    shadowScore: 70,
    ktScore: 85,
    handoverScore: 60,
    approvalScore: 50,
    overallStatus: 'In Progress',
    lastUpdated: '2026-07-28'
  },
  {
    id: 'TRN-9002',
    resigningEmpId: 'EMP-1002',
    resigningEmpName: 'Alex Rivera',
    replacementEmpName: 'Emily Chen',
    documentationScore: 40,
    trainingScore: 30,
    shadowScore: 20,
    ktScore: 35,
    handoverScore: 10,
    approvalScore: 0,
    overallStatus: 'Pending',
    lastUpdated: '2026-07-27'
  }
];

// Initial Settings
const INITIAL_SETTINGS = {
  companyName: 'Acme Enterprise Systems Inc.',
  hrEmail: 'hr-support@company.com',
  defaultHandoverDays: 30,
  notificationsEnabled: true,
  emailAlerts: true,
  language: 'English',
  theme: 'light'
};

// Main DataStore Object
const DataStore = {
  async refreshFromBackend() {
    if (typeof fetch !== 'function') return false;

    const routes = [
      { key: KEYS.EMPLOYEES, endpoint: '/employees' },
      { key: KEYS.RESIGNATIONS, endpoint: '/resignations' },
      { key: KEYS.RETENTIONS, endpoint: '/retentions' },
      { key: KEYS.KT, endpoint: '/kt' },
      { key: KEYS.REPLACEMENTS, endpoint: '/replacements' },
      { key: KEYS.TRANSITIONS, endpoint: '/transitions' },
      { key: KEYS.SETTINGS, endpoint: '/settings' }
    ];

    try {
      for (const route of routes) {
        const response = await fetch(`${API_BASE_URL}${route.endpoint}`, { cache: 'no-store' });
        if (!response.ok) continue;
        const data = await response.json();
        if (data !== null) {
          localStorage.setItem(route.key, JSON.stringify(data));
        }
      }
      if (typeof window !== 'undefined' && window.App && typeof window.App.updateBackendStatus === 'function') {
        window.App.updateBackendStatus('online', 'Backend online');
      }
      return true;
    } catch (error) {
      if (typeof window !== 'undefined' && window.App && typeof window.App.updateBackendStatus === 'function') {
        window.App.updateBackendStatus('offline', 'Local fallback');
      }
      console.warn('Backend refresh failed, retaining local data.', error);
      return false;
    }
  },

  // Initialize datasets if missing
  init() {
    if (!localStorage.getItem(KEYS.EMPLOYEES)) {
      this.save(KEYS.EMPLOYEES, INITIAL_EMPLOYEES);
    }
    if (!localStorage.getItem(KEYS.RESIGNATIONS)) {
      this.save(KEYS.RESIGNATIONS, INITIAL_RESIGNATIONS);
    }
    if (!localStorage.getItem(KEYS.RETENTIONS)) {
      this.save(KEYS.RETENTIONS, INITIAL_RETENTIONS);
    }
    if (!localStorage.getItem(KEYS.KT)) {
      this.save(KEYS.KT, INITIAL_KT);
    }
    if (!localStorage.getItem(KEYS.REPLACEMENTS)) {
      this.save(KEYS.REPLACEMENTS, INITIAL_REPLACEMENTS);
    }
    if (!localStorage.getItem(KEYS.TRANSITIONS)) {
      this.save(KEYS.TRANSITIONS, INITIAL_TRANSITIONS);
    }
    if (!localStorage.getItem(KEYS.SETTINGS)) {
      this.save(KEYS.SETTINGS, INITIAL_SETTINGS);
    }

    if (typeof fetch === 'function') {
      this.refreshFromBackend().catch(() => {});
    }
  },

  // Helper getters & setters
  get(key) {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch (e) {
      console.error(`Error reading ${key} from storage:`, e);
      return [];
    }
  },

  save(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  },

  resetAllSampleData() {
    this.save(KEYS.EMPLOYEES, INITIAL_EMPLOYEES);
    this.save(KEYS.RESIGNATIONS, INITIAL_RESIGNATIONS);
    this.save(KEYS.RETENTIONS, INITIAL_RETENTIONS);
    this.save(KEYS.KT, INITIAL_KT);
    this.save(KEYS.REPLACEMENTS, INITIAL_REPLACEMENTS);
    this.save(KEYS.TRANSITIONS, INITIAL_TRANSITIONS);
    this.save(KEYS.SETTINGS, INITIAL_SETTINGS);
    return true;
  },

  /* ---------------- EMPLOYEES CRUD ---------------- */
  getEmployees() { return this.get(KEYS.EMPLOYEES); },
  getEmployeeById(id) {
    return this.getEmployees().find(emp => emp.id === id) || null;
  },
  addEmployee(empData) {
    const list = this.getEmployees();
    const newId = `EMP-${Math.floor(1000 + Math.random() * 9000)}`;
    const avatar = empData.avatar && empData.avatar.trim() !== ''
      ? empData.avatar
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(empData.name)}&background=2563eb&color=fff`;

    const newEmp = {
      id: newId,
      ...empData,
      salary: parseFloat(empData.salary) || 0,
      experienceYears: parseFloat(empData.experienceYears) || 1,
      status: empData.status || 'Active',
      avatar
    };
    list.unshift(newEmp);
    this.save(KEYS.EMPLOYEES, list);
    BackendSync.create('/employees', newEmp).catch(() => {});
    return newEmp;
  },
  updateEmployee(id, updatedData) {
    const list = this.getEmployees();
    const index = list.findIndex(emp => emp.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updatedData };
      this.save(KEYS.EMPLOYEES, list);
      BackendSync.update(`/employees/${id}`, list[index]).catch(() => {});
      return list[index];
    }
    return null;
  },
  deleteEmployee(id) {
    const list = this.getEmployees();
    const filtered = list.filter(emp => emp.id !== id);
    if (filtered.length !== list.length) {
      this.save(KEYS.EMPLOYEES, filtered);
      BackendSync.delete(`/employees/${id}`).catch(() => {});
      return true;
    }
    return false;
  },

  /* ---------------- RESIGNATIONS CRUD ---------------- */
  getResignations() { return this.get(KEYS.RESIGNATIONS); },
  addResignation(resData) {
    const list = this.getResignations();
    const newId = `RES-${Math.floor(5000 + Math.random() * 4000)}`;
    const emp = this.getEmployeeById(resData.employeeId);
    
    const newRes = {
      id: newId,
      ...resData,
      employeeName: emp ? emp.name : resData.employeeName,
      department: emp ? emp.department : resData.department,
      designation: emp ? emp.designation : resData.designation,
      status: resData.status || 'Pending',
      submittedAt: new Date().toISOString()
    };
    list.unshift(newRes);
    this.save(KEYS.RESIGNATIONS, list);
    BackendSync.create('/resignations', newRes).catch(() => {});

    // Update employee status to 'Resigning'
    if (emp) {
      this.updateEmployee(emp.id, { status: 'Resigning' });
    }
    return newRes;
  },
  updateResignation(id, updatedData) {
    const list = this.getResignations();
    const index = list.findIndex(r => r.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updatedData };
      this.save(KEYS.RESIGNATIONS, list);
      BackendSync.update(`/resignations/${id}`, list[index]).catch(() => {});
      return list[index];
    }
    return null;
  },

  /* ---------------- RETENTIONS CRUD ---------------- */
  getRetentions() { return this.get(KEYS.RETENTIONS); },
  addRetention(retData) {
    const list = this.getRetentions();
    const newId = `RET-${Math.floor(8000 + Math.random() * 1000)}`;
    const emp = this.getEmployeeById(retData.employeeId);

    const newRet = {
      id: newId,
      ...retData,
      employeeName: emp ? emp.name : retData.employeeName,
      recordedAt: new Date().toISOString()
    };
    list.unshift(newRet);
    this.save(KEYS.RETENTIONS, list);
    BackendSync.create('/retentions', newRet).catch(() => {});

    // Update resignation status & employee status based on decision
    if (retData.resignationId) {
      const resStatus = retData.finalDecision === 'Employee Stayed' ? 'Cancelled' : 'Approved';
      this.updateResignation(retData.resignationId, { status: resStatus });
    }
    if (emp) {
      const empStatus = retData.finalDecision === 'Employee Stayed' ? 'Retained' : 'Resigned';
      this.updateEmployee(emp.id, { status: empStatus });
    }
    return newRet;
  },

  /* ---------------- KNOWLEDGE TRANSFER (KT) CRUD ---------------- */
  getKTItems() { return this.get(KEYS.KT); },
  getKTByEmployee(employeeId) {
    return this.getKTItems().filter(item => item.employeeId === employeeId);
  },
  addKTItem(ktData) {
    const list = this.getKTItems();
    const newId = `KT-${Math.floor(3000 + Math.random() * 6000)}`;
    const emp = this.getEmployeeById(ktData.employeeId);

    const newKT = {
      id: newId,
      ...ktData,
      employeeName: emp ? emp.name : (ktData.employeeName || 'Staff Member'),
      status: ktData.status || 'Not Started',
      priority: ktData.priority || 'Medium',
      updatedAt: new Date().toISOString().split('T')[0]
    };
    list.unshift(newKT);
    this.save(KEYS.KT, list);
    BackendSync.create('/kt', newKT).catch(() => {});
    return newKT;
  },
  updateKTItem(id, updatedData) {
    const list = this.getKTItems();
    const index = list.findIndex(k => k.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updatedData, updatedAt: new Date().toISOString().split('T')[0] };
      this.save(KEYS.KT, list);
      BackendSync.update(`/kt/${id}`, list[index]).catch(() => {});
      return list[index];
    }
    return null;
  },
  deleteKTItem(id) {
    const list = this.getKTItems();
    const filtered = list.filter(k => k.id !== id);
    if (filtered.length !== list.length) {
      this.save(KEYS.KT, filtered);
      BackendSync.delete(`/kt/${id}`).catch(() => {});
      return true;
    }
    return false;
  },

  /* ---------------- REPLACEMENTS CRUD ---------------- */
  getReplacements() { return this.get(KEYS.REPLACEMENTS); },
  addReplacement(repData) {
    const list = this.getReplacements();
    const newId = `REP-${Math.floor(4000 + Math.random() * 5000)}`;
    const resigningEmp = this.getEmployeeById(repData.resigningEmpId);
    const replacementEmp = this.getEmployeeById(repData.replacementEmpId);

    const newRep = {
      id: newId,
      ...repData,
      resigningEmpName: resigningEmp ? resigningEmp.name : 'Outgoing Employee',
      replacementEmpName: replacementEmp ? replacementEmp.name : 'Incoming Employee',
      status: repData.status || 'In Handover',
      createdAt: new Date().toISOString().split('T')[0]
    };
    list.unshift(newRep);
    this.save(KEYS.REPLACEMENTS, list);
    BackendSync.create('/replacements', newRep).catch(() => {});

    // Auto-create initial transition progress record if missing
    this.ensureTransitionRecord(repData.resigningEmpId, resigningEmp ? resigningEmp.name : 'Outgoing', replacementEmp ? replacementEmp.name : 'Incoming');
    return newRep;
  },

  /* ---------------- TRANSITIONS CRUD ---------------- */
  getTransitions() { return this.get(KEYS.TRANSITIONS); },
  getTransitionByEmployee(employeeId) {
    return this.getTransitions().find(t => t.resigningEmpId === employeeId) || null;
  },
  ensureTransitionRecord(resigningEmpId, resigningEmpName, replacementEmpName) {
    const list = this.getTransitions();
    let record = list.find(t => t.resigningEmpId === resigningEmpId);
    if (!record) {
      record = {
        id: `TRN-${Math.floor(9000 + Math.random() * 900)}`,
        resigningEmpId,
        resigningEmpName,
        replacementEmpName: replacementEmpName || 'Assigned Candidate',
        documentationScore: 30,
        trainingScore: 20,
        shadowScore: 10,
        ktScore: 25,
        handoverScore: 0,
        approvalScore: 0,
        overallStatus: 'In Progress',
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      list.unshift(record);
      this.save(KEYS.TRANSITIONS, list);
    }
    return record;
  },
  updateTransition(id, updatedScores) {
    const list = this.getTransitions();
    const index = list.findIndex(t => t.id === id);
    if (index !== -1) {
      list[index] = {
        ...list[index],
        ...updatedScores,
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      this.save(KEYS.TRANSITIONS, list);
      BackendSync.update(`/transitions/${id}`, list[index]).catch(() => {});
      return list[index];
    }
    return null;
  },

  /* ---------------- SETTINGS ---------------- */
  getSettings() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(KEYS.SETTINGS)) || INITIAL_SETTINGS;
    } catch (e) {
      return INITIAL_SETTINGS;
    }
  },
  saveSettings(newSettings) {
    const current = this.getSettings();
    const updated = { ...current, ...newSettings };
    this.save(KEYS.SETTINGS, updated);
    BackendSync.update('/settings', updated).catch(() => {});
    return updated;
  }
};

// Initialize on script load
DataStore.init();
