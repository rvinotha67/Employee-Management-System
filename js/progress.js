/**
 * Transition Progress Module Controller
 * 6-Pillar Visual Tracker: Documentation, Training, Shadowing, KT, Project Handover, Final Approval
 */

const ProgressModule = {
  activeEmpId: null,

  init() {
    Auth.requireAuth();

    const initPage = () => {
      const urlParams = new URLSearchParams(window.location.search);
      this.activeEmpId = urlParams.get('empId') || 'EMP-1001';

      this.populateEmployeeSelector();
      this.render();
    };

    if (typeof fetch === 'function') {
      DataStore.refreshFromBackend().finally(initPage);
    } else {
      initPage();
    }
  },

  populateEmployeeSelector() {
    const select = document.getElementById('progressEmpSelect');
    if (!select) return;

    const employees = DataStore.getEmployees().filter(e => e.status === 'Resigning' || e.status === 'Resigned' || e.status === 'Retained');
    const allEmp = DataStore.getEmployees();

    select.innerHTML = `
      ${(employees.length > 0 ? employees : allEmp).map(e => `
        <option value="${e.id}" ${e.id === this.activeEmpId ? 'selected' : ''}>
          ${e.name} (${e.id} - ${e.department})
        </option>
      `).join('')}
    `;

    select.addEventListener('change', (e) => {
      this.activeEmpId = e.target.value;
      this.render();
    });
  },

  render() {
    const emp = DataStore.getEmployeeById(this.activeEmpId);
    if (!emp) return;

    const transition = DataStore.getTransitionByEmployee(this.activeEmpId) ||
                       DataStore.ensureTransitionRecord(emp.id, emp.name, 'Assigned Successor');

    // Header info
    document.getElementById('progEmpName').textContent = `${emp.name} (${emp.id})`;
    document.getElementById('progDept').textContent = `${emp.designation} • ${emp.department}`;
    document.getElementById('progSuccessor').textContent = transition.replacementEmpName || 'Successor Candidate';

    // Scores (0 - 100%)
    const docScore = transition.documentationScore || 0;
    const trainScore = transition.trainingScore || 0;
    const shadowScore = transition.shadowScore || 0;
    const ktScore = transition.ktScore || 0;
    const handoverScore = transition.handoverScore || 0;
    const approvalScore = transition.approvalScore || 0;

    const overall = Math.round((docScore + trainScore + shadowScore + ktScore + handoverScore + approvalScore) / 6);

    // Render overall progress bar
    document.getElementById('overallProgressBar').style.width = `${overall}%`;
    document.getElementById('overallProgressText').textContent = `${overall}% Completed`;

    // Render individual 6 pillar cards
    this.renderPillar('pillarDoc', docScore, 'Documentation (SOPs & Docs)');
    this.renderPillar('pillarTrain', trainScore, 'Training & Walkthroughs');
    this.renderPillar('pillarShadow', shadowScore, 'Shadowing Sessions');
    this.renderPillar('pillarKT', ktScore, 'Knowledge Transfer (Tasks)');
    this.renderPillar('pillarHandover', handoverScore, 'Project & Code Handover');
    this.renderPillar('pillarApproval', approvalScore, 'Final Signoff & Approval');
  },

  renderPillar(elementId, score, title) {
    const elem = document.getElementById(elementId);
    if (!elem) return;

    const statusBadge = score === 100 ? '<span class="badge-status badge-completed">Completed</span>' :
                        score > 0 ? '<span class="badge-status badge-in-progress">In Progress</span>' :
                        '<span class="badge-status badge-pending">Pending</span>';

    elem.innerHTML = `
      <div class="progress-pillar-card">
        <div class="d-flex align-items-center justify-content-between mb-2">
          <h6 class="fw-bold mb-0 text-main">${title}</h6>
          ${statusBadge}
        </div>
        <div class="custom-progress-bar">
          <div class="custom-progress-fill" style="width: ${score}%"></div>
        </div>
        <div class="d-flex align-items-center justify-content-between small text-muted">
          <span>Completion Score</span>
          <span class="fw-bold text-primary">${score}%</span>
        </div>
        <button class="btn btn-outline-custom btn-sm w-100 mt-3" onclick="ProgressModule.openUpdateModal('${elementId}', ${score}, '${title}')">
          <i class="bi bi-sliders me-1"></i> Update Stage
        </button>
      </div>
    `;
  },

  openUpdateModal(pillarKey, currentScore, title) {
    document.getElementById('pillarUpdateTitle').textContent = `Update Stage: ${title}`;
    document.getElementById('pillarKeyInput').value = pillarKey;
    document.getElementById('pillarScoreInput').value = currentScore;
    document.getElementById('pillarScoreValueLabel').textContent = `${currentScore}%`;

    const rangeInput = document.getElementById('pillarScoreInput');
    rangeInput.oninput = (e) => {
      document.getElementById('pillarScoreValueLabel').textContent = `${e.target.value}%`;
    };

    const modal = new bootstrap.Modal(document.getElementById('updatePillarModal'));
    modal.show();
  },

  savePillarUpdate() {
    const pillarKey = document.getElementById('pillarKeyInput').value;
    const score = parseInt(document.getElementById('pillarScoreInput').value) || 0;

    const transition = DataStore.getTransitionByEmployee(this.activeEmpId);
    if (!transition) return;

    const scoreMap = {
      pillarDoc: 'documentationScore',
      pillarTrain: 'trainingScore',
      pillarShadow: 'shadowScore',
      pillarKT: 'ktScore',
      pillarHandover: 'handoverScore',
      pillarApproval: 'approvalScore'
    };

    const fieldName = scoreMap[pillarKey];
    if (fieldName) {
      const updates = {};
      updates[fieldName] = score;

      DataStore.updateTransition(transition.id, updates);
      App.showToast(`Transition stage updated to ${score}%.`, 'success');

      const modalElem = document.getElementById('updatePillarModal');
      const bsModal = bootstrap.Modal.getInstance(modalElem);
      if (bsModal) bsModal.hide();

      this.render();
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('transition-progress.html')) {
    ProgressModule.init();
  }
});
