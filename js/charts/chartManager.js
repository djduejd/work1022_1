/**
 * Chart Manager using Chart.js
 * Renders interactive sector charts, budget comparison bars, and growth rankings.
 */
window.ChartManager = {
  instances: {},

  destroyAll() {
    Object.keys(this.instances).forEach(key => {
      if (this.instances[key]) {
        this.instances[key].destroy();
        this.instances[key] = null;
      }
    });
  },

  /**
   * Format numbers to Korean currency string
   */
  formatBudget(val) {
    if (val >= 10000) {
      const jo = Math.floor(val / 10000);
      const eok = val % 10000;
      return eok > 0 ? `${jo}조 ${eok.toLocaleString()}억` : `${jo}조 원`;
    }
    return `${val.toLocaleString()}억 원`;
  },

  /**
   * Render all charts based on current state dataset
   */
  renderCharts(dataset) {
    this.destroyAll();
    const categories = window.Classifier.getCategorySummary(dataset);

    this.renderSectorBarChart(categories);
    this.renderSectorDonutChart(categories);
    this.renderGrowthRankChart(dataset);
  },

  /**
   * 1. Sector Comparison Bar Chart (2026 vs 2027)
   */
  renderSectorBarChart(categories) {
    const canvas = document.getElementById('sectorBarChart');
    if (!canvas) return;

    // Simplify labels for clean x-axis
    const labels = categories.map(c => {
      let name = c.name.replace(/^[①②③④⑤⑥⑦⑧⑨⑩\d\.\s]+/, '');
      return name.length > 10 ? name.substring(0, 9) + '…' : name;
    });

    const data2026 = categories.map(c => c.val2026);
    const data2027 = categories.map(c => c.val2027);

    const ctx = canvas.getContext('2d');
    this.instances.sectorBar = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: '2026년 예산',
            data: data2026,
            backgroundColor: 'rgba(148, 163, 184, 0.75)',
            borderColor: '#94a3b8',
            borderWidth: 1,
            borderRadius: 4
          },
          {
            label: '2027년 정부안',
            data: data2027,
            backgroundColor: 'rgba(37, 99, 235, 0.85)',
            borderColor: '#1d4ed8',
            borderWidth: 1,
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: { font: { family: 'Pretendard', size: 12 } }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                return ` ${context.dataset.label}: ${this.formatBudget(context.raw)}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { family: 'Pretendard', size: 11 } }
          },
          y: {
            grid: { color: '#f1f5f9' },
            ticks: {
              callback: (val) => val >= 10000 ? `${(val/10000).toFixed(1)}조` : `${val}억`,
              font: { family: 'Pretendard', size: 11 }
            }
          }
        }
      }
    });
  },

  /**
   * 2. Sector Donut Chart (2027 Budget Share)
   */
  renderSectorDonutChart(categories) {
    const canvas = document.getElementById('sectorDonutChart');
    if (!canvas) return;

    const labels = categories.map(c => c.name.replace(/^[①②③④⑤⑥⑦⑧⑨⑩\d\.\s]+/, ''));
    const data = categories.map(c => c.val2027);

    const backgroundColors = [
      '#1e40af', '#2563eb', '#3b82f6', '#0ea5e9',
      '#059669', '#10b981', '#f59e0b', '#8b5cf6'
    ];

    const ctx = canvas.getContext('2d');
    this.instances.sectorDonut = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: backgroundColors.slice(0, categories.length),
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              boxWidth: 12,
              font: { family: 'Pretendard', size: 11 }
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const pct = total > 0 ? ((context.raw / total) * 100).toFixed(1) : 0;
                return ` ${context.label}: ${this.formatBudget(context.raw)} (${pct}%)`;
              }
            }
          }
        },
        cutout: '62%'
      }
    });
  },

  /**
   * 3. Growth Rank Chart (Top 5 Growth Rates)
   */
  renderGrowthRankChart(dataset) {
    const canvas = document.getElementById('growthRankChart');
    if (!canvas) return;

    // Filter projects that had 2026 budget to avoid infinite growth comparison
    const eligible = dataset
      .filter(p => p.val2026 > 0 && p.growthRate > 0)
      .sort((a, b) => b.growthRate - a.growthRate)
      .slice(0, 5);

    const labels = eligible.map(p => {
      const name = p.projectName;
      return name.length > 12 ? name.substring(0, 11) + '…' : name;
    });

    const rates = eligible.map(p => p.growthRate);

    const ctx = canvas.getContext('2d');
    this.instances.growthRank = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: '증가율 (%)',
          data: rates,
          backgroundColor: 'rgba(5, 150, 105, 0.8)',
          borderColor: '#059669',
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` +${ctx.raw}% (${eligible[ctx.dataIndex].val2026.toLocaleString()}억 → ${eligible[ctx.dataIndex].val2027.toLocaleString()}억)`
            }
          }
        },
        scales: {
          x: {
            grid: { color: '#f1f5f9' },
            ticks: { callback: (v) => `+${v}%` }
          },
          y: {
            grid: { display: false },
            ticks: { font: { family: 'Pretendard', size: 11 } }
          }
        }
      }
    });
  }
};
