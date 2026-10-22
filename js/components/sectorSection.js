/**
 * Sector / Category Tab Filter Component
 */
window.SectorSection = {
  renderTabs(categories, activeCategory = 'ALL') {
    const container = document.getElementById('category-tabs');
    const selectFilter = document.getElementById('category-select');

    if (container) {
      const allBtn = `
        <button class="category-tab-btn ${activeCategory === 'ALL' ? 'active' : ''}" 
                onclick="window.SectorSection.selectCategory('ALL')">
          전체 분야 (${window.appState.processedData.length})
        </button>
      `;

      const tabBtns = categories.map(cat => {
        const count = window.appState.processedData.filter(p => p.category === cat).length;
        const isActive = activeCategory === cat;
        return `
          <button class="category-tab-btn ${isActive ? 'active' : ''}" 
                  onclick="window.SectorSection.selectCategory('${cat}')">
            ${cat} (${count})
          </button>
        `;
      }).join('');

      container.innerHTML = allBtn + tabBtns;
    }

    if (selectFilter) {
      const options = ['<option value="ALL">전체 분야 보기</option>'].concat(
        categories.map(cat => `<option value="${cat}" ${activeCategory === cat ? 'selected' : ''}>${cat}</option>`)
      );
      selectFilter.innerHTML = options.join('');
    }
  },

  selectCategory(category) {
    window.appState.setFilter({ category });
  }
};
