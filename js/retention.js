/**
 * Retention Management Module Controller
 * Records Counter-Offers, Retention Meetings, Final Outcomes & Success Analytics
 */

const RetentionModule = {
  init() {
    Auth.requireAuth();

    const initPage = () => {
      this.populateResignationDropdown();
      this.bindEvents();
      this.renderRetentionHistory();
    };

    if (typeof fetch === 'function') {
      DataStore.refreshFromBackend().finally(initPage);
    } else {
      initPage();
    }
  },

  populateResignationDropdown() {
    const select = document.getElementById('retentionResSelect');
    if (!select) return;

    const resignations = DataStore.getResignations();
    // Pre-select if URL query has resId
    const urlParams = new URLSearchParams(window.location.search);
    const targetResId = urlParams.get('resId');

    select.innerHTML = `
      <option value="" selected disabled>Select Resignation Request...</option>
      ${resignations.map(res => `
        <option value="${res.id}" ${res.id === targetResId ? 'selected' : ''}>
          ${res.employeeName} (${res.department} - ${res.reason})
        </option>
      `).join('')}
    `;

    if (targetResId) {
      this.handleResignationSelect(targetResId);
    }

    select.addEventListener('change', (e) => {
      this.handleResignationSelect(e.target.value);
    });
  },

  handleResignationSelect(resId) {
    const resignations = DataStore.getResignations();
    const res = resignations.find(r => r.id === resId);
    if (res) {
      document.getElementById('retentionEmpName').value = res.employeeName;
      document.getElementById('retentionEmpId').value = res.employeeId;
    }
  },

  bindEvents() {
    const form = document.getElementById('retentionForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSaveRetention();
      });
    }
  },

  handleSaveRetention() {
    const resId = document.getElementById('retentionResSelect').value;
    const empId = document.getElementById('retentionEmpId').value;
    const meetingDate = document.getElementById('retentionDate').value;
    const discussionNotes = document.getElementById('retentionNotes').value;
    const promotionOffered = document.getElementById('retentionPromotion').value;
    const salaryHikeOffered = parseFloat(document.getElementById('retentionHike').value) || 0;
    const internalTransfer = document.getElementById('retentionTransfer').value;
    const flexibleWork = document.getElementById('retentionWorkStyle').value;
    const otherBenefits = document.getElementById('retentionBenefits').value;
    const finalDecision = document.getElementById('retentionDecision').value;

    if (!resId || !meetingDate || !finalDecision) {
      App.showToast('Please complete all required fields.', 'warning');
      return;
    }

    const emp = DataStore.getEmployeeById(empId);

    DataStore.addRetention({
      resignationId: resId,
      employeeId: empId,
      employeeName: emp ? emp.name : 'Employee',
      meetingDate,
      discussionNotes,
      promotionOffered,
      salaryHikeOffered,
      internalTransfer,
      flexibleWork,
      otherBenefits,
      finalDecision
    });

    const isRetained = finalDecision === 'Employee Stayed';
    App.showToast(
      `Retention meeting logged for ${emp ? emp.name : 'Employee'}. Outcome: ${finalDecision}.`,
      isRetained ? 'success' : 'info'
    );

    document.getElementById('retentionForm').reset();
    this.renderRetentionHistory();
  },

  renderRetentionHistory() {
    const container = document.getElementById('retentionHistoryContainer');
    if (!container) return;

    const retentions = DataStore.getRetentions();

    if (retentions.length === 0) {
      container.innerHTML = `
        <div class="custom-card empty-state">
          <i class="bi bi-chat-heart empty-state-icon"></i>
          <h5 class="empty-state-title">No Retention Logged Yet</h5>
          <p class="empty-state-desc">Record manager discussions and counter-offer packages to retain valuable talent.</p>
        </div>
      `;
      return;
    }

    const html = retentions.map(ret => {
      const isRetained = ret.finalDecision === 'Employee Stayed';
      const badgeClass = isRetained ? 'badge-active' : 'badge-resigning';
      const iconClass = isRetained ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger';

      return `
        <div class="custom-card mb-3">
          <div class="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
            <div class="d-flex align-items-center gap-2">
              <i class="bi ${iconClass} fs-4"></i>
              <div>
                <h6 class="fw-bold mb-0 text-main">${ret.employeeName}</h6>
                <div class="small text-muted">Meeting Date: ${ret.meetingDate}</div>
              </div>
            </div>
            <span class="badge-status ${badgeClass}">${ret.finalDecision}</span>
          </div>
          <p class="small text-muted mb-3 bg-light p-2 rounded border">${ret.discussionNotes || 'No notes added.'}</p>
          <div class="row g-2 small">
            ${ret.promotionOffered ? `<div class="col-6 col-md-4"><i class="bi bi-award text-primary me-1"></i><strong>Promotion:</strong> ${ret.promotionOffered}</div>` : ''}
            ${ret.salaryHikeOffered ? `<div class="col-6 col-md-4"><i class="bi bi-graph-up-arrow text-success me-1"></i><strong>Hike:</strong> ${ret.salaryHikeOffered}%</div>` : ''}
            ${ret.flexibleWork ? `<div class="col-6 col-md-4"><i class="bi bi-laptop text-info me-1"></i><strong>Flex:</strong> ${ret.flexibleWork}</div>` : ''}
            ${ret.internalTransfer ? `<div class="col-6 col-md-4"><i class="bi bi-arrow-repeat text-warning me-1"></i><strong>Transfer:</strong> ${ret.internalTransfer}</div>` : ''}
            ${ret.otherBenefits ? `<div class="col-6 col-md-4"><i class="bi bi-gift text-purple me-1"></i><strong>Benefits:</strong> ${ret.otherBenefits}</div>` : ''}
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = html;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('retention.html')) {
    RetentionModule.init();
  }
});
