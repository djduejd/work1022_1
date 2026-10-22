/**
 * KPI Cards Renderer
 * Animates numeric counts and updates top-level summary cards.
 */
window.KPICards = {
  formatWon(num) {
    if (num >= 10000) {
      const jo = Math.floor(num / 10000);
      const eok = Math.round(num % 10000);
      return eok > 0 ? `${jo}조 ${eok.toLocaleString()}억` : `${jo}조`;
    }
    return `${Math.round(num).toLocaleString()}억`;
  },

  animateValue(elementId, start, end, duration = 600, formatter = (v) => v.toLocaleString()) {
    const el = document.getElementById(elementId);
    if (!el) return;

    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const current = start + progress * (end - start);
      el.textContent = formatter(current);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  },

  render(kpi) {
    // 1. Total Projects
    this.animateValue('kpi-total-projects', 0, kpi.totalProjects, 500, (v) => Math.round(v));

    // 2. 2026 Total Budget
    this.animateValue('kpi-total-2026', 0, kpi.total2026, 700, this.formatWon);

    // 3. 2027 Total Budget
    this.animateValue('kpi-total-2027', 0, kpi.total2027, 700, this.formatWon);

    // 4. Net Difference & Growth Rate
    const diffEl = document.getElementById('kpi-diff-val');
    const badgeEl = document.getElementById('kpi-growth-badge');
    if (diffEl) {
      diffEl.textContent = (kpi.totalDiff >= 0 ? '+' : '') + this.formatWon(kpi.totalDiff) + ' 원';
    }
    if (badgeEl) {
      const isPositive = kpi.avgGrowthRate >= 0;
      badgeEl.className = `badge ${isPositive ? 'badge-positive' : 'badge-negative'}`;
      badgeEl.textContent = `${isPositive ? '▲ +' : '▼ '}${kpi.avgGrowthRate}%`;
    }

    // 5. New Projects Summary
    const newCountEl = document.getElementById('kpi-new-count');
    const newTotalEl = document.getElementById('kpi-new-total');
    if (newCountEl) newCountEl.textContent = `${kpi.newProjectsCount}개 사업`;
    if (newTotalEl) newTotalEl.textContent = `${this.formatWon(kpi.newProjectsTotal)} 원 (${kpi.newProjectsRatio}%)`;
  }
};
