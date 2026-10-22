/**
 * Central State Store for Budget Dashboard
 */
class DashboardState {
  constructor() {
    this.rawData = [];
    this.processedData = [];
    this.kpi = {
      totalProjects: 0,
      total2026: 0,
      total2027: 0,
      totalDiff: 0,
      avgGrowthRate: 0,
      newProjectsCount: 0,
      newProjectsTotal: 0,
      newProjectsRatio: 0
    };
    this.categories = [];
    this.currentFilter = {
      category: 'ALL',
      onlyNew: false,
      searchQuery: '',
      sortBy: 'id',
      sortOrder: 'asc'
    };
    this.listeners = [];
  }

  subscribe(listener) {
    this.listeners.push(listener);
  }

  notify(changeType, payload) {
    this.listeners.forEach(fn => fn(changeType, payload, this));
  }

  setData(dataList) {
    this.rawData = dataList;
    // Process and classify data
    if (window.Classifier) {
      this.processedData = window.Classifier.processDataset(dataList);
      this.kpi = window.Classifier.calculateKPI(this.processedData);
      this.categories = window.Classifier.extractCategories(this.processedData);
    } else {
      this.processedData = dataList;
    }
    this.notify('DATA_LOADED', this.processedData);
  }

  setFilter(filterUpdates) {
    this.currentFilter = { ...this.currentFilter, ...filterUpdates };
    this.notify('FILTER_CHANGED', this.currentFilter);
  }

  getFilteredData() {
    let result = [...this.processedData];

    // Filter by Category
    if (this.currentFilter.category && this.currentFilter.category !== 'ALL') {
      result = result.filter(item => item.category === this.currentFilter.category);
    }

    // Filter by Only New
    if (this.currentFilter.onlyNew) {
      result = result.filter(item => item.isNew);
    }

    // Filter by Search Query
    if (this.currentFilter.searchQuery) {
      const q = this.currentFilter.searchQuery.toLowerCase().trim();
      result = result.filter(item => {
        const nameMatch = (item.projectName || '').toLowerCase().includes(q);
        const descMatch = (item.description || '').toLowerCase().includes(q);
        const catMatch = (item.category || '').toLowerCase().includes(q);
        const deptMatch = (item.department || '').toLowerCase().includes(q);
        return nameMatch || descMatch || catMatch || deptMatch;
      });
    }

    // Sort
    const { sortBy, sortOrder } = this.currentFilter;
    if (sortBy) {
      result.sort((a, b) => {
        let valA = a[sortBy];
        let valB = b[sortBy];

        if (typeof valA === 'string') {
          valA = valA.toLowerCase();
          valB = (valB || '').toLowerCase();
          return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }

        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      });
    }

    return result;
  }
}

window.appState = new DashboardState();
