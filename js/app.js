/**
 * Main Application Lifecycle
 */
document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Uploader
  window.FileUploader.init();

  // 2. Subscribe Components to Central State
  window.appState.subscribe((changeType, payload, state) => {
    if (changeType === 'DATA_LOADED') {
      // Update Top KPIs
      window.KPICards.render(state.kpi);

      // Update New Initiatives
      window.NewInitiatives.render(state.processedData, state.kpi);

      // Update Sector Tabs
      window.SectorSection.renderTabs(state.categories, state.currentFilter.category);

      // Render Charts
      window.ChartManager.renderCharts(state.processedData);

      // Render Data Table
      window.DataTable.render(state.getFilteredData(), state.currentFilter);
    } else if (changeType === 'FILTER_CHANGED') {
      // Re-render tabs active status
      window.SectorSection.renderTabs(state.categories, state.currentFilter.category);

      // Re-render filtered Table
      window.DataTable.render(state.getFilteredData(), state.currentFilter);
    }
  });

  // 3. Bind UI Filter Controls
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      window.appState.setFilter({ searchQuery: e.target.value });
    });
  }

  const categorySelect = document.getElementById('category-select');
  if (categorySelect) {
    categorySelect.addEventListener('change', (e) => {
      window.appState.setFilter({ category: e.target.value });
    });
  }

  const onlyNewToggle = document.getElementById('only-new-toggle');
  if (onlyNewToggle) {
    onlyNewToggle.addEventListener('change', (e) => {
      window.appState.setFilter({ onlyNew: e.target.checked });
    });
  }

  // 4. Modal Close Handlers (ESC, Backdrop click)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      window.DetailModal.close();
    }
  });

  const modalBackdrop = document.getElementById('detail-modal');
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) {
        window.DetailModal.close();
      }
    });
  }

  // 5. Load Default Sample Data
  if (window.DEFAULT_BUDGET_DATA) {
    window.appState.setData(window.DEFAULT_BUDGET_DATA);
  }
});
