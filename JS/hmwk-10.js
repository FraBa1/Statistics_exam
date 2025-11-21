let singleChart = null;
let totalCountChart = null;

function updateSinglePath() {
  const lambda = parseFloat(document.getElementById("lambda").value) || 0;
  const T = parseFloat(document.getElementById("time").value) || 1;
  const n = parseInt(document.getElementById("subintervals").value) || 5000;

  const dt = T / n;
  const p = lambda * dt;

  const cumulativeCounts = [];
  let cumulative = 0;

  for (let i = 0; i < n; i++) {
    if (Math.random() < p) cumulative++;
    cumulativeCounts.push(cumulative);
  }

  const labels = Array.from({ length: n }, (_, i) => ((i + 1) * dt).toFixed(2));

if (singleChart) {
  singleChart.data.labels = [0, ...labels];
  singleChart.data.datasets[0].data = [0, ...cumulativeCounts];
  singleChart.update();
} else {
  const ctx = document.getElementById("singleChart").getContext("2d");
  singleChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [0, ...labels],
      datasets: [{
        label: "Cumulative Count",
        data: [0, ...cumulativeCounts],
        borderColor: "#00eaFF",
        backgroundColor: "rgba(0,234,255,0.1)",
        fill: true,
        stepped: true,
      }],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { title: { display: true, text: "Time" } },
        y: { 
          title: { display: true, text: "Cumulative Count" }, 
          beginAtZero: true,
          ticks: { stepSize: 1 }
        }
      }
    }
  });
}
}

function runSimulation() {
  const lambda = parseFloat(document.getElementById("lambda").value) || 0;
  const T = parseFloat(document.getElementById("time").value) || 1;
  const n = parseInt(document.getElementById("subintervals").value) || 5000;
  const numSim = parseInt(document.getElementById("numSim").value) || 5000;

  const dt = T / n;
  const p = lambda * dt;

  const totalCounts = [];

  for (let sim = 0; sim < numSim; sim++) {
    let cumulative = 0;
    for (let i = 0; i < n; i++) {
      if (Math.random() < p) cumulative++;
    }
    totalCounts.push(cumulative);
  }

  const maxCount = Math.max(...totalCounts);
  const bins = Array.from({ length: maxCount + 1 }, (_, i) => i);
  const counts = bins.map(bin => totalCounts.filter(x => x === bin).length);

  const poisson = (k, lambdaT) => Math.pow(lambdaT, k) * Math.exp(-lambdaT) / factorial(k);

  const lambdaT = lambda * T;
  const theoretical = bins.map(k => poisson(k, lambdaT) * numSim);

  function factorial(x) {
    if (x === 0 || x === 1) return 1;
    let f = 1;
    for (let i = 2; i <= x; i++) f *= i;
    return f;
  }

  if (totalCountChart) {
    totalCountChart.data.labels = bins;
    totalCountChart.data.datasets[0].data = counts;
    totalCountChart.data.datasets[1].data = theoretical;
    totalCountChart.update();
  } else {
    const ctx = document.getElementById("totalCountChart").getContext("2d");
    totalCountChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: bins,
        datasets: [
          {
            type: "bar",
            label: "Simulated Count",
            data: counts,
            backgroundColor: "rgba(0,234,255,0.5)",
            borderColor: "#00eaFF",
            borderWidth: 1
          },
          {
            type: "line",
            label: "Theoretical Poisson",
            data: theoretical,
            borderColor: "#FF5733",
            borderWidth: 2,
            fill: false,
            tension: 0.2
          }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: true } },
        scales: {
          x: { title: { display: true, text: "Total Count" } },
          y: { title: { display: true, text: "Frequency" }, beginAtZero: true }
        }
      }
    });
  }
}

