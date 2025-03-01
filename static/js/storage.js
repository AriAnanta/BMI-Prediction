/**
 * Storage.js - Mengelola penyimpanan data lokal dan progres pengguna
 * untuk Health Monitor
 */

/**
 * Namespace untuk fungsi-fungsi storage
 */
const HealthStorage = {
  /**
   * Key untuk localStorage
   */
  KEYS: {
    USER_DATA: "health_monitor_user_data",
    HISTORY: "health_monitor_history",
    SETTINGS: "health_monitor_settings",
    LAST_UPDATE: "health_monitor_last_update",
  },

  /**
   * Menyimpan data pengguna
   * @param {object} userData - Data pengguna untuk disimpan
   */
  saveUserData: function (userData) {
    try {
      localStorage.setItem(this.KEYS.USER_DATA, JSON.stringify(userData));
      this.updateLastUpdate();
      return true;
    } catch (e) {
      console.error("Error saving user data:", e);
      return false;
    }
  },

  /**
   * Mendapatkan data pengguna
   * @returns {object|null} - Data pengguna atau null jika tidak ada
   */
  getUserData: function () {
    try {
      const data = localStorage.getItem(this.KEYS.USER_DATA);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error("Error getting user data:", e);
      return null;
    }
  },

  /**
   * Menambahkan entri baru ke history
   * @param {object} entry - Entry untuk ditambahkan ke history
   */
  addHistoryEntry: function (entry) {
    try {
      // Pastikan entry memiliki timestamp
      if (!entry.timestamp) {
        entry.timestamp = new Date().toISOString();
      }

      // Dapatkan history yang ada atau buat baru
      let history = this.getHistory() || [];

      // Tambahkan entry baru
      history.push(entry);

      // Simpan kembali ke localStorage
      localStorage.setItem(this.KEYS.HISTORY, JSON.stringify(history));
      this.updateLastUpdate();

      return true;
    } catch (e) {
      console.error("Error adding history entry:", e);
      return false;
    }
  },

  /**
   * Mendapatkan semua history
   * @returns {array|null} - Array history atau null jika tidak ada
   */
  getHistory: function () {
    try {
      const data = localStorage.getItem(this.KEYS.HISTORY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Error getting history:", e);
      return [];
    }
  },

  /**
   * Mendapatkan history dalam rentang waktu tertentu
   * @param {number} daysBack - Jumlah hari ke belakang
   * @returns {array} - Array history dalam rentang waktu
   */
  getHistoryRange: function (daysBack = 30) {
    try {
      const history = this.getHistory() || [];

      if (history.length === 0) return [];

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysBack);
      const cutoffTime = cutoffDate.getTime();

      return history.filter(
        (entry) => new Date(entry.timestamp).getTime() >= cutoffTime
      );
    } catch (e) {
      console.error("Error getting history range:", e);
      return [];
    }
  },

  /**
   * Menghapus semua data history
   * @returns {boolean} - True jika berhasil
   */
  clearHistory: function () {
    try {
      localStorage.removeItem(this.KEYS.HISTORY);
      this.updateLastUpdate();
      return true;
    } catch (e) {
      console.error("Error clearing history:", e);
      return false;
    }
  },

  /**
   * Menyimpan settings
   * @param {object} settings - Settings untuk disimpan
   */
  saveSettings: function (settings) {
    try {
      localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settings));
      return true;
    } catch (e) {
      console.error("Error saving settings:", e);
      return false;
    }
  },

  /**
   * Mendapatkan settings
   * @returns {object} - Settings yang tersimpan atau default
   */
  getSettings: function () {
    try {
      const data = localStorage.getItem(this.KEYS.SETTINGS);

      // Default settings
      const defaultSettings = {
        theme: "light",
        language: "id",
        units: "metric",
        notifications: true,
        privacyMode: false,
      };

      return data
        ? { ...defaultSettings, ...JSON.parse(data) }
        : defaultSettings;
    } catch (e) {
      console.error("Error getting settings:", e);
      return {
        theme: "light",
        language: "id",
        units: "metric",
        notifications: true,
        privacyMode: false,
      };
    }
  },

  /**
   * Update timestamp terakhir
   */
  updateLastUpdate: function () {
    try {
      localStorage.setItem(this.KEYS.LAST_UPDATE, new Date().toISOString());
    } catch (e) {
      console.error("Error updating last update timestamp:", e);
    }
  },

  /**
   * Mendapatkan tanggal update terakhir
   * @returns {Date|null} - Tanggal update terakhir atau null
   */
  getLastUpdate: function () {
    try {
      const timestamp = localStorage.getItem(this.KEYS.LAST_UPDATE);
      return timestamp ? new Date(timestamp) : null;
    } catch (e) {
      console.error("Error getting last update:", e);
      return null;
    }
  },

  /**
   * Mengekspor semua data
   * @returns {object} - Semua data user
   */
  exportData: function () {
    return {
      userData: this.getUserData(),
      history: this.getHistory(),
      settings: this.getSettings(),
      lastUpdate: this.getLastUpdate(),
      exportDate: new Date().toISOString(),
    };
  },

  /**
   * Mengimpor data
   * @param {object} data - Data untuk diimpor
   * @returns {boolean} - True jika berhasil
   */
  importData: function (data) {
    try {
      if (data.userData) {
        this.saveUserData(data.userData);
      }

      if (data.history) {
        localStorage.setItem(this.KEYS.HISTORY, JSON.stringify(data.history));
      }

      if (data.settings) {
        this.saveSettings(data.settings);
      }

      this.updateLastUpdate();
      return true;
    } catch (e) {
      console.error("Error importing data:", e);
      return false;
    }
  },

  /**
   * Menghapus semua data
   * @returns {boolean} - True jika berhasil
   */
  clearAllData: function () {
    try {
      localStorage.removeItem(this.KEYS.USER_DATA);
      localStorage.removeItem(this.KEYS.HISTORY);
      localStorage.removeItem(this.KEYS.SETTINGS);
      localStorage.removeItem(this.KEYS.LAST_UPDATE);
      return true;
    } catch (e) {
      console.error("Error clearing all data:", e);
      return false;
    }
  },

  /**
   * Mendapatkan data progres untuk visualisasi
   * @returns {object} - Data progres
   */
  getProgressData: function () {
    try {
      const history = this.getHistory() || [];

      if (history.length === 0) {
        return {
          dates: [],
          weights: [],
          bmis: [],
        };
      }

      // Sort history by date
      history.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      // Extract data
      const dates = history.map((entry) => {
        const date = new Date(entry.timestamp);
        return `${date.getDate()}/${date.getMonth() + 1}`;
      });

      const weights = history.map((entry) => entry.weight || 0);
      const bmis = history.map((entry) => entry.bmi || 0);

      return {
        dates,
        weights,
        bmis,
      };
    } catch (e) {
      console.error("Error getting progress data:", e);
      return {
        dates: [],
        weights: [],
        bmis: [],
      };
    }
  },
};

