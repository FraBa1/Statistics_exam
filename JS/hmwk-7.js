let securityChart = null;

function runSimulation() {
  const numSim = Math.max(1, parseInt(document.getElementById("numSim").value) || 1);
  const m = Math.max(1, parseInt(document.getElementById("attackers").value) || 1);
  const p = Math.min(1, Math.max(0, parseFloat(document.getElementById("prob").value) || 0));
  const n = Math.max(1, parseInt(document.getElementById("weeks").value) || 1);

  const datasets = [];
  const safeProb = Math.pow(1 - p, m); 

  for (let s = 0; s < numSim; s++) {
    const trajectory = [];
    let score = 0;

    for (let week = 0; week < n; week++) {
      const breached = Math.random() < (1 - safeProb);
      score += breached ? -1 : 1;
      trajectory.push({ x: week + 1, y: score });
    }

    datasets.push({
      label: `Trajectory ${s+1}`,
      data: trajectory,
      borderColor: `hsla(${(s / Math.max(1, numSim)) * 360},70%,50%,0.6)`,
      borderWidth: 1,
      fill: false,
      pointRadius: 0,
      tension: 0.15
    });
  }

  const ctx = document.getElementById("securityChart").getContext("2d");
  if (securityChart) securityChart.destroy();

  securityChart = new Chart(ctx, {
    type: 'line',
    data: { datasets },
    options: {
      responsive: true,
      animation: false,
      parsing: false,
      scales: {
        x: {
          type: 'linear',
          title: { display: true, text: 'Week' },
          ticks: { precision: 0, stepSize: 1 }
        },
        y: {
          title: { display: true, text: 'Server Security Score' },
          ticks: { precision: 0 }
        }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });

  const finalScores = datasets.map(ds => ds.data[ds.data.length - 1].y);
  showBinomialComparison(finalScores, n, m, p);
}

// binomial graphic

function showBinomialComparison(simulationResults, n, m, p) {
  const secureProb = Math.pow(1 - p, m);

  const freq = {};
  simulationResults.forEach(score => {
    freq[score] = (freq[score] || 0) + 1;
  });

  const labels = Object.keys(freq).map(Number).sort((a, b) => a - b);
  const values = labels.map(l => freq[l]);

  function binomialPMF(k, n, p) {
    function comb(n, k) {
      if (k < 0 || k > n) return 0;
      let c = 1;
      for (let i = 0; i < k; i++) {
        c = c * (n - i) / (i + 1);
      }
      return c;
    }
    return comb(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
  }

  const theoretical = labels.map(score => {
    const k = (score + n) / 2;
    return (k % 1 === 0 ? binomialPMF(k, n, secureProb) : 0);
  });

  const ctx = document.getElementById("binomialChart").getContext("2d");

  if (window.binomialChartInstance) {
    window.binomialChartInstance.destroy();
  }

  window.binomialChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Simulation Histogram",
          data: values,
          backgroundColor: "rgba(0, 200, 255, 0.4)",
          borderColor: "rgba(0, 200, 255, 1)",
          borderWidth: 1
        },
        {
          label: "Theoretical Binomial",
          data: theoretical.map(t => t * simulationResults.length),
          type: "line",
          borderColor: "#ff4f6d",
          borderWidth: 2,
          fill: false,
          tension: 0.25
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        x: { title: { display: true, text: "Final Score" } },
        y: { title: { display: true, text: "Frequency" } }
      }
    }
  });
}
