/**
 * Interactive Data Table Component
 * Renders data grid, handles sorting, filtering, and export.
 */
window.DataTable = {
  render(dataset, filterState) {
    const tbody = document.getElementById('table-body');
    const countEl = document.getElementById('table-count-text');

    if (!tbody) return;

    if (countEl) {
      countEl.textContent = `총 ${dataset.length}개 사업 표시 중 (전체 ${window.appState.processedData.length}개)`;
    }

    if (dataset.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align: center; padding: 2.5rem; color: #94a3b8;">
            조건에 부합하는 사업 내역이 없습니다.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = dataset.map(item => {
      const isPositive = item.growthRate >= 0;
      const rateText = item.growthRate !== undefined ? `${isPositive ? '+' : ''}${item.growthRate}%` : '-';
      const diffText = item.diff !== undefined ? `${item.diff >= 0 ? '+' : ''}${item.diff.toLocaleString()}억` : '-';

      return `
        <tr class="${item.isNew ? 'new-row' : ''}" onclick="window.DetailModal.open(${item.id})">
          <td class="text-center" style="font-weight: 700; color: #64748b;">${item.id}</td>
          <td><span class="badge badge-category">${item.category}</span></td>
          <td style="font-weight: 600;">
            ${item.isNew ? '<span class="badge badge-new" style="margin-right: 4px;">NEW</span>' : ''}
            ${item.projectName}
          </td>
          <td class="text-center" style="color: #64748b; font-size: 0.8rem;">${item.unit}</td>
          <td class="text-right">${item.val2026.toLocaleString()}</td>
          <td class="text-right" style="font-weight: 700; color: #1a365d;">${item.val2027.toLocaleString()}</td>
          <td class="text-right" style="font-weight: 600; color: ${item.diff >= 0 ? 'var(--color-positive)' : 'var(--color-negative)'};">
            ${diffText}
          </td>
          <td class="text-right">
            <span class="badge ${isPositive ? 'badge-positive' : 'badge-negative'}">${rateText}</span>
          </td>
          <td class="text-center">
            <button class="btn-header" style="padding: 4px 10px; font-size: 0.75rem; background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1;"
                    onclick="event.stopPropagation(); window.DetailModal.open(${item.id})">
              상세보기
            </button>
          </td>
        </tr>
      `;
    }).join('');

    this.updateSortHeaders(filterState);
  },

  updateSortHeaders(filterState) {
    const headers = document.querySelectorAll('.data-table th.sortable');
    headers.forEach(th => {
      const col = th.dataset.col;
      const icon = th.querySelector('.sort-icon');
      if (icon) {
        if (filterState.sortBy === col) {
          icon.textContent = filterState.sortOrder === 'asc' ? ' ▲' : ' ▼';
          th.style.color = 'var(--color-accent)';
        } else {
          icon.textContent = ' ↕';
          th.style.color = '';
        }
      }
    });
  },

  sortBy(column) {
    const current = window.appState.currentFilter;
    let nextOrder = 'asc';
    if (current.sortBy === column && current.sortOrder === 'asc') {
      nextOrder = 'desc';
    }
    window.appState.setFilter({ sortBy: column, sortOrder: nextOrder });
  },

  exportCSV() {
    const data = window.appState.getFilteredData();
    if (!data || data.length === 0) {
      window.DetailModal.showToast('내보낼 데이터가 없습니다.', 'error');
      return;
    }

    const headers = ['연번', '분야 (중점영역)', '세부 사업 / 주요 지표', '구분/단위', '2026년 (A)', '2027년 정부안 (B)', '증감 (B-A)', '증가율 (%)', '핵심 내용 및 보도자료 박스 원문 근거'];
    const rows = data.map(item => [
      item.id,
      `"${(item.category || '').replace(/"/g, '""')}"`,
      `"${(item.projectName || '').replace(/"/g, '""')}"`,
      item.unit,
      item.val2026,
      item.val2027,
      item.diff,
      `"${item.growthRate}%"`,
      `"${(item.description || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `국방예산_대시보드_추출자료_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    window.DetailModal.showToast('CSV 파일이 다운로드되었습니다.', 'success');
  }
};