// Menambahkan event listener untuk tombol ekspor/impor
document.addEventListener("DOMContentLoaded", function () {
  // Export data
  const exportButton = document.getElementById("exportData");
  if (exportButton) {
    exportButton.addEventListener("click", function () {
      const data = HealthStorage.exportData();
      const dataStr = JSON.stringify(data, null, 2);
      const dataUri =
        "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

      const exportFileDefaultName = "health_monitor_data.json";

      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();
    });
  }

  // Import data
  const importButton = document.getElementById("importData");
  const fileInput = document.getElementById("importFile");

  if (importButton && fileInput) {
    importButton.addEventListener("click", function () {
      fileInput.click();
    });

    fileInput.addEventListener("change", function (e) {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function (event) {
        try {
          const data = JSON.parse(event.target.result);
          const success = HealthStorage.importData(data);

          if (success) {
            alert("Data berhasil diimpor!");
            // Reload halaman untuk menampilkan data baru
            window.location.reload();
          } else {
            alert("Gagal mengimpor data. Lihat console untuk detail.");
          }
        } catch (err) {
          console.error("Error parsing import file:", err);
          alert(
            "Format file tidak valid. Pastikan file adalah JSON yang valid."
          );
        }
      };

      reader.readAsText(file);
    });
  }
});
