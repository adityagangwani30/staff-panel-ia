/* ============================================================
   CHART CONTEXT AND GRAPH OVERRIDES — IntelAbroad Staff Panel
   ============================================================ */

const Charts = {
  // Get CSS variables dynamically
  getStyle(varName) {
    return getComputedStyle(document.body).getPropertyValue(varName).trim();
  },

  gridColor() {
    return this.getStyle('--border-soft') || '#18181b';
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

  baseAxisOpts() {
    const grid = this.gridColor();
    const text = this.textColor();
    return {
      x: {
        grid: { color: grid, drawBorder: false, display: false },
        ticks: { color: text, font: { family: 'Inter', size: 10 } }
      },
      y: {
        grid: { color: grid, drawBorder: false },
        ticks: { color: text, font: { family: 'Inter', size: 10 } },
        beginAtZero: true
      }
    };
  },

  lineDS(label, data, color, fill = false) {
    return {
      label: label,
      data: data,
      borderColor: color,
      backgroundColor: fill ? this.hexToRgba(color, 0.08) : 'transparent',
      tension: 0.35,
      fill: fill,
      pointRadius: 2,
      pointHoverRadius: 5,
      pointBackgroundColor: color,
      pointBorderColor: '#ffffff',
      pointBorderWidth: 0,
      borderWidth: 2
    };
  },

  barDS(label, data, color) {
    return {
      label: label,
      data: data,
      backgroundColor: color,
      borderRadius: 4,
      maxBarThickness: 24
    };
  },

  hexToRgba(hex, a) {
    const c = hex.replace('#', '');
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    return `rgba(${r},${g},${b},${a})`;
  },

  lineOpts(pct = false) {
    const self = this;
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'top',
          align: 'end',
          labels: { color: self.textColor(), font: { family: 'Inter', size: 11 }, boxWidth: 10 }
        },
        tooltip: self.tooltipConfig()
      },
      scales: pct ? {
        x: self.baseAxisOpts().x,
        y: Object.assign({}, self.baseAxisOpts().y, {
          ticks: {
            color: self.textColor(),
            font: { family: 'Inter', size: 10 },
            callback: v => v + '%'
          }
        })
      } : self.baseAxisOpts()
    };
  },

  barOpts() {
    const self = this;
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          align: 'end',
          labels: { color: self.textColor(), font: { family: 'Inter', size: 11 }, boxWidth: 10 }
        },
        tooltip: self.tooltipConfig()
      },
      scales: self.baseAxisOpts()
    };
  },

  hbarOpts() {
    const self = this;
    return {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: self.tooltipConfig()
      },
      scales: self.baseAxisOpts()
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
  },

  stackOpts() {
    const self = this;
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          align: 'end',
          labels: { color: self.textColor(), font: { family: 'Inter', size: 11 }, boxWidth: 10 }
        },
        tooltip: self.tooltipConfig()
      },
      scales: {
        x: Object.assign({}, self.baseAxisOpts().x, { stacked: true }),
        y: Object.assign({}, self.baseAxisOpts().y, { stacked: true })
      }
    };
  }
};

window.Charts = Charts;
