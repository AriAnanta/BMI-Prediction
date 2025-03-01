/**
 * Main JavaScript untuk Health Monitor
 * Mengelola visualisasi dan interaktivitas
 */

document.addEventListener("DOMContentLoaded", function () {
  // Inisialisasi Tooltips
  initTooltips();

  // Auto-close alerts setelah 5 detik
  autoCloseAlerts();

  // Form validation
  setupFormValidation();

  // Tab Navigation
  setupTabNavigation();

  // BMI Gauge Visualization jika ada di halaman
  setupBMIGauge();

  // Charts jika ada di halaman
  setupCharts();
});

/**
 * Inisialisasi tooltips
 */
function initTooltips() {
  var tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
  );
  var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
}

/**
 * Auto-close alerts
 */
function autoCloseAlerts() {
  setTimeout(function () {
    var alerts = document.querySelectorAll(".alert:not(.alert-permanent)");
    alerts.forEach(function (alert) {
      try {
        var bsAlert = new bootstrap.Alert(alert);
        bsAlert.close();
      } catch (e) {
        // Handle failure if alert is already closed or other issue
        console.warn("Alert auto-close failed:", e);
      }
    });
  }, 5000);
}

/**
 * Setup form validation
 */
function setupFormValidation() {
  var forms = document.querySelectorAll(".needs-validation");

  Array.prototype.slice.call(forms).forEach(function (form) {
    form.addEventListener(
      "submit",
      function (event) {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }

        form.classList.add("was-validated");
      },
      false
    );
  });
}

/**
 * Setup tab navigation
 */
function setupTabNavigation() {
  // Fungsi untuk navigasi antar tab
  window.nextTab = function (tabId) {
    document.getElementById(tabId).click();
  };
}

/**
 * Setup BMI Gauge jika ada di halaman
 */
function setupBMIGauge() {
  const bmiMarker = document.getElementById("bmiMarker");
  const bmiValueEl = document.getElementById("bmiValue");

  // Jika tidak ada di halaman, exit
  if (!bmiMarker || !bmiValueEl) return;

  try {
    // Visualisasi BMI Marker
    const bmiValue = parseFloat(
      document.getElementById("bmiValueHidden")?.value || 0
    );
    const minBMI = parseFloat(
      document.getElementById("minBMIHidden")?.value || 15
    );
    const maxBMI = parseFloat(
      document.getElementById("maxBMIHidden")?.value || 40
    );

    const bmiGaugeWidth = document.querySelector(".bmi-gauge").offsetWidth;

    // Set position berdasarkan nilai BMI
    const bmiPercent = Math.min(
      100,
      Math.max(0, ((bmiValue - minBMI) / (maxBMI - minBMI)) * 100)
    );
    const markerPosition = (bmiPercent / 100) * bmiGaugeWidth;

    bmiMarker.style.left = markerPosition + "px";
    bmiValueEl.style.left = markerPosition + "px";
    bmiValueEl.innerText = bmiValue.toFixed(1);
  } catch (e) {
    console.warn("BMI Gauge setup failed:", e);
  }
}

/**
 * Setup charts jika ada di halaman
 */
function setupCharts() {
  // Heart Rate Chart
  setupHeartRateChart();

  // Calories Chart
  setupCaloriesChart();

  // Macro Distribution Chart
  setupMacroChart();
}

/**
 * Setup Heart Rate Chart
 */
function setupHeartRateChart() {
  const hrCtx = document.getElementById("heartRateChart")?.getContext("2d");
  if (!hrCtx) return;

  try {
    // Get values from hidden fields or use defaults
    const restingHR = parseFloat(
      document.getElementById("restingHRHidden")?.value || 0
    );
    const avgHR = parseFloat(
      document.getElementById("avgHRHidden")?.value || 0
    );
    const maxHR = parseFloat(
      document.getElementById("maxHRHidden")?.value || 0
    );

    const heartRateData = {
      labels: ["Istirahat", "Rata-rata", "Maksimum"],
      datasets: [
        {
          label: "Detak Jantung (BPM)",
          data: [restingHR, avgHR, maxHR],
          backgroundColor: [
            "rgba(0, 242, 254, 0.6)",
            "rgba(79, 172, 254, 0.6)",
            "rgba(38, 84, 124, 0.6)",
          ],
          borderColor: [
            "rgba(0, 242, 254, 1)",
            "rgba(79, 172, 254, 1)",
            "rgba(38, 84, 124, 1)",
          ],
          borderWidth: 1,
        },
      ],
    };

    new Chart(hrCtx, {
      type: "bar",
      data: heartRateData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Beats Per Minute (BPM)",
            },
          },
        },
      },
    });
  } catch (e) {
    console.warn("Heart Rate Chart setup failed:", e);
  }
}

/**
 * Setup Calories Chart
 */
function setupCaloriesChart() {
  const calCtx = document.getElementById("caloriesChart")?.getContext("2d");
  if (!calCtx) return;

  try {
    // Get values from hidden fields or use defaults
    const caloriesBurned = parseFloat(
      document.getElementById("caloriesBurnedHidden")?.value || 0
    );
    const dailyCalories = parseFloat(
      document.getElementById("dailyCaloriesHidden")?.value || 0
    );

    const caloriesData = {
      labels: ["Kalori Terbakar Per Sesi", "Kebutuhan Kalori Harian"],
      datasets: [
        {
          label: "Kalori (kcal)",
          data: [caloriesBurned, dailyCalories],
          backgroundColor: [
            "rgba(231, 76, 60, 0.6)",
            "rgba(46, 204, 113, 0.6)",
          ],
          borderColor: ["rgba(231, 76, 60, 1)", "rgba(46, 204, 113, 1)"],
          borderWidth: 1,
        },
      ],
    };

    new Chart(calCtx, {
      type: "bar",
      data: caloriesData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Kalori (kcal)",
            },
          },
        },
      },
    });
  } catch (e) {
    console.warn("Calories Chart setup failed:", e);
  }
}

/**
 * Setup Macro Distribution Chart
 */
function setupMacroChart() {
  const macroCtx = document.getElementById("macroChart")?.getContext("2d");
  if (!macroCtx) return;

  try {
    // Standar distribusi makro: 25% protein, 50% karbo, 25% lemak
    // Ini bisa diganti dengan kalkulasi berdasarkan data user
    const macroData = {
      labels: ["Protein", "Karbohidrat", "Lemak"],
      datasets: [
        {
          label: "Distribusi Makronutrien",
          data: [25, 50, 25],
          backgroundColor: [
            "rgba(52, 152, 219, 0.6)",
            "rgba(155, 89, 182, 0.6)",
            "rgba(241, 196, 15, 0.6)",
          ],
          borderColor: [
            "rgba(52, 152, 219, 1)",
            "rgba(155, 89, 182, 1)",
            "rgba(241, 196, 15, 1)",
          ],
          borderWidth: 1,
        },
      ],
    };

    new Chart(macroCtx, {
      type: "doughnut",
      data: macroData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
          },
        },
      },
    });
  } catch (e) {
    console.warn("Macro Chart setup failed:", e);
  }
}

/**
 * Format angka dengan pemisah ribuan
 */
function formatNumber(number) {
  return new Intl.NumberFormat("id-ID").format(number);
}

/**
 * Print hasil
 */
function printResult() {
  window.print();
}
