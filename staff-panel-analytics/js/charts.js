/* ============================================================
   CHART CONTEXT AND GRAPH OVERRIDES — IntelAbroad Staff Panel
   ============================================================ */

const Charts = {
  // Get CSS variables dynamically
  getStyle(varName) {
    return getComputedStyle(document.body).getPropertyValue(varName).trim();
  },

  textColor() {
    return this.getStyle('--text-3') || '#a1a1aa';
  },

  tooltipConfig() {
    return {
      backgroundColor: '#0c0c0e',
      titleColor: '#ffffff',
      bodyColor: '#e4e4e7',
      borderColor: '#27272a',
      borderWidth: 1,
      padding: 10,
      cornerRadius: 6,
      titleFont: { family: 'Inter', size: 11, weight: '600' },
      bodyFont: { family: 'Inter', size: 11 },
      displayColors: true,
      boxWidth: 8,
      boxHeight: 8,
      boxPadding: 4
    };
  },

  donutOpts() {
    const self = this;
    return {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '72%',
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: self.textColor(),
            font: { family: 'Inter', size: 10.5 },
            boxWidth: 12,
            padding: 8
          }
        },
        tooltip: self.tooltipConfig()
      }
    };
  }
};

window.Charts = Charts;
