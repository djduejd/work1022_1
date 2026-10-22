/**
 * New Initiatives Section Renderer
 * Visualizes newly established or initiated defense projects.
 */
window.NewInitiatives = {
  render(dataset, kpi) {
    const container = document.getElementById('new-cards-container');
    const ratioBar = document.getElementById('new-ratio-bar');
    const ratioText = document.getElementById('new-ratio-text');

    // Update Ratio Bar
    if (ratioBar) {
      ratioBar.style.width = `${Math.min(kpi.newProjectsRatio, 100)}%`;
    }
    if (ratioText) {
      ratioText.textContent = `${kpi.newProjectsRatio}% (${window.KPICards.formatWon(kpi.newProjectsTotal)}원)`;
    }

    if (!container) return;

    // Filter New Projects
    const newProjects = dataset.filter(p => p.isNew);

    if (newProjects.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #94a3b8;">
          감지된 신규 사업이 없습니다.
        </div>
      `;
      return;
    }

    // Render Cards
    container.innerHTML = newProjects.map(item => `
      <div class="new-card-item" onclick="window.DetailModal.open(${item.id})">
        <div>
          <div class="new-card-top">
            <span class="new-card-category">${item.category}</span>
            <span class="badge badge-new">★ NEW 신규</span>
          </div>
          <h4 class="new-card-title">${item.projectName}</h4>
          <p class="new-card-desc">${item.description.replace(/\n/g, ' ')}</p>
        </div>
        <div class="new-card-bottom">
          <div>
            <div style="font-size: 0.72rem; color: #64748b;">2027년 예산</div>
            <div class="new-card-budget">${window.ChartManager.formatBudget(item.val2027)}</div>
          </div>
          <span class="new-card-tag">${item.newReason || '신규 착수'}</span>
        </div>
      </div>
    `).join('');
  }
};
