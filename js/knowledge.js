/**
 * Knowledge Transfer (KT) Module Controller (Main Feature)
 * 20+ Categories of SOPs, Code Repositories, Client Info, Environment Setup, FAQs & Checklists
 */

const KnowledgeModule = {
  activeEmployeeId: 'All',
  activeCategory: 'All',
  activeStatus: 'All',

  init() {
    Auth.requireAuth();

    const initPage = () => {
      // Pre-select employee if passed in query param
      const urlParams = new URLSearchParams(window.location.search);
      const empId = urlParams.get('empId');
      if (empId) {
        this.activeEmployeeId = empId;
      }

      this.populateDropdowns();
      this.bindEvents();
      this.render();
    };

    if (typeof fetch === 'function') {
      DataStore.refreshFromBackend().finally(initPage);
    } else {
      initPage();
    }
  },

  populateDropdowns() {
    const empSelectFilter = document.getElementById('ktEmpFilter');
    const modalEmpSelect = document.getElementById('ktModalEmpSelect');
    const employees = DataStore.getEmployees();

    if (empSelectFilter) {
      empSelectFilter.innerHTML = `
        <option value="All">All Resigning / Active Employees</option>
        ${employees.map(e => `<option value="${e.id}" ${e.id === this.activeEmployeeId ? 'selected' : ''}>${e.name} (${e.department})</option>`).join('')}
      `;
    }

    if (modalEmpSelect) {
      modalEmpSelect.innerHTML = `
        <option value="" selected disabled>Select Resigning Employee...</option>
        ${employees.map(e => `<option value="${e.id}">${e.name} (${e.id})</option>`).join('')}
      `;
    }
  },

  bindEvents() {
    // Filter controls
    const empFilter = document.getElementById('ktEmpFilter');
    if (empFilter) {
      empFilter.addEventListener('change', (e) => {
        this.activeEmployeeId = e.target.value;
        this.render();
      });
    }

    const catFilter = document.getElementById('ktCategoryFilter');
    if (catFilter) {
      catFilter.addEventListener('change', (e) => {
        this.activeCategory = e.target.value;
        this.render();
      });
    }

    const statusFilter = document.getElementById('ktStatusFilter');
    if (statusFilter) {
      statusFilter.addEventListener('change', (e) => {
        this.activeStatus = e.target.value;
        this.render();
      });
    }

    // Save KT Form Submit
    const ktForm = document.getElementById('ktForm');
    if (ktForm) {
      ktForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSaveKT();
      });
    }
  },

  getFilteredItems() {
    let list = DataStore.getKTItems();

    if (this.activeEmployeeId !== 'All') {
      list = list.filter(item => item.employeeId === this.activeEmployeeId);
    }
    if (this.activeCategory !== 'All') {
      list = list.filter(item => item.category === this.activeCategory);
    }
    if (this.activeStatus !== 'All') {
      list = list.filter(item => item.status === this.activeStatus);
    }

    return list;
  },

  render() {
    this.renderSummaryMetrics();
    this.renderAnalytics();

    const container = document.getElementById('ktCardsContainer');
    if (!container) return;

    const list = this.getFilteredItems();

    if (list.length === 0) {
      container.innerHTML = `
        <div class="custom-card empty-state">
          <i class="bi bi-journal-text empty-state-icon"></i>
          <h5 class="empty-state-title">No Knowledge Items Found</h5>
          <p class="empty-state-desc">No SOP documents or knowledge transfer entries match the current filter options.</p>
          <button class="btn btn-primary-custom" onclick="KnowledgeModule.openAddModal()">
            <i class="bi bi-plus-lg me-1"></i> Add Knowledge Entry
          </button>
        </div>
      `;
      return;
    }

    const html = list.map(item => {
      const statusClass = item.status === 'Completed' ? 'badge-completed' :
                          item.status === 'Verified' ? 'badge-active' :
                          item.status === 'In Progress' ? 'badge-in-progress' : 'badge-pending';

      const priorityBadge = item.priority === 'High' ? 'bg-danger' :
                            item.priority === 'Medium' ? 'bg-warning text-dark' : 'bg-secondary';

      return `
        <div class="custom-card mb-3">
          <div class="d-flex align-items-start justify-content-between mb-2 flex-wrap gap-2">
            <div>
              <div class="d-flex align-items-center gap-2 mb-1">
                <span class="badge ${priorityBadge}">${item.priority} Priority</span>
                <span class="badge-dept">${item.category}</span>
              </div>
              <h5 class="fw-bold mb-1 text-main">${item.title}</h5>
              <div class="small text-muted">
                <i class="bi bi-person me-1"></i>Assigned Employee: <strong>${item.employeeName}</strong> • Updated: ${item.updatedAt}
              </div>
            </div>
            <span class="badge-status ${statusClass}">${item.status}</span>
          </div>
          
          <p class="text-main small mb-3 bg-light p-3 rounded border" style="white-space: pre-line;">${item.description}</p>
          
          ${item.link ? `
            <div class="mb-3 small">
              <i class="bi bi-link-45deg me-1 text-primary"></i>
              <strong>Resource Link:</strong>
              <a href="${item.link}" target="_blank" class="text-primary text-decoration-underline ms-1">${item.link}</a>
            </div>
          ` : ''}

          <div class="pt-2 border-top d-flex align-items-center justify-content-between">
            <div class="btn-group btn-group-sm">
              <button class="btn btn-outline-secondary ${item.status === 'Not Started' ? 'active' : ''}" onclick="KnowledgeModule.quickStatusUpdate('${item.id}', 'Not Started')">Not Started</button>
              <button class="btn btn-outline-purple ${item.status === 'In Progress' ? 'active' : ''}" onclick="KnowledgeModule.quickStatusUpdate('${item.id}', 'In Progress')">In Progress</button>
              <button class="btn btn-outline-success ${item.status === 'Completed' ? 'active' : ''}" onclick="KnowledgeModule.quickStatusUpdate('${item.id}', 'Completed')">Completed</button>
              <button class="btn btn-outline-primary ${item.status === 'Verified' ? 'active' : ''}" onclick="KnowledgeModule.quickStatusUpdate('${item.id}', 'Verified')">Verified</button>
            </div>

            <div class="action-btn-group">
              <button class="action-btn" onclick="KnowledgeModule.openEditModal('${item.id}')" title="Edit Entry">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="action-btn delete-btn" onclick="KnowledgeModule.confirmDelete('${item.id}')" title="Delete Entry">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = html;
  },

  renderSummaryMetrics() {
    const items = DataStore.getKTItems();
    const total = items.length;
    const inProgress = items.filter(item => item.status === 'In Progress').length;
    const completed = items.filter(item => item.status === 'Completed').length;
    const verified = items.filter(item => item.status === 'Verified').length;

    document.getElementById('ktTotalItems').textContent = total;
    document.getElementById('ktInProgress').textContent = inProgress;
    document.getElementById('ktCompleted').textContent = completed;
    document.getElementById('ktVerified').textContent = verified;
  },

  renderAnalytics() {
    if (typeof Chart === 'undefined') return;

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#94a3b8' : '#64748b';
    const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)';
    const items = DataStore.getKTItems();

    const statusCounts = {
      'Not Started': 0,
      'In Progress': 0,
      'Completed': 0,
      'Verified': 0
    };

    items.forEach(item => {
      if (statusCounts[item.status] !== undefined) {
        statusCounts[item.status] += 1;
      }
    });

    const statusCtx = document.getElementById('ktStatusChart');
    if (statusCtx) {
      if (window.ktStatusChartInstance) window.ktStatusChartInstance.destroy();
      window.ktStatusChartInstance = new Chart(statusCtx, {
        type: 'doughnut',
        data: {
          labels: Object.keys(statusCounts),
          datasets: [{
            data: Object.values(statusCounts),
            backgroundColor: ['#cbd5e1', '#f59e0b', '#10b981', '#2563eb'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '58%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: textColor, boxWidth: 12, font: { family: 'Plus Jakarta Sans' } }
            }
          }
        }
      });
    }

    const categoryCounts = {};
    items.forEach(item => {
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
    });

    const categoryLabels = Object.keys(categoryCounts);
    const categoryValues = Object.values(categoryCounts);

    const categoryCtx = document.getElementById('ktCategoryChart');
    if (categoryCtx) {
      if (window.ktCategoryChartInstance) window.ktCategoryChartInstance.destroy();
      window.ktCategoryChartInstance = new Chart(categoryCtx, {
        type: 'bar',
        data: {
          labels: categoryLabels.length ? categoryLabels : ['Projects', 'Client Information', 'Checklist'],
          datasets: [{
            data: categoryValues.length ? categoryValues : [2, 1, 1],
            backgroundColor: ['#2563eb', '#3b82f6', '#14b8a6', '#8b5cf6', '#10b981'],
            borderRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            x: { ticks: { color: textColor }, grid: { display: false } },
            y: { beginAtZero: true, ticks: { color: textColor }, grid: { color: gridColor } }
          }
        }
      });
    }

    const priorityList = document.getElementById('ktPriorityList');
    if (priorityList) {
      const itemsByPriority = [
        { label: 'High Priority', key: 'High', color: 'linear-gradient(90deg, #ef4444, #f97316)' },
        { label: 'Medium Priority', key: 'Medium', color: 'linear-gradient(90deg, #f59e0b, #facc15)' },
        { label: 'Low Priority', key: 'Low', color: 'linear-gradient(90deg, #10b981, #14b8a6)' }
      ];

      const max = Math.max(1, ...itemsByPriority.map(p => items.filter(i => i.priority === p.key).length));

      priorityList.innerHTML = itemsByPriority.map(p => {
        const count = items.filter(i => i.priority === p.key).length;
        const width = (count / max) * 100;
        return `
          <div class="kt-priority-item">
            <div class="kt-priority-head">
              <h6 class="kt-priority-title">${p.label}</h6>
              <span class="badge-status badge-pending">${count}</span>
            </div>
            <div class="kt-priority-bar">
              <div class="kt-priority-fill" style="width:${width}%; background:${p.color};"></div>
            </div>
          </div>
        `;
      }).join('');
    }

    const coverageList = document.getElementById('ktCoverageList');
    if (coverageList) {
      const employeeMap = {};
      items.forEach(item => {
        employeeMap[item.employeeName] = (employeeMap[item.employeeName] || 0) + 1;
      });

      const employeeRows = Object.entries(employeeMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4);

      const maxCoverage = Math.max(1, ...employeeRows.map(([, count]) => count));

      coverageList.innerHTML = employeeRows.map(([name, count]) => `
        <div class="kt-coverage-item">
          <div class="kt-coverage-head">
            <h6 class="kt-coverage-title">${name}</h6>
            <span class="badge-dept">${count} items</span>
          </div>
          <div class="kt-coverage-bar">
            <div class="kt-coverage-fill" style="width:${(count / maxCoverage) * 100}%"></div>
          </div>
        </div>
      `).join('');
    }
  },

  openAddModal() {
    document.getElementById('ktModalTitle').textContent = 'Add Knowledge Transfer Item';
    document.getElementById('ktForm').reset();
    document.getElementById('ktEditId').value = '';
    const modal = new bootstrap.Modal(document.getElementById('ktModal'));
    modal.show();
  },

  openEditModal(id) {
    const list = DataStore.getKTItems();
    const item = list.find(k => k.id === id);
    if (!item) return;

    document.getElementById('ktModalTitle').textContent = `Edit Knowledge Entry (${item.id})`;
    document.getElementById('ktEditId').value = item.id;
    document.getElementById('ktModalEmpSelect').value = item.employeeId;
    document.getElementById('ktCategorySelect').value = item.category;
    document.getElementById('ktTitleInput').value = item.title;
    document.getElementById('ktDescriptionInput').value = item.description;
    document.getElementById('ktPrioritySelect').value = item.priority || 'Medium';
    document.getElementById('ktStatusSelect').value = item.status || 'Not Started';
    document.getElementById('ktLinkInput').value = item.link || '';

    const modal = new bootstrap.Modal(document.getElementById('ktModal'));
    modal.show();
  },

  handleSaveKT() {
    const editId = document.getElementById('ktEditId').value;
    const empId = document.getElementById('ktModalEmpSelect').value;
    const category = document.getElementById('ktCategorySelect').value;
    const title = document.getElementById('ktTitleInput').value;
    const description = document.getElementById('ktDescriptionInput').value;
    const priority = document.getElementById('ktPrioritySelect').value;
    const status = document.getElementById('ktStatusSelect').value;
    const link = document.getElementById('ktLinkInput').value;

    if (!empId || !category || !title || !description) {
      App.showToast('Please fill in required title and description fields.', 'warning');
      return;
    }

    if (editId) {
      DataStore.updateKTItem(editId, { employeeId: empId, category, title, description, priority, status, link });
      App.showToast('Knowledge entry updated.', 'success');
    } else {
      DataStore.addKTItem({ employeeId: empId, category, title, description, priority, status, link });
      App.showToast('New Knowledge Transfer entry added.', 'success');
    }

    const modalElem = document.getElementById('ktModal');
    const bsModal = bootstrap.Modal.getInstance(modalElem);
    if (bsModal) bsModal.hide();

    this.render();
  },

  quickStatusUpdate(id, newStatus) {
    DataStore.updateKTItem(id, { status: newStatus });
    App.showToast(`KT item status marked as "${newStatus}".`, 'info');
    this.render();
  },

  confirmDelete(id) {
    if (confirm('Are you sure you want to delete this Knowledge Transfer item?')) {
      DataStore.deleteKTItem(id);
      App.showToast('Knowledge item deleted.', 'danger');
      this.render();
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('knowledge-transfer.html')) {
    KnowledgeModule.init();
  }
});
