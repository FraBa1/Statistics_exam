const mainCtx = document.getElementById("mainChart").getContext("2d");
const histCtx = document.getElementById("histChart").getContext("2d");

let mainChart = null;
let histChart = null;

function simulateLLN(p, m, nmax) {
  const trajectories = [];
  for (let i = 0; i < m; i++) {
    let cumHeads = 0;
    const traj = [];
    for (let n = 1; n <= nmax; n++) {
      if (Math.random() < p) cumHeads++;
      traj.push(cumHeads / n);
    }
    trajectories.push(traj);
  }
  const meanTrajectory = Array.from({ length: nmax }, (_, n) =>
    trajectories.reduce((sum, t) => sum + t[n], 0) / m
  );
  return { trajectories, meanTrajectory };
}

function drawMainChart(p, nmax, sim) {
  if (mainChart) mainChart.destroy();

  const datasets = sim.trajectories.map((traj, i) => ({
    data: traj.map((y, n) => ({ x: n + 1, y })),
    borderColor: `hsla(${(i / sim.trajectories.length) * 360}, 60%, 50%, 0.4)`,
    borderWidth: 1,
    fill: false,
    pointRadius: 0,
    tension: 0.1
  }));

  datasets.push({
    label: "Mean f(n)",
    data: sim.meanTrajectory.map((y, n) => ({ x: n + 1, y })),
    borderColor: "orange",
    borderWidth: 2,
    fill: false,
    pointRadius: 0
  });

  datasets.push({
    label: "True p",
    data: [{ x: 1, y: p }, { x: nmax, y: p }],
    borderColor: "black",
    borderWidth: 1,
    borderDash: [4, 4],
    pointRadius: 0
  });

  mainChart = new Chart(mainCtx, {
    type: "line",
    data: { datasets },
    options: {
      responsive: false,
      animation: false,
      scales: {
        x: { type: "linear", title: { display: true, text: "Number of trials" } },
        y: { min: 0, max: 1, title: { display: true, text: "Relative frequency f(n)" } }
      },
      plugins: { legend: { display: false } }
    }
  });
}

function drawHistogram(nmax, sim) {
  if (histChart) histChart.destroy();

  const lastValues = sim.trajectories.map(traj => traj[nmax - 1]);
  const bins = 20;
  const min = Math.min(...lastValues);
  const max = Math.max(...lastValues);
  const step = (max - min) / bins;
  const counts = Array(bins).fill(0);

  lastValues.forEach(v => {
    const idx = Math.min(bins - 1, Math.floor((v - min) / step));
    counts[idx]++;
  });

  const centers = Array.from({ length: bins }, (_, i) => (min + (i + 0.5) * step).toFixed(3));

  histChart = new Chart(histCtx, {
    type: "bar",
    data: { labels: centers, datasets: [{ data: counts, backgroundColor: "rgba(50,100,255,0.7)" }] },
    options: {
      responsive: false,
      animation: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { title: { display: true, text: "f(n) at last trial" } },
        y: { display: false }
      }
    }
  });
}

function runLLNSimulation() {
  const p = parseFloat(document.getElementById("p").value);
  const m = parseInt(document.getElementById("m").value);
  const nmax = parseInt(document.getElementById("nmax").value);

  if (isNaN(p) || p < 0 || p > 1 || isNaN(m) || m <= 0 || isNaN(nmax) || nmax <= 0) {
    alert("Please enter valid parameters.");
    return;
  }

  const sim = simulateLLN(p, m, nmax);
  drawMainChart(p, nmax, sim);
  drawHistogram(nmax, sim);
}

window.addEventListener("DOMContentLoaded", () => {
  runLLNSimulation();
});
