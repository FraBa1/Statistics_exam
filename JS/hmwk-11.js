function simulateWiener() {
  const muIn = document.getElementById('mu');
  const sigmaIn = document.getElementById('sigma');
  const TIn = document.getElementById('T');
  const stepsIn = document.getElementById('steps');
  const NIn = document.getElementById('N');

  if (!muIn || !sigmaIn || !TIn || !stepsIn || !NIn) {
    alert("Errore: alcuni input non sono presenti nella pagina.");
    return;
  }

  const mu = parseFloat(muIn.value);
  const sigma = parseFloat(sigmaIn.value);
  const T = parseFloat(TIn.value);
  const steps = parseInt(stepsIn.value);
  const N = parseInt(NIn.value);

  if (isNaN(mu) || isNaN(sigma) || isNaN(T) || isNaN(steps) || isNaN(N)) {
    alert("Errore: tutti gli input devono essere numeri validi.");
    return;
  }

  if (T <= 0) {
    alert("Errore: il tempo T deve essere positivo.");
    return;
  }

  if (steps <= 0 || !Number.isInteger(steps)) {
    alert("Errore: il numero di passi deve essere un intero positivo.");
    return;
  }

  if (sigma < 0) {
    alert("Errore: la diffusione σ non può essere negativa.");
    return;
  }

  if (N <= 0 || !Number.isInteger(N)) {
    alert("Errore: il numero di esperimenti deve essere un intero positivo.");
    return;
  }

  const dt = T / steps;
  const t = Array.from({length: steps+1}, (_, i) => i*dt);

  const trajectories = [];
  const finalValues = [];

  for (let i=0; i<N; i++) {
    let X = [0];
    for (let n=0; n<steps; n++) {
      const dW = Math.sqrt(dt) * rand_box_muller_transform();
      X.push(X[n] + mu*dt + sigma*dW);
    }
    trajectories.push(X);
    finalValues.push(X[X.length-1]);
  }

  plotTrajectories(t, trajectories);
  plotHistogram(finalValues, mu, sigma, T);
}

function rand_box_muller_transform() {
  let u = 0, v = 0;
  while(u === 0) u = Math.random();
  while(v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

let wienerChart = null;
function plotTrajectories(t, data) {
  if(wienerChart) wienerChart.destroy();
  const datasets = data.map((traj, i) => ({
    label: `Exp ${i+1}`,
    data: traj,
    borderColor: `hsl(${Math.random()*360},70%,60%)`,
    borderWidth: 1,
    fill: false,
    pointRadius: 0
  }));
  const ctx = document.getElementById('wienerChart').getContext('2d');
  wienerChart = new Chart(ctx, {
    type: 'line',
    data: { labels: t, datasets },
    options: {
      responsive: true,
      plugins: { legend: { display: false }},
      scales: {
        x: { title: { display: true, text: 'Time t' }},
        y: { title: { display: true, text: 'X(t)' }}
      }
    }
  });
}

let histChart = null;
function plotHistogram(values, mu, sigma, T) {
  if(histChart) histChart.destroy();

  const bins = 30;
  let min = Math.min(...values);
  let max = Math.max(...values);

  if (min === max) { 
    min -= 0.5; 
    max += 0.5; 
  }

  const binWidth = (max - min)/bins;
  const counts = Array(bins).fill(0);

  values.forEach(v => {
    const idx = Math.min(Math.floor((v-min)/binWidth), bins-1);
    counts[idx]++;
  });

  const binCenters = Array.from({length: bins}, (_, i) => min + (i+0.5)*binWidth);

  const density = binCenters.map(x => {
    const s = sigma*Math.sqrt(T);
    return (1/(s*Math.sqrt(2*Math.PI))) * Math.exp(-Math.pow(x-mu*T,2)/(2*s*s)) * values.length * binWidth;
  });

  const ctx = document.getElementById('histChart').getContext('2d');
  histChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: binCenters,
      datasets: [
        { label: 'Simulated', data: counts, backgroundColor: 'rgba(0,234,255,0.6)' },
        { label: 'Theoretical', data: density, type:'line', borderColor: 'var(--highlight)', borderWidth: 2, fill: false }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: true }},
      scales: {
        x: { title: { display: true, text: 'X(T)' }},
        y: { title: { display: true, text: 'Frequency' }}
      }
    }
  });
}
