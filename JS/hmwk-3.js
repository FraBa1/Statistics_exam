function modInverse(e, phi) {
    let [a, b] = [phi, e];
    let [x0, x1] = [0, 1];
    while (b !== 0) {
        let q = Math.floor(a / b);
        [a, b] = [b, a % b];
        [x0, x1] = [x1, x0 - q * x1];
    }
    return (x0 + phi) % phi;
}

function modPow(base, exponent, modulus) {
    let result = 1;
    base = base % modulus;
    while (exponent > 0) {
        if (exponent % 2 === 1) result = (result * base) % modulus;
        exponent = Math.floor(exponent / 2);
        base = (base * base) % modulus;
    }
    return result;
}

let currentEncrypted = [];
let currentD = 0;

function generateKeysAndEncrypt() {
    const p = parseInt(document.getElementById("p").value);
    const q = parseInt(document.getElementById("q").value);
    const e = parseInt(document.getElementById("e").value);
    const message = document.getElementById("message").value;

    if (!p || !q || !e || !message) {
        alert("Please fill all fields.");
        return;
    }

    const n = p * q;
    const phi = (p - 1) * (q - 1);

    function gcd(a, b) {
        while (b !== 0) [a, b] = [b, a % b];
        return a;
    }
    if (gcd(e, phi) !== 1) {
        alert("e must be coprime with (p-1)*(q-1)");
        return;
    }

    const d = modInverse(e, phi);
    currentD = d;
    document.getElementById("privateKey").textContent = d;

    currentEncrypted = [];
    for (let char of message) {
        const m = char.charCodeAt(0);
        const c = modPow(m, e, n);
        currentEncrypted.push(c);
    }
    document.getElementById("encrypted").textContent = currentEncrypted.join(" ");
    document.getElementById("decrypted").textContent = "";

    updateCharts(message, currentEncrypted);
}

function decryptMessage() {
    if (currentEncrypted.length === 0 || currentD === 0) {
        alert("Encrypt a message first!");
        return;
    }

    const p = parseInt(document.getElementById("p").value);
    const q = parseInt(document.getElementById("q").value);
    const n = p * q;
    const d = currentD;

    let decrypted = "";
    for (let c of currentEncrypted) {
        const m = modPow(c, d, n);
        decrypted += String.fromCharCode(m);
    }
    document.getElementById("decrypted").textContent = decrypted;
}

// charts

function getFrequencyData(text) {
  const freq = {};
  for (const char of text) {
    freq[char] = (freq[char] || 0) + 1;
  }
  const sorted = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);
  return {
    labels: sorted.map(e => e[0] === " " ? "(space)" : e[0]),
    data: sorted.map(e => e[1])
  };
}

function getCipherFrequencyData(numbers) {
  const freq = {};
  for (const n of numbers) {
    freq[n] = (freq[n] || 0) + 1;
  }
  const sorted = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);
  return {
    labels: sorted.map(e => e[0]),
    data: sorted.map(e => e[1])
  };
}

let plaintextChart, ciphertextChart;

function updateCharts(plaintext, ciphertextNumbers) {
  const pt = getFrequencyData(plaintext);
  const ct = getCipherFrequencyData(ciphertextNumbers);

  if (plaintextChart) plaintextChart.destroy();
  if (ciphertextChart) ciphertextChart.destroy();

  plaintextChart = new Chart(document.getElementById('plaintextChart'), {
    type: 'bar',
    data: {
      labels: pt.labels,
      datasets: [{
        label: 'Plaintext Chars',
        data: pt.data,
        backgroundColor: '#3b82f6'
      }]
    },
    options: {
      scales: {
        y: { beginAtZero: true },
        x: { ticks: { color: '#9ab2cc' } },
      },
      plugins: { legend: { display: true, labels: { color: '#e5f3ff' } } }
    }
  });

  ciphertextChart = new Chart(document.getElementById('ciphertextChart'), {
    type: 'bar',
    data: {
      labels: ct.labels,
      datasets: [{
        label: 'Ciphertext Nums',
        data: ct.data,
        backgroundColor: '#16f2b3'
      }]
    },
    options: {
      scales: {
        y: { beginAtZero: true },
        x: { ticks: { color: '#9ab2cc' } },
      },
      plugins: { legend: { display: true, labels: { color: '#e5f3ff' } } }
    }
  });
}

// RSA Statistical Attack

function statisticalDecrypt() {
  try {
    const encElem = document.getElementById("encrypted");
    let cipherArr = [];

    if (encElem) {
      const raw = (encElem.textContent || '').trim();
      if (raw) {
        const tokens = raw.split(/[\s,;]+/).filter(t => t.length > 0);
        cipherArr = tokens
          .map(t => ( /^-?\d+$/.test(t) ? Number(t) : null ))
          .filter(n => n !== null);
      }
    }

    if (!cipherArr.length && Array.isArray(window.currentEncrypted) && window.currentEncrypted.length) {
      cipherArr = window.currentEncrypted.slice();
    }

    if (!cipherArr.length) {
      alert("Encrypt a message first!");
      return;
    }

    const englishFreq = [
      ' ', 'e','t','a','o','i','n','s','h','r','d','l','u','c','m','f','y','w','g','p',
      'b','v','k','x','q','j','z'
    ];

    const freq = cipherArr.reduce((acc, n) => {
      const k = String(n);
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});

    const sortedEntries = Object.entries(freq).sort((a, b) => b[1] - a[1]);
    const sortedCipher = sortedEntries.map(e => e[0]);

    const mapping = {};
    sortedCipher.forEach((c, i) => {
      mapping[c] = englishFreq[i] || '?';
    });

    const attempt = cipherArr.map(n => mapping[String(n)] ?? '?').join('');

    const attackArea = document.getElementById('statAttackArea');
    const mapArea = document.getElementById('statMapping');
    const scoreArea = document.getElementById('statScore');

    if (attackArea) attackArea.value = attempt;
    if (mapArea) {
      const mapLines = sortedCipher.map(c => `${c} → ${mapping[c]}`);
      mapArea.value = mapLines.join('\n');
    }

    if (scoreArea) {
      const original = (document.getElementById('message')?.value || '').toLowerCase();
      if (original.length) {
        const minLen = Math.min(original.length, attempt.length);
        let matches = 0;
        for (let i = 0; i < minLen; i++) {
          if (original[i].toLowerCase() === attempt[i]) matches++;
        }
        const percent = ((matches / minLen) * 100).toFixed(1);
        scoreArea.value = `${matches} / ${minLen} chars matched — ${percent}%`;
      } else {
        scoreArea.value = 'N/A (original message not available)';
      }
    }
  } catch (err) {
    console.error('Statistical attack error:', err);
    alert('An error occurred during the statistical attack. Check console for details.');
  }
}
