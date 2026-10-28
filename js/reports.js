/**
 * Reports Dashboard Controller
 * Executive Analytics, Department Reports, Chart Visualizations, CSV Exporter & Print Handler
 */

const ReportsModule = {
  init() {
    Auth.requireAuth();

    const initPage = () => {
      this.renderMetrics();
      this.renderDepartmentTable();
      this.renderReportsCharts();
      this.bindEvents();
    };

    if (typeof fetch === 'function') {
      DataStore.refreshFromBackend().finally(initPage);
    } else {
      initPage();
    }
  },

  bindEvents() {
    const exportBtn = document.getElementById('exportCsvBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportDepartmentReportToCSV());
    }

    const printBtn = document.getElementById('printReportBtn');
    if (printBtn) {
      printBtn.addEventListener('click', () => window.print());
    }
  },

  renderMetrics() {
    const employees = DataStore.getEmployees();
    const retentions = DataStore.getRetentions();
    const ktItems = DataStore.getKTItems();

    const resignedCount = employees.filter(e => e.status === 'Resigning' || e.status === 'Resigned').length;
    const retainedCount = retentions.filter(r => r.finalDecision === 'Employee Stayed').length;
    const ktCompleted = ktItems.filter(k => k.status === 'Completed' || k.status === 'Verified').length;
    const ktPending = ktItems.filter(k => k.status === 'Not Started' || k.status === 'In Progress').length;

    const rRetained = document.getElementById('reportRetained');
    const rResigned = document.getElementById('reportResigned');
    const rKtCompleted = document.getElementById('reportKtCompleted');
    const rKtPending = document.getElementById('reportKtPending');

    if (rRetained) rRetained.textContent = retainedCount;
    if (rResigned) rResigned.textContent = resignedCount;
    if (rKtCompleted) rKtCompleted.textContent = ktCompleted;
    if (rKtPending) rKtPending.textContent = ktPending;
  },

  renderDepartmentTable() {
    const container = document.getElementById('departmentReportTableBody');
    if (!container) return;

    const employees = DataStore.getEmployees();
    const resignations = DataStore.getResignations();
    const retentions = DataStore.getRetentions();
    const ktItems = DataStore.getKTItems();

    const departments = ['Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'Finance', 'Human Resources'];

    const html = departments.map(dept => {
      const totalDept = employees.filter(e => e.department === dept).length;
      const resignedDept = resignations.filter(r => r.department === dept).length;
      const retainedDept = retentions.filter(ret => {
        const emp = employees.find(e => e.id === ret.employeeId);
        return emp && emp.department === dept && ret.finalDecision === 'Employee Stayed';
      }).length;

      const ktDept = ktItems.filter(k => {
        const emp = employees.find(e => e.id === k.employeeId);
        return emp && emp.department === dept && (k.status === 'Completed' || k.status === 'Verified');
      }).length;

      const retentionRate = (resignedDept + retainedDept) > 0
        ? Math.round((retainedDept / (resignedDept + retainedDept)) * 100)
        : 100;

      return `
        <tr>
          <td><span class="fw-bold text-main">${dept}</span></td>
          <td>${totalDept}</td>
          <td><span class="text-danger fw-semibold">${resignedDept}</span></td>
          <td><span class="text-primary fw-semibold">${retainedDept}</span></td>
          <td><span class="text-success fw-semibold">${ktDept} Completed</span></td>
          <td>
            <div class="d-flex align-items-center gap-2">
              <div class="custom-progress-bar flex-fill m-0" style="height: 6px;">
                <div class="custom-progress-fill" style="width: ${retentionRate}%"></div>
              </div>
              <span class="small fw-bold">${retentionRate}%</span>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    container.innerHTML = html;
  },

  renderReportsCharts() {
    if (typeof Chart === 'undefined') return;

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#94a3b8' : '#64748b';
    const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

    // Chart: Monthly Resignation vs Retention Trend
    const ctxTrend = document.getElementById('reportMonthlyTrendChart');
    if (ctxTrend) {
      if (window.chartTrendInstance) window.chartTrendInstance.destroy();

      window.chartTrendInstance = new Chart(ctxTrend, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
          datasets: [
            {
              label: 'Resignations Filed',
              data: [2, 4, 3, 5, 2, 4, 3, 2],
              borderColor: '#ef4444',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              fill: true,
              tension: 0.3
            },
            {
              label: 'Employees Retained',
              data: [1, 2, 2, 3, 2, 3, 2, 1],
              borderColor: '#2563eb',
              backgroundColor: 'rgba(37, 99, 235, 0.1)',
              fill: true,
              tension: 0.3
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { ticks: { color: textColor }, grid: { color: gridColor } },
            y: { ticks: { color: textColor }, grid: { color: gridColor }, beginAtZero: true }
          },
          plugins: {
            legend: { position: 'top', labels: { color: textColor, font: { family: 'Plus Jakarta Sans' } } }
          }
        }
      });
    }
  },

  // Export CSV Helper
  exportDepartmentReportToCSV() {
    const table = document.getElementById('departmentReportTable');
    if (!table) return;

    let csv = [];
    const rows = table.querySelectorAll('tr');

    rows.forEach(row => {
      const cols = row.querySelectorAll('th, td');
      let rowData = [];
      cols.forEach(col => {
        let text = col.innerText.replace(/(\r\n|\n|\r)/gm, ' ').replace(/\s+/g, ' ').trim();
        text = `"${text.replace(/"/g, '""')}"`;
        rowData.push(text);
      });
      csv.push(rowData.join(','));
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + csv.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Department_Transition_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    App.showToast('Department report exported to CSV.', 'success');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('reports.html')) {
    ReportsModule.init();
  }
});
