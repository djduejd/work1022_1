/**
 * Detail Modal & Toast Notifications Component
 */
window.DetailModal = {
  open(id) {
    const item = window.appState.processedData.find(p => p.id === id);
    if (!item) return;

    const modal = document.getElementById('detail-modal');
    const titleEl = document.getElementById('modal-title');
    const catEl = document.getElementById('modal-category');
    const badgeWrap = document.getElementById('modal-badge-wrap');
    const deptEl = document.getElementById('modal-department');
    const val2026El = document.getElementById('modal-val2026');
    const val2027El = document.getElementById('modal-val2027');
    const diffEl = document.getElementById('modal-diff');
    const quoteEl = document.getElementById('modal-quote-text');

    if (titleEl) titleEl.textContent = item.projectName;
    if (catEl) catEl.textContent = item.category;
    if (deptEl) deptEl.textContent = item.department ? `소관: ${item.department}` : '';

    if (badgeWrap) {
      if (item.isNew) {
        badgeWrap.innerHTML = `<span class="badge badge-new">★ NEW 신규 사업 (${item.newReason || '신규'})</span>`;
      } else {
        badgeWrap.innerHTML = '';
      }
    }

    if (val2026El) val2026El.textContent = `${item.val2026.toLocaleString()} 억원`;
    if (val2027El) val2027El.textContent = `${item.val2027.toLocaleString()} 억원`;

    if (diffEl) {
      const isPositive = item.diff >= 0;
      diffEl.textContent = `${isPositive ? '+' : ''}${item.diff.toLocaleString()} 억원 (${isPositive ? '+' : ''}${item.growthRate}%)`;
      diffEl.style.color = isPositive ? 'var(--color-positive)' : 'var(--color-negative)';
    }

    if (quoteEl) {
      quoteEl.textContent = item.description || '원문 근거 내용이 등록되어 있지 않습니다.';
    }

    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  },

  close() {
    const modal = document.getElementById('detail-modal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  },

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
};
