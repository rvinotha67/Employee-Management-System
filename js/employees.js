/**
 * Employee Directory & Profile Controller
 * Handles Grid / Table Views, Real-time Search, Filters, Sorting, Pagination, and Modals
 */

const EmployeesModule = {
  currentPage: 1,
  pageSize: 6,
  viewMode: 'grid', // 'grid' or 'table'
  currentFilter: {
    search: '',
    department: 'All',
    status: 'All',
    sortBy: 'name_asc'
  },

  init() {
    Auth.requireAuth();

    const initPage = () => {
      // Check query params if navigated with search
      const urlParams = new URLSearchParams(window.location.search);
      const searchQ = urlParams.get('search');
      if (searchQ) {
        this.currentFilter.search = searchQ;
        const searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.value = searchQ;
      }

      this.bindEvents();
      this.render();

      // Profile Page specific loader
      if (window.location.pathname.includes('employee-profile.html')) {
        this.renderProfilePage();
      }
    };

    if (typeof fetch === 'function') {
      DataStore.refreshFromBackend().finally(initPage);
    } else {
      initPage();
    }
  },

  bindEvents() {
    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.currentFilter.search = e.target.value.trim();
        this.currentPage = 1;
        this.render();
      });
    }

    // Department Filter
    const deptFilter = document.getElementById('departmentFilter');
    if (deptFilter) {
      deptFilter.addEventListener('change', (e) => {
        this.currentFilter.department = e.target.value;
        this.currentPage = 1;
        this.render();
      });
    }

    // Status Filter
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
      statusFilter.addEventListener('change', (e) => {
        this.currentFilter.status = e.target.value;
        this.currentPage = 1;
        this.render();
      });
    }

    // Sort Filter
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.currentFilter.sortBy = e.target.value;
        this.render();
      });
    }

    // View Mode Toggles (Grid vs Table)
    const btnGridView = document.getElementById('btnGridView');
    const btnTableView = document.getElementById('btnTableView');
    if (btnGridView && btnTableView) {
      btnGridView.addEventListener('click', () => {
        this.viewMode = 'grid';
        btnGridView.classList.add('active');
        btnTableView.classList.remove('active');
        this.render();
      });
      btnTableView.addEventListener('click', () => {
        this.viewMode = 'table';
        btnTableView.classList.add('active');
        btnGridView.classList.remove('active');
        this.render();
      });
    }

    // Save New / Edit Employee Form submit
    const employeeForm = document.getElementById('employeeForm');
    if (employeeForm) {
      employeeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSaveEmployee();
      });
    }
  },

  // Query, Filter & Sort Employees
  getFilteredData() {
    let list = DataStore.getEmployees();
    const { search, department, status, sortBy } = this.currentFilter;

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(emp =>
        emp.name.toLowerCase().includes(q) ||
        emp.email.toLowerCase().includes(q) ||
        emp.designation.toLowerCase().includes(q) ||
        emp.id.toLowerCase().includes(q) ||
        emp.department.toLowerCase().includes(q)
      );
    }

    if (department && department !== 'All') {
      list = list.filter(emp => emp.department === department);
    }

    if (status && status !== 'All') {
      list = list.filter(emp => emp.status === status);
    }

    list.sort((a, b) => {
      switch (sortBy) {
        case 'name_asc': return a.name.localeCompare(b.name);
        case 'name_desc': return b.name.localeCompare(a.name);
        case 'date_desc': return new Date(b.joiningDate) - new Date(a.joiningDate);
        case 'date_asc': return new Date(a.joiningDate) - new Date(b.joiningDate);
        default: return 0;
      }
    });

    return list;
  },

  render() {
    const listContainer = document.getElementById('employeeListContainer');
    if (!listContainer) return;

    const filtered = this.getFilteredData();
    const totalItems = filtered.length;

    if (totalItems === 0) {
      listContainer.innerHTML = `
        <div class="custom-card empty-state">
          <i class="bi bi-people empty-state-icon"></i>
          <h5 class="empty-state-title">No Employees Found</h5>
          <p class="empty-state-desc">No matching employee records fit your search criteria or filter options.</p>
          <button class="btn btn-outline-custom" onclick="EmployeesModule.resetFilters()">
            <i class="bi bi-arrow-counterclockwise me-1"></i> Reset Filters
          </button>
        </div>
      `;
      this.renderPagination(0, 0);
      return;
    }

    // Pagination slice
    const totalPages = Math.ceil(totalItems / this.pageSize);
    if (this.currentPage > totalPages) this.currentPage = totalPages;

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const paginatedList = filtered.slice(startIndex, startIndex + this.pageSize);

    if (this.viewMode === 'grid') {
      this.renderGrid(paginatedList, listContainer);
    } else {
      this.renderTable(paginatedList, listContainer);
    }

    this.renderPagination(totalItems, totalPages);
  },

  renderGrid(employees, container) {
    const html = `
      <div class="row g-3">
        ${employees.map(emp => {
          const statusClass = emp.status === 'Active' ? 'badge-active' :
                              emp.status === 'Resigning' ? 'badge-resigning' :
                              emp.status === 'Retained' ? 'badge-retained' : 'badge-pending';
          return `
            <div class="col-12 col-md-6 col-lg-4">
              <div class="custom-card h-100 d-flex flex-column">
                <div class="d-flex align-items-center justify-content-between mb-3">
                  <span class="badge-dept">${emp.department}</span>
                  <span class="badge-status ${statusClass}">${emp.status}</span>
                </div>
                <div class="text-center mb-3">
                  <img src="${emp.avatar}" alt="${emp.name}" class="rounded-circle mb-2" style="width: 72px; height: 72px; object-fit: cover; border: 3px solid var(--primary-light)">
                  <h5 class="fw-bold mb-1">${emp.name}</h5>
                  <div class="text-muted small">${emp.designation}</div>
                  <div class="badge bg-light text-dark border mt-1">${emp.id}</div>
                </div>
                <div class="small text-muted mb-3 flex-grow-1">
                  <div class="mb-1"><i class="bi bi-envelope me-2 text-primary"></i>${emp.email}</div>
                  <div class="mb-1"><i class="bi bi-telephone me-2 text-primary"></i>${emp.phone}</div>
                  <div class="mb-1"><i class="bi bi-calendar3 me-2 text-primary"></i>Joined: ${emp.joiningDate}</div>
                  <div><i class="bi bi-person-badge me-2 text-primary"></i>Manager: ${emp.manager || 'N/A'}</div>
                </div>
                <div class="pt-3 border-top d-flex gap-2">
                  <a href="employee-profile.html?id=${emp.id}" class="btn btn-outline-custom btn-sm flex-fill text-center">
                    <i class="bi bi-eye me-1"></i> Profile
                  </a>
                  <button class="btn btn-outline-primary btn-sm" onclick="EmployeesModule.openEditModal('${emp.id}')" title="Edit">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-outline-danger btn-sm" onclick="EmployeesModule.confirmDelete('${emp.id}')" title="Delete">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
    container.innerHTML = html;
  },

  renderTable(employees, container) {
    const html = `
      <div class="custom-card p-0 overflow-hidden">
        <div class="table-responsive">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Joining Date</th>
                <th>Status</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${employees.map(emp => {
                const statusClass = emp.status === 'Active' ? 'badge-active' :
                                    emp.status === 'Resigning' ? 'badge-resigning' :
                                    emp.status === 'Retained' ? 'badge-retained' : 'badge-pending';
                return `
                  <tr>
                    <td>
                      <div class="employee-cell">
                        <img src="${emp.avatar}" alt="${emp.name}" class="emp-avatar">
                        <div>
                          <div class="emp-name">${emp.name}</div>
                          <div class="emp-email">${emp.id} • ${emp.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span class="badge-dept">${emp.department}</span></td>
                    <td>${emp.designation}</td>
                    <td>${emp.joiningDate}</td>
                    <td><span class="badge-status ${statusClass}">${emp.status}</span></td>
                    <td>
                      <div class="action-btn-group justify-content-end">
                        <a href="employee-profile.html?id=${emp.id}" class="action-btn" title="View Profile">
                          <i class="bi bi-eye"></i>
                        </a>
                        <button class="action-btn" onclick="EmployeesModule.openEditModal('${emp.id}')" title="Edit">
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button class="action-btn delete-btn" onclick="EmployeesModule.confirmDelete('${emp.id}')" title="Delete">
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
    container.innerHTML = html;
  },

  renderPagination(totalItems, totalPages) {
    const pagContainer = document.getElementById('paginationContainer');
    if (!pagContainer) return;

    if (totalItems === 0) {
      pagContainer.innerHTML = '';
      return;
    }

    const startItem = (this.currentPage - 1) * this.pageSize + 1;
    const endItem = Math.min(this.currentPage * this.pageSize, totalItems);

    let pagesHtml = '';
    for (let i = 1; i <= totalPages; i++) {
      pagesHtml += `
        <li class="page-item ${i === this.currentPage ? 'active' : ''}">
          <button class="page-link" onclick="EmployeesModule.goToPage(${i})">${i}</button>
        </li>
      `;
    }

    pagContainer.innerHTML = `
      <div class="page-info">Showing ${startItem} to ${endItem} of ${totalItems} employees</div>
      <ul class="pagination">
        <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
          <button class="page-link" onclick="EmployeesModule.goToPage(${this.currentPage - 1})"><i class="bi bi-chevron-left"></i></button>
        </li>
        ${pagesHtml}
        <li class="page-item ${this.currentPage === totalPages ? 'disabled' : ''}">
          <button class="page-link" onclick="EmployeesModule.goToPage(${this.currentPage + 1})"><i class="bi bi-chevron-right"></i></button>
        </li>
      </ul>
    `;
  },

  goToPage(page) {
    if (page < 1) return;
    this.currentPage = page;
    this.render();
  },

  resetFilters() {
    this.currentFilter = { search: '', department: 'All', status: 'All', sortBy: 'name_asc' };
    const searchInput = document.getElementById('searchInput');
    const deptFilter = document.getElementById('departmentFilter');
    const statusFilter = document.getElementById('statusFilter');
    if (searchInput) searchInput.value = '';
    if (deptFilter) deptFilter.value = 'All';
    if (statusFilter) statusFilter.value = 'All';
    this.currentPage = 1;
    this.render();
  },

  // Modal Handlers
  openAddModal() {
    document.getElementById('employeeModalTitle').textContent = 'Add New Employee';
    document.getElementById('employeeForm').reset();
    document.getElementById('employeeEditId').value = '';
    const modal = new bootstrap.Modal(document.getElementById('employeeModal'));
    modal.show();
  },

  openEditModal(id) {
    const emp = DataStore.getEmployeeById(id);
    if (!emp) return;

    document.getElementById('employeeModalTitle').textContent = `Edit Employee (${emp.id})`;
    document.getElementById('employeeEditId').value = emp.id;
    document.getElementById('empName').value = emp.name;
    document.getElementById('empEmail').value = emp.email;
    document.getElementById('empPhone').value = emp.phone || '';
    document.getElementById('empDepartment').value = emp.department;
    document.getElementById('empDesignation').value = emp.designation;
    document.getElementById('empJoiningDate').value = emp.joiningDate;
    document.getElementById('empSalary').value = emp.salary || 0;
    document.getElementById('empSkills').value = emp.skills || '';
    document.getElementById('empManager').value = emp.manager || '';
    document.getElementById('empStatus').value = emp.status || 'Active';

    const modal = new bootstrap.Modal(document.getElementById('employeeModal'));
    modal.show();
  },

  handleSaveEmployee() {
    const editId = document.getElementById('employeeEditId').value;
    const empData = {
      name: document.getElementById('empName').value,
      email: document.getElementById('empEmail').value,
      phone: document.getElementById('empPhone').value,
      department: document.getElementById('empDepartment').value,
      designation: document.getElementById('empDesignation').value,
      joiningDate: document.getElementById('empJoiningDate').value,
      salary: document.getElementById('empSalary').value,
      skills: document.getElementById('empSkills').value,
      manager: document.getElementById('empManager').value,
      status: document.getElementById('empStatus').value
    };

    if (editId) {
      DataStore.updateEmployee(editId, empData);
      App.showToast(`Employee ${empData.name} updated successfully!`, 'success');
    } else {
      DataStore.addEmployee(empData);
      App.showToast(`Employee ${empData.name} added successfully!`, 'success');
    }

    const modalElem = document.getElementById('employeeModal');
    const bsModal = bootstrap.Modal.getInstance(modalElem);
    if (bsModal) bsModal.hide();

    this.render();
  },

  confirmDelete(id) {
    const emp = DataStore.getEmployeeById(id);
    if (!emp) return;

    if (confirm(`Are you sure you want to delete employee record for ${emp.name} (${emp.id})?`)) {
      DataStore.deleteEmployee(id);
      App.showToast(`Employee ${emp.name} deleted.`, 'danger');
      this.render();
    }
  },

  // Dedicated Employee Profile Page Rendering
  renderProfilePage() {
    const urlParams = new URLSearchParams(window.location.search);
    const empId = urlParams.get('id') || 'EMP-1001';
    const emp = DataStore.getEmployeeById(empId);

    if (!emp) {
      document.getElementById('profileContent').innerHTML = `
        <div class="custom-card text-center py-5">
          <h4>Employee Record Not Found</h4>
          <a href="employees.html" class="btn btn-primary-custom mt-3">Back to Directory</a>
        </div>
      `;
      return;
    }

    // Populate header card
    document.getElementById('profileAvatar').src = emp.avatar;
    document.getElementById('profileName').textContent = emp.name;
    document.getElementById('profileTitle').textContent = `${emp.designation} • ${emp.department}`;
    document.getElementById('profileIdBadge').textContent = emp.id;

    // Personal & Job Details
    document.getElementById('pEmail').textContent = emp.email;
    document.getElementById('pPhone').textContent = emp.phone || 'N/A';
    document.getElementById('pJoiningDate').textContent = emp.joiningDate;
    document.getElementById('pExperience').textContent = `${emp.experienceYears || 4} Years`;
    document.getElementById('pSalary').textContent = `$${(emp.salary || 0).toLocaleString()}/year`;
    document.getElementById('pManager').textContent = emp.manager || 'N/A';
    document.getElementById('pSkills').textContent = emp.skills || 'N/A';
    document.getElementById('pPerformance').textContent = emp.performanceSummary || 'Consistent high rating.';

    // Render linked KT status
    const ktItems = DataStore.getKTByEmployee(emp.id);
    const ktContainer = document.getElementById('profileKTList');
    if (ktContainer) {
      if (ktItems.length === 0) {
        ktContainer.innerHTML = '<div class="text-muted small">No Knowledge Transfer items logged for this employee.</div>';
      } else {
        ktContainer.innerHTML = ktItems.map(k => `
          <div class="d-flex align-items-center justify-content-between border-bottom py-2">
            <div>
              <div class="fw-semibold small">${k.title}</div>
              <div class="text-muted" style="font-size: 0.78rem;">${k.category} • ${k.priority} Priority</div>
            </div>
            <span class="badge-status ${k.status === 'Completed' ? 'badge-completed' : 'badge-pending'}">${k.status}</span>
          </div>
        `).join('');
      }
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('employees.html') || window.location.pathname.includes('employee-profile.html')) {
    EmployeesModule.init();
  }
});
