/**
 * Classifier & Analytics Engine
 * Identifies New Initiatives, aggregates KPI metrics, and groups categories.
 */
window.Classifier = {
  /**
   * Determine whether a project is a "New Initiative"
   */
  detectNewInitiative(item) {
    const val2026 = Number(item.val2026) || 0;
    const name = (item.projectName || '').toLowerCase();
    const desc = (item.description || '').toLowerCase();

    // Condition 1: Previous year budget was 0 or empty
    if (val2026 === 0) {
      return { isNew: true, reason: '신규 편성 (전년 예산 0원)' };
    }

    // Condition 2: Title has keywords
    const newKeywords = ['신규', '신설', '착수', '도입', '신규사업'];
    for (const kw of newKeywords) {
      if (name.includes(kw)) {
        return { isNew: true, reason: `신규 추진 (${kw})` };
      }
    }

    // Condition 3: Description emphasizes new budget or initiative
    if (desc.includes('신규') || desc.includes('신설') || desc.includes('착수')) {
      return { isNew: true, reason: '세부 내용 내 신규 착수 명시' };
    }

    return { isNew: false, reason: '' };
  },

  /**
   * Process and normalize all raw records
   */
  processDataset(rawList) {
    return rawList.map((item, index) => {
      const val2026 = Number(item.val2026) || 0;
      const val2027 = Number(item.val2027) || 0;
      let diff = item.diff !== undefined && item.diff !== null ? Number(item.diff) : (val2027 - val2026);
      
      let growthRate = 0;
      if (item.growthRate !== undefined && item.growthRate !== null) {
        growthRate = Number(item.growthRate);
      } else {
        if (val2026 > 0) {
          growthRate = Math.round(((val2027 - val2026) / val2026) * 1000) / 10;
        } else if (val2027 > 0) {
          growthRate = 100.0;
        }
      }

      // Check new initiative
      const detection = this.detectNewInitiative({ ...item, val2026, val2027 });
      const isNew = item.isNew !== undefined ? Boolean(item.isNew) : detection.isNew;
      const newReason = item.newReason || detection.reason;

      return {
        id: item.id || (index + 1),
        category: (item.category || '기타 사업').trim(),
        projectName: (item.projectName || '사업명 미지정').trim(),
        department: item.department || '',
        unit: item.unit || '억원',
        val2026,
        val2027,
        diff,
        growthRate,
        description: item.description || '',
        isNew,
        newReason
      };
    });
  },

  /**
   * Calculate top-level KPIs
   */
  calculateKPI(list) {
    const totalProjects = list.length;
    let total2026 = 0;
    let total2027 = 0;
    let newProjectsCount = 0;
    let newProjectsTotal = 0;

    list.forEach(p => {
      total2026 += p.val2026;
      total2027 += p.val2027;
      if (p.isNew) {
        newProjectsCount++;
        newProjectsTotal += p.val2027;
      }
    });

    const totalDiff = total2027 - total2026;
    const avgGrowthRate = total2026 > 0 ? (Math.round((totalDiff / total2026) * 1000) / 10) : 100.0;
    const newProjectsRatio = total2027 > 0 ? (Math.round((newProjectsTotal / total2027) * 1000) / 10) : 0;

    return {
      totalProjects,
      total2026,
      total2027,
      totalDiff,
      avgGrowthRate,
      newProjectsCount,
      newProjectsTotal,
      newProjectsRatio
    };
  },

  /**
   * Group data by category for charts
   */
  getCategorySummary(list) {
    const categoryMap = {};

    list.forEach(p => {
      const cat = p.category || '기타';
      if (!categoryMap[cat]) {
        categoryMap[cat] = {
          name: cat,
          val2026: 0,
          val2027: 0,
          count: 0,
          newCount: 0
        };
      }
      categoryMap[cat].val2026 += p.val2026;
      categoryMap[cat].val2027 += p.val2027;
      categoryMap[cat].count += 1;
      if (p.isNew) categoryMap[cat].newCount += 1;
    });

    return Object.values(categoryMap).map(c => ({
      ...c,
      diff: c.val2027 - c.val2026,
      growthRate: c.val2026 > 0 ? (Math.round(((c.val2027 - c.val2026) / c.val2026) * 1000) / 10) : 100
    }));
  },

  /**
   * Extract distinct category names
   */
  extractCategories(list) {
    const set = new Set();
    list.forEach(p => {
      if (p.category) set.add(p.category.trim());
    });
    return Array.from(set);
  }
};
