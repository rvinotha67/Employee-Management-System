/**
 * Resignation Request Module Controller
 * Handles Resignation Submissions, Manager Review Workflows & Status Updates
 */

const ResignationModule = {
  init() {
    Auth.requireAuth();

    const initPage = () => {
      this.populateEmployeeDropdown();
      this.bindEvents();
      this.renderResignationsTable();
    };

    if (typeof fetch === 'function') {
      DataStore.refreshFromBackend().finally(initPage);
    } else {
      initPage();
    }
  },

  populateEmployeeDropdown() {
    const select = document.getElementById('resignationEmpSelect');
    if (!select) return;

    const employees = DataStore.getEmployees();
    select.innerHTML = `
      <option value="" selected disabled>Select Employee...</option>
      ${employees.map(emp => `<option value="${emp.id}">${emp.name} (${emp.id} - ${emp.department})</option>`).join('')}
    `;
  },

  bindEvents() {
    const form = document.getElementById('resignationForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSubmitResignation();
      });
    }

    // Filter by status
    const statusFilter = document.getElementById('resignationStatusFilter');
    if (statusFilter) {
      statusFilter.addEventListener('change', () => {
        this.renderResignationsTable();
      });
    }
  },

  handleSubmitResignation() {
    const empId = document.getElementById('resignationEmpSelect').value;
    const reason = document.getElementById('resignationReason').value;
    const noticeDate = document.getElementById('resignationNoticeDate').value;
    const lastWorkingDay = document.getElementById('resignationLastDay').value;
    const resignationLetter = document.getElementById('resignationLetter').value;
    const comments = document.getElementById('resignationComments').value;

    if (!empId || !reason || !lastWorkingDay) {
      App.showToast('Please fill in all required fields.', 'warning');
      return;
    }

    const emp = DataStore.getEmployeeById(empId);

    const newRes = DataStore.addResignation({
      employeeId: empId,
      reason,
      noticeDate: noticeDate || new Date().toISOString().split('T')[0],
      lastWorkingDay,
      resignationLetter,
      comments,
      status: 'Pending'
    });

    App.showToast(`Resignation submitted for ${emp ? emp.name : 'Employee'}. Status set to Pending.`, 'success');

    const modalElem = document.getElementById('resignationModal');
    if (modalElem) {
      const bsModal = bootstrap.Modal.getInstance(modalElem);
      if (bsModal) bsModal.hide();
    }

    document.getElementById('resignationForm').reset();
    this.renderResignationsTable();
  },

  renderResignationsTable() {
    const container = document.getElementById('resignationsTableBody');
    if (!container) return;

    let list = DataStore.getResignations();
    const filterElem = document.getElementById('resignationStatusFilter');
    if (filterElem && filterElem.value !== 'All') {
      list = list.filter(r => r.status === filterElem.value);
    }

    if (list.length === 0) {
      container.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-4 text-muted">
            <i class="bi bi-inbox fs-3 d-block mb-1"></i>
            No resignation requests match the filter criteria.
          </td>
        </tr>
      `;
      return;
    }

    const html = list.map(res => {
      const statusClass = res.status === 'Approved' ? 'badge-resigning' :
                          res.status === 'Retention Discussion' ? 'badge-review' :
                          res.status === 'Cancelled' ? 'badge-active' :
                          res.status === 'Rejected' ? 'badge-inactive' : 'badge-pending';

      return `
        <tr>
          <td>
            <div class="fw-semibold text-main">${res.employeeName}</div>
            <div class="small text-muted">${res.employeeId}</div>
          </td>
          <td><span class="badge-dept">${res.department}</span></td>
          <td><span class="fw-medium">${res.reason}</span></td>
          <td>${res.noticeDate || 'N/A'}</td>
          <td><span class="fw-semibold text-primary">${res.lastWorkingDay}</span></td>
          <td><span class="badge-status ${statusClass}">${res.status}</span></td>
          <td>
            <div class="action-btn-group">
              <button class="action-btn" onclick="ResignationModule.openReviewModal('${res.id}')" title="Review Request">
                <i class="bi bi-sliders"></i>
              </button>
              <a href="retention.html?resId=${res.id}" class="action-btn" title="Retention Discussion">
                <i class="bi bi-chat-quote"></i>
              </a>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    container.innerHTML = html;
  },

  openReviewModal(resId) {
    const resignations = DataStore.getResignations();
    const res = resignations.find(r => r.id === resId);
    if (!res) return;

    document.getElementById('reviewResId').value = res.id;
    document.getElementById('reviewEmpName').textContent = `${res.employeeName} (${res.department})`;
    document.getElementById('reviewReason').textContent = res.reason;
    document.getElementById('reviewLastDay').textContent = res.lastWorkingDay;
    document.getElementById('reviewLetter').textContent = res.resignationLetter || 'No detailed letter uploaded.';
    document.getElementById('reviewStatusSelect').value = res.status;

    const modal = new bootstrap.Modal(document.getElementById('reviewModal'));
    modal.show();
  },

  saveReviewStatus() {
    const resId = document.getElementById('reviewResId').value;
    const newStatus = document.getElementById('reviewStatusSelect').value;

    DataStore.updateResignation(resId, { status: newStatus });
    App.showToast(`Resignation status updated to "${newStatus}".`, 'success');

    const modalElem = document.getElementById('reviewModal');
    const bsModal = bootstrap.Modal.getInstance(modalElem);
    if (bsModal) bsModal.hide();

    this.renderResignationsTable();
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('resignation.html')) {
    ResignationModule.init();
  }
});
