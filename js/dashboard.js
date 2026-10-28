/**
 * Executive Dashboard Controller
 * KPI Calculations, Chart.js Visualizations & Recent Activity Feeds
 */

const Dashboard = {
  init() {
    // Auth Guard
    Auth.requireAuth();

    this.renderKPIs();
    this.renderUpcomingResignations();
    this.renderRecentActivity();
    this.renderCharts();
  },

  // Calculate & update 6 main KPI metrics
  renderKPIs() {
    const employees = DataStore.getEmployees();
    const resignations = DataStore.getResignations();
    const retentions = DataStore.getRetentions();
    const ktItems = DataStore.getKTItems();

    const totalEmp = employees.length;
    const activeEmp = employees.filter(e => e.status === 'Active').length;
    const planningToLeave = employees.filter(e => e.status === 'Resigning' || e.status === 'Planning to Leave').length;
    const retainedEmp = retentions.filter(r => r.finalDecision === 'Employee Stayed').length;
    const ktPending = ktItems.filter(k => k.status === 'Not Started' || k.status === 'In Progress').length;
    const ktCompleted = ktItems.filter(k => k.status === 'Completed' || k.status === 'Verified').length;

    document.getElementById('kpiTotalEmployees').textContent = totalEmp;
    document.getElementById('kpiActiveEmployees').textContent = activeEmp;
    document.getElementById('kpiPlanningToLeave').textContent = planningToLeave;
    document.getElementById('kpiRetainedEmployees').textContent = retainedEmp;
    document.getElementById('kpiKTPending').textContent = ktPending;
    document.getElementById('kpiKTCompleted').textContent = ktCompleted;
  },

  // Render Upcoming Resignations Table Widget
  renderUpcomingResignations() {
    const resignations = DataStore.getResignations();
    const container = document.getElementById('upcomingResignationsTableBody');
    if (!container) return;

    if (resignations.length === 0) {
      container.innerHTML = `
        <tr>
          <td colspan="5" class="text-center py-4 text-muted">
            <i class="bi bi-inbox fs-3 d-block mb-1"></i>
            No active resignation requests found.
          </td>
        </tr>
      `;
      return;
    }

    const html = resignations.slice(0, 5).map(res => {
      const statusClass = res.status === 'Approved' ? 'badge-resigning' :
                          res.status === 'Retention Discussion' ? 'badge-review' :
                          res.status === 'Cancelled' ? 'badge-active' : 'badge-pending';

      return `
        <tr>
          <td>
            <div class="fw-semibold text-main">${res.employeeName}</div>
            <div class="small text-muted">${res.designation}</div>
          </td>
          <td><span class="badge-dept">${res.department}</span></td>
          <td><i class="bi bi-calendar-event me-1 text-primary"></i>${res.lastWorkingDay}</td>
          <td><span class="badge-status ${statusClass}">${res.status}</span></td>
          <td>
            <div class="action-btn-group">
              <a href="knowledge-transfer.html?empId=${res.employeeId}" class="action-btn" title="Manage KT">
                <i class="bi bi-journal-check"></i>
              </a>
              <a href="transition-progress.html?empId=${res.employeeId}" class="action-btn" title="View Progress">
                <i class="bi bi-speedometer2"></i>
              </a>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    container.innerHTML = html;
  },

  // Render Activity Feed
  renderRecentActivity() {
    const container = document.getElementById('activityTimeline');
    if (!container) return;

    const resignations = DataStore.getResignations();
    const retentions = DataStore.getRetentions();
    const ktItems = DataStore.getKTItems();

    const activities = [];

    resignations.forEach(r => {
      activities.push({
        title: `Resignation Request (${r.status})`,
        desc: `${r.employeeName} submitted resignation due to ${r.reason}. Last day: ${r.lastWorkingDay}`,
        date: r.submittedAt ? r.submittedAt.split('T')[0] : 'Recent',
        type: 'danger'
      });
    });

    retentions.forEach(ret => {
      activities.push({
        title: `Retention Meeting Logged`,
        desc: `Outcome for ${ret.employeeName}: ${ret.finalDecision}`,
        date: ret.recordedAt ? ret.recordedAt.split('T')[0] : 'Recent',
        type: ret.finalDecision === 'Employee Stayed' ? 'success' : 'info'
      });
    });

    ktItems.forEach(k => {
      activities.push({
        title: `SOP / KT Updated`,
        desc: `"${k.title}" marked as ${k.status} for ${k.employeeName}`,
        date: k.updatedAt || 'Recent',
        type: 'primary'
      });
    });

    activities.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (activities.length === 0) {
      container.innerHTML = '<div class="text-muted small">No recent activity recorded.</div>';
      return;
    }

    const html = activities.slice(0, 4).map(act => `
      <div class="timeline-item">
        <div class="timeline-date">${act.date}</div>
        <div class="timeline-title">${act.title}</div>
        <div class="timeline-desc">${act.desc}</div>
      </div>
    `).join('');

    container.innerHTML = `<div class="timeline-list">${html}</div>`;
  },

  // Render Chart.js Analytics
  renderCharts() {
    if (typeof Chart === 'undefined') return;

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#94a3b8' : '#64748b';
    const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

    // Chart 1: Resignation Reasons Distribution (Doughnut)
    const ctxReasons = document.getElementById('resignationReasonsChart');
    if (ctxReasons) {
      if (window.chartReasonsInstance) window.chartReasonsInstance.destroy();

      const resignations = DataStore.getResignations();
      const reasonCounts = {};
      resignations.forEach(r => {
        reasonCounts[r.reason] = (reasonCounts[r.reason] || 0) + 1;
      });

      const labels = Object.keys(reasonCounts).length > 0 ? Object.keys(reasonCounts) : ['Better Offer', 'Higher Education', 'Career Growth', 'Relocation'];
      const data = Object.keys(reasonCounts).length > 0 ? Object.values(reasonCounts) : [4, 2, 3, 1];

      window.chartReasonsInstance = new Chart(ctxReasons, {
        type: 'doughnut',
        data: {
          labels,
          datasets: [{
            data,
            backgroundColor: ['#2563eb', '#0284c7', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { color: textColor, font: { family: 'Plus Jakarta Sans' } } }
          }
        }
      });
    }

    // Chart 2: Department Turnover & Retention (Bar Chart)
    const ctxDept = document.getElementById('departmentTurnoverChart');
    if (ctxDept) {
      if (window.chartDeptInstance) window.chartDeptInstance.destroy();

      window.chartDeptInstance = new Chart(ctxDept, {
        type: 'bar',
        data: {
          labels: ['Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'Finance'],
          datasets: [
            {
              label: 'Resigned',
              data: [3, 2, 1, 1, 2, 0],
              backgroundColor: 'rgba(239, 68, 68, 0.85)',
              borderRadius: 6
            },
            {
              label: 'Retained',
              data: [1, 1, 2, 0, 1, 1],
              backgroundColor: 'rgba(37, 99, 235, 0.85)',
              borderRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { ticks: { color: textColor }, grid: { display: false } },
            y: { ticks: { color: textColor }, grid: { color: gridColor }, beginAtZero: true }
          },
          plugins: {
            legend: { position: 'top', labels: { color: textColor, font: { family: 'Plus Jakarta Sans' } } }
          }
        }
      });
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('dashboard.html')) {
    Dashboard.init();
  }
});
