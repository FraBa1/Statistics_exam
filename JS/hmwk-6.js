let mean = 0;
let count = 0;

function addValueMean() {
  const input = document.getElementById("newValue");
  const val = parseFloat(input.value);

  if (isNaN(val)) {
    alert("Please enter a valid number.");
    return;
  }

  count++;
  mean += (val - mean) / count;

  document.getElementById("currentMean").textContent = mean.toFixed(4);
  document.getElementById("currentCount").textContent = count;
  input.value = '';
  input.focus();
}

let S = 0;
let countVar = 0;
let meanVar = 0;

function addValueVariance() {
  const input = document.getElementById("newValueVar");
  const val = parseFloat(input.value);

  if (isNaN(val)) {
    alert("Please enter a valid number.");
    return;
  }

  countVar++;
  let delta = val - meanVar;
  meanVar += delta / countVar;
  S += delta * (val - meanVar);

  let currentVariancePopulation = countVar > 0 ? S / countVar : 0;
  let currentVarianceSample = countVar > 1 ? S / (countVar -1) : 0;

  document.getElementById("currentVariancePopulation").textContent = currentVariancePopulation.toFixed(4);
  document.getElementById("currentVarianceSample").textContent = currentVarianceSample.toFixed(4);
  document.getElementById("currentCountVar").textContent = countVar;
  input.value = '';
  input.focus();
}