/**
 * Replacement Assignment Module Controller
 * Pairs resigning employees with replacement successors & schedules handover timelines
 */

const ReplacementModule = {
  init() {
    Auth.requireAuth();

    const initPage = () => {
      this.populateDropdowns();
      this.bindEvents();
      this.renderStats();
      this.renderReplacementsList();
      this.renderHealthSection();
      this.renderTimeline();
    };

    if (typeof fetch === 'function') {
      DataStore.refreshFromBackend().finally(initPage);
    } else {
      initPage();
    }
  },

  populateDropdowns() {
    const resigningSelect = document.getElementById('repResigningSelect');
    const replacementSelect = document.getElementById('repReplacementSelect');

    const employees = DataStore.getEmployees();

    if (resigningSelect) {
      resigningSelect.innerHTML = `
        <option value="" selected disabled>Select Outgoing / Resigning Employee...</option>
        ${employees.map(e => `<option value="${e.id}">${e.name} (${e.department} - ${e.status})</option>`).join('')}
      `;
    }

    if (replacementSelect) {
      replacementSelect.innerHTML = `
        <option value="" selected disabled>Select Replacement / Successor...</option>
        ${employees.map(e => `<option value="${e.id}">${e.name} (${e.department} - ${e.designation})</option>`).join('')}
      `;
    }
  },

  bindEvents() {
    const form = document.getElementById('replacementForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSaveReplacement();
      });
    }

    const statusFilter = document.getElementById('repStatusFilter');
    if (statusFilter) {
      statusFilter.addEventListener('change', () => this.renderReplacementsList());
    }
  },

  renderStats() {
    const replacements = DataStore.getReplacements();
    const active = replacements.filter(item => item.status === 'In Handover').length;
    const completed = replacements.filter(item => item.status === 'Completed').length;
    const risk = replacements.filter(item => item.status !== 'Completed').length;

    const nextReview = replacements.length ? replacements[0].startDate : '--';

    document.getElementById('pairingActiveCount').textContent = active;
    document.getElementById('pairingRiskCount').textContent = risk;
    document.getElementById('pairingCompleteCount').textContent = completed;
    document.getElementById('pairingNextReview').textContent = nextReview;
  },

  renderHealthSection() {
    const container = document.getElementById('pairingHealthList');
    if (!container) return;

    const replacements = DataStore.getReplacements();
    const items = [
      { label: 'Knowledge Transfer Completion', value: 72 },
      { label: 'Training Coverage', value: 64 },
      { label: 'Documentation Readiness', value: 81 },
      { label: 'Stakeholder Signoff', value: 58 }
    ];

    const html = items.map(item => `
      <div class="pairing-health-item">
        <div class="pairing-health-header">
          <h6 class="pairing-health-title">${item.label}</h6>
          <span class="badge-dept">${item.value}%</span>
        </div>
        <div class="pairing-health-bar">
          <div class="pairing-health-fill" style="width:${item.value}%"></div>
        </div>
      </div>
    `).join('');

    container.innerHTML = html || '<div class="text-muted small">No pairing health data available.</div>';
  },

  renderTimeline() {
    const container = document.getElementById('pairingTimeline');
    if (!container) return;

    const items = [
      { date: 'Week 1', title: 'Knowledge transfer kickoff', desc: 'Review responsibilities and ownership checklist.' },
      { date: 'Week 2', title: 'Shadow sessions', desc: 'Observe day-to-day operations and escalation path.' },
      { date: 'Week 3', title: 'Training signoff', desc: 'Validate documentation, access, and decision-handling.' },
      { date: 'Week 4', title: 'Operational takeover', desc: 'Confirm continuity before final handoff.' }
    ];

    container.innerHTML = items.map(item => `
      <div class="timeline-item">
        <div class="timeline-date">${item.date}</div>
        <div class="timeline-title">${item.title}</div>
        <div class="timeline-desc">${item.desc}</div>
      </div>
    `).join('');
  },

  handleSaveReplacement() {
    const resigningEmpId = document.getElementById('repResigningSelect').value;
    const replacementEmpId = document.getElementById('repReplacementSelect').value;
    const department = document.getElementById('repDepartment').value;
    const reportingManager = document.getElementById('repManager').value;
    const startDate = document.getElementById('repStartDate').value;
    const trainingPeriodDays = parseInt(document.getElementById('repTrainingDays').value) || 14;
    const notes = document.getElementById('repNotes').value;

    if (!resigningEmpId || !replacementEmpId || !startDate) {
      App.showToast('Please select both employees and handover start date.', 'warning');
      return;
    }

    DataStore.addReplacement({
      resigningEmpId,
      replacementEmpId,
      department,
      reportingManager,
      startDate,
      trainingPeriodDays,
      notes,
      status: 'In Handover'
    });

    App.showToast('Replacement assignment successfully registered.', 'success');

    const modalElem = document.getElementById('replacementModal');
    if (modalElem) {
      const bsModal = bootstrap.Modal.getInstance(modalElem);
      if (bsModal) bsModal.hide();
    }

    document.getElementById('replacementForm').reset();
    this.renderReplacementsList();
  },

  renderReplacementsList() {
    const container = document.getElementById('replacementsListContainer');
    if (!container) return;

    const statusFilter = document.getElementById('repStatusFilter');
    const selectedStatus = statusFilter ? statusFilter.value : 'All';
    let replacements = DataStore.getReplacements();

    if (selectedStatus !== 'All') {
      replacements = replacements.filter(item => item.status === selectedStatus);
    }

    if (replacements.length === 0) {
      container.innerHTML = `
        <div class="custom-card empty-state">
          <i class="bi bi-person-lines-fill empty-state-icon"></i>
          <h5 class="empty-state-title">No Replacement Assignments</h5>
          <p class="empty-state-desc">Assign successor employees to outgoing staff to manage handover training and knowledge transfers.</p>
        </div>
      `;
      return;
    }

    const html = replacements.map(rep => {
      const statusClass = rep.status === 'Completed' ? 'badge-completed' :
                          rep.status === 'In Handover' ? 'badge-in-progress' : 'badge-pending';

      return `
        <div class="custom-card mb-3">
          <div class="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
            <div>
              <span class="badge-dept me-2">${rep.department || 'General'}</span>
              <span class="badge-status ${statusClass}">${rep.status}</span>
            </div>
            <div class="small text-muted"><i class="bi bi-calendar3 me-1"></i>Start Date: ${rep.startDate} (${rep.trainingPeriodDays || 14} Days Duration)</div>
          </div>

          <div class="row align-items-center g-3 mb-3">
            <div class="col-12 col-md-5">
              <div class="p-3 bg-light rounded border text-center">
                <div class="text-danger small fw-bold text-uppercase mb-1">Outgoing Employee</div>
                <h6 class="fw-bold mb-1">${rep.resigningEmpName}</h6>
                <div class="small text-muted">${rep.resigningEmpId}</div>
              </div>
            </div>

            <div class="col-12 col-md-2 text-center">
              <div class="fs-3 text-primary"><i class="bi bi-arrow-right-circle-fill"></i></div>
              <div class="small text-muted">Handover</div>
            </div>

            <div class="col-12 col-md-5">
              <div class="p-3 bg-light rounded border text-center">
                <div class="text-success small fw-bold text-uppercase mb-1">Successor / Replacement</div>
                <h6 class="fw-bold mb-1">${rep.replacementEmpName}</h6>
                <div class="small text-muted">${rep.replacementEmpId}</div>
              </div>
            </div>
          </div>

          ${rep.notes ? `<div class="small text-muted border-top pt-2"><i class="bi bi-info-circle me-1 text-primary"></i><strong>Handover Notes:</strong> ${rep.notes}</div>` : ''}
          
          <div class="pt-3 border-top mt-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div class="small text-muted"><i class="bi bi-person-check me-1"></i>Manager: ${rep.reportingManager || 'TBD'}</div>
            <a href="transition-progress.html?empId=${rep.resigningEmpId}" class="btn btn-outline-custom btn-sm">
              <i class="bi bi-speedometer2 me-1"></i> Track Progress
            </a>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = html;
    this.renderStats();
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('replacement.html')) {
    ReplacementModule.init();
  }
});
