const letterCharts = {};

function analyzeLetters(input_name, ctx_name) {
  const text = document.getElementById(input_name).value.toLowerCase();
  const counts = {};

  for (let char of text) {
    if (char >= 'a' && char <= 'z') counts[char] = (counts[char] || 0) + 1;
  }

  const letters = Array.from({length: 26}, (_, i) => String.fromCharCode(97 + i));
  const frequencies = letters.map(l => counts[l] || 0);

  const ctx = document.getElementById(ctx_name).getContext("2d");

  if (letterCharts[ctx_name]) {
    letterCharts[ctx_name].data.labels = letters;
    letterCharts[ctx_name].data.datasets[0].data = frequencies;
    letterCharts[ctx_name].update();
  } else {
    letterCharts[ctx_name] = new Chart(ctx, {
      type: "bar",
      data: {
        labels: letters,
        datasets: [{
          label: "Letter Frequency",
          data: frequencies,
          backgroundColor: "rgba(0,234,255,0.5)",
          borderColor: "#00eaFF",
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2.5,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1 }, title: { display: true, text: "Count" } },
          x: { title: { display: true, text: "Letter" } }
        }
      }
    });
  }
}

/* Caesar cipher */

function encryptCaesar() {
  var shift = parseInt(document.getElementById("shiftInput").value) || 0;
  const text = document.getElementById("textToEncrypt").value;
  const output = [];

  shift = (shift % 26 + 26) % 26;

  for (let char of text) {
    if (char >= 'a' && char <= 'z') {
      output.push(String.fromCharCode(((char.charCodeAt(0) - 97 + shift) % 26) + 97));
    } else if (char >= 'A' && char <= 'Z') {
      output.push(String.fromCharCode(((char.charCodeAt(0) - 65 + shift) % 26) + 65));
    } else {
      output.push(char);
    }
  }

  document.getElementById("encryptedOutput").value = output.join('');
}

/* Chi-squared */

const englishFrequencies = {
  a: 8.167, b: 1.492, c: 2.782, d: 4.253, e: 12.702,
  f: 2.228, g: 2.015, h: 6.094, i: 6.966, j: 0.153,
  k: 0.772, l: 4.025, m: 2.406, n: 6.749, o: 7.507,
  p: 1.929, q: 0.095, r: 5.987, s: 6.327, t: 9.056,
  u: 2.758, v: 0.978, w: 2.360, x: 0.150, y: 1.974,
  z: 0.074
};

function breakCaesar() {
  const text = document.getElementById("encryptedOutput").value;
  if (!text) return;

  const cleanText = text.toLowerCase().replace(/[^a-z]/g, "");
  const letters = Array.from({length: 26}, (_, i) => String.fromCharCode(97 + i));

  let bestShift = 0;
  let lowestChi = Infinity;

  for (let shift = 0; shift < 26; shift++) {
    const counts = {};
    letters.forEach(l => counts[l] = 0);

    for (let char of cleanText) {
      const shiftedChar = String.fromCharCode(((char.charCodeAt(0) - 97 - shift + 26) % 26) + 97);
      counts[shiftedChar]++;
    }

    const total = cleanText.length;
    let chiSquared = 0;
    letters.forEach(l => {
      const observed = counts[l];
      const expected = englishFrequencies[l] / 100 * total;
      chiSquared += Math.pow(observed - expected, 2) / expected;
    });

    if (chiSquared < lowestChi) {
      lowestChi = chiSquared;
      bestShift = shift;
    }
  }

  const decrypted = text.split("").map(char => {
    if (char >= "a" && char <= "z") {
      return String.fromCharCode(((char.charCodeAt(0) - 97 - bestShift + 26) % 26) + 97);
    } else if (char >= "A" && char <= "Z") {
      return String.fromCharCode(((char.charCodeAt(0) - 65 - bestShift + 26) % 26) + 65);
    } else return char;
  }).join("");

  document.getElementById("decipheredOutput").value = decrypted;
  document.getElementById("detectedShift").textContent = "Detected shift: " + bestShift;
}
