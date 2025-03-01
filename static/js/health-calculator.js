/**
 * Health Calculator
 * Berisi fungsi-fungsi untuk menghitung berbagai metrik kesehatan
 */

/**
 * Menghitung BMI (Body Mass Index)
 * @param {number} weight - Berat badan dalam kg
 * @param {number} height - Tinggi badan dalam cm
 * @returns {number} - Nilai BMI
 */
function calculateBMI(weight, height) {
  // Konversi tinggi dari cm ke m
  const heightInMeter = height / 100;

  // Rumus BMI: berat (kg) / tinggi^2 (m)
  const bmi = weight / (heightInMeter * heightInMeter);

  return parseFloat(bmi.toFixed(1));
}

/**
 * Mendapatkan kategori BMI
 * @param {number} bmi - Nilai BMI
 * @returns {object} - Kategori BMI dengan warna dan deskripsi
 */
function getBMICategory(bmi) {
  if (bmi < 18.5) {
    return {
      category: "Berat Badan Kurang",
      color: "primary",
      description:
        "Anda memiliki berat badan kurang dari ideal. Pertimbangkan untuk meningkatkan asupan kalori dan nutrisi.",
    };
  } else if (bmi >= 18.5 && bmi < 25) {
    return {
      category: "Berat Badan Normal",
      color: "success",
      description:
        "Berat badan Anda berada dalam rentang normal. Pertahankan pola makan dan aktivitas fisik yang seimbang.",
    };
  } else if (bmi >= 25 && bmi < 30) {
    return {
      category: "Berat Badan Berlebih",
      color: "warning",
      description:
        "Anda memiliki berat badan berlebih. Pertimbangkan untuk meningkatkan aktivitas fisik dan menjaga pola makan.",
    };
  } else if (bmi >= 30 && bmi < 35) {
    return {
      category: "Obesitas Kelas I",
      color: "danger",
      description:
        "Anda termasuk dalam kategori obesitas kelas I. Disarankan untuk berkonsultasi dengan ahli gizi atau dokter.",
    };
  } else if (bmi >= 35 && bmi < 40) {
    return {
      category: "Obesitas Kelas II",
      color: "danger",
      description:
        "Anda termasuk dalam kategori obesitas kelas II. Sangat disarankan untuk berkonsultasi dengan ahli gizi atau dokter.",
    };
  } else {
    return {
      category: "Obesitas Kelas III",
      color: "danger",
      description:
        "Anda termasuk dalam kategori obesitas kelas III. Segera konsultasikan dengan dokter untuk penanganan lebih lanjut.",
    };
  }
}

/**
 * Menghitung Basal Metabolic Rate (BMR) menggunakan rumus Mifflin-St Jeor
 * @param {number} weight - Berat badan dalam kg
 * @param {number} height - Tinggi badan dalam cm
 * @param {number} age - Usia dalam tahun
 * @param {string} gender - Jenis kelamin ('male' atau 'female')
 * @returns {number} - Nilai BMR (kalori per hari)
 */
function calculateBMR(weight, height, age, gender) {
  if (gender.toLowerCase() === "male") {
    // Rumus untuk laki-laki
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    // Rumus untuk perempuan
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
}

/**
 * Menghitung kebutuhan kalori harian berdasarkan tingkat aktivitas
 * @param {number} bmr - Basal Metabolic Rate
 * @param {string} activityLevel - Tingkat aktivitas
 * @returns {number} - Total kebutuhan kalori harian
 */
function calculateDailyCalories(bmr, activityLevel) {
  const activityMultipliers = {
    sedentary: 1.2, // Aktivitas minimal
    light: 1.375, // Olahraga ringan 1-3 hari/minggu
    moderate: 1.55, // Olahraga sedang 3-5 hari/minggu
    active: 1.725, // Olahraga berat 6-7 hari/minggu
    very_active: 1.9, // Olahraga sangat berat & pekerjaan fisik
  };

  return Math.round(bmr * activityMultipliers[activityLevel]);
}

/**
 * Menghitung berat badan ideal
 * @param {number} height - Tinggi badan dalam cm
 * @param {string} method - Metode perhitungan ('bmi', 'devine', 'robinson', 'miller', 'hamwi')
 * @param {string} gender - Jenis kelamin ('male' atau 'female')
 * @returns {number} - Berat badan ideal dalam kg
 */
function calculateIdealWeight(height, method = "bmi", gender = "male") {
  switch (method.toLowerCase()) {
    case "bmi":
      // Berat ideal berdasarkan BMI 21.75 (tengah rentang normal 18.5-25)
      return 21.75 * (height / 100) * (height / 100);

    case "devine":
      // Rumus Devine
      if (gender.toLowerCase() === "male") {
        return 50 + 2.3 * ((height - 152.4) / 2.54);
      } else {
        return 45.5 + 2.3 * ((height - 152.4) / 2.54);
      }

    case "robinson":
      // Rumus Robinson
      if (gender.toLowerCase() === "male") {
        return 52 + 1.9 * ((height - 152.4) / 2.54);
      } else {
        return 49 + 1.7 * ((height - 152.4) / 2.54);
      }

    case "miller":
      // Rumus Miller
      if (gender.toLowerCase() === "male") {
        return 56.2 + 1.41 * ((height - 152.4) / 2.54);
      } else {
        return 53.1 + 1.36 * ((height - 152.4) / 2.54);
      }

    case "hamwi":
      // Rumus Hamwi
      if (gender.toLowerCase() === "male") {
        return 48 + 2.7 * ((height - 152.4) / 2.54);
      } else {
        return 45.5 + 2.2 * ((height - 152.4) / 2.54);
      }

    default:
      // Default menggunakan BMI 22 (tengah dari rentang normal)
      return 22 * (height / 100) * (height / 100);
  }
}

/**
 * Menghitung persentase lemak tubuh menggunakan rumus BMI
 * Catatan: Ini hanya perkiraan kasar, tidak seakurat pengukuran langsung
 * @param {number} bmi - Nilai BMI
 * @param {number} age - Usia dalam tahun
 * @param {string} gender - Jenis kelamin ('male' atau 'female')
 * @returns {number} - Persentase lemak tubuh
 */
function calculateBodyFatPercentage(bmi, age, gender) {
  let bodyFat;

  if (gender.toLowerCase() === "male") {
    // Rumus untuk laki-laki
    bodyFat = 1.2 * bmi + 0.23 * age - 16.2;
  } else {
    // Rumus untuk perempuan
    bodyFat = 1.2 * bmi + 0.23 * age - 5.4;
  }

  // Memastikan tidak ada nilai negatif
  return Math.max(bodyFat, 3);
}

/**
 * Menghitung Heart Rate Maximum berdasarkan usia
 * @param {number} age - Usia dalam tahun
 * @returns {number} - Heart Rate Maximum (BPM)
 */
function calculateMaxHeartRate(age) {
  return 220 - age;
}

/**
 * Menghitung target heart rate zone untuk berbagai intensitas latihan
 * @param {number} maxHR - Heart Rate Maximum
 * @returns {object} - Target heart rate zones
 */
function calculateHeartRateZones(maxHR) {
  return {
    rest: {
      min: 60,
      max: 100,
    },
    warmup: {
      min: Math.round(maxHR * 0.5),
      max: Math.round(maxHR * 0.6),
    },
    fatBurn: {
      min: Math.round(maxHR * 0.6),
      max: Math.round(maxHR * 0.7),
    },
    aerobic: {
      min: Math.round(maxHR * 0.7),
      max: Math.round(maxHR * 0.8),
    },
    anaerobic: {
      min: Math.round(maxHR * 0.8),
      max: Math.round(maxHR * 0.9),
    },
    vo2Max: {
      min: Math.round(maxHR * 0.9),
      max: maxHR,
    },
  };
}

/**
 * Menghitung kebutuhan air harian berdasarkan berat badan
 * @param {number} weight - Berat badan dalam kg
 * @param {number} activityLevel - Level aktivitas (1-5, dimana 1=sedentary, 5=very active)
 * @returns {number} - Kebutuhan air dalam ml
 */
function calculateWaterNeeds(weight, activityLevel = 3) {
  // Base: 30ml per kg berat badan
  let baseWater = weight * 30;

  // Tambahan berdasarkan level aktivitas
  const activityMultiplier = 1 + (activityLevel - 1) * 0.1;

  return Math.round(baseWater * activityMultiplier);
}

/**
 * Menghitung kebutuhan protein harian
 * @param {number} weight - Berat badan dalam kg
 * @param {string} goal - Tujuan ('maintenance', 'weightloss', 'muscle')
 * @returns {number} - Kebutuhan protein dalam gram
 */
function calculateProteinNeeds(weight, goal = "maintenance") {
  const proteinMultipliers = {
    maintenance: 0.8, // 0.8g per kg untuk pemeliharaan
    weightloss: 1.2, // 1.2g per kg untuk penurunan berat badan
    muscle: 1.6, // 1.6g per kg untuk pembentukan otot
  };

  return Math.round(weight * proteinMultipliers[goal]);
}

/**
 * Menghitung distribusi makronutrien berdasarkan kebutuhan kalori dan tujuan
 * @param {number} calories - Total kalori harian
 * @param {string} goal - Tujuan ('maintenance', 'weightloss', 'muscle')
 * @returns {object} - Distribusi makronutrien dalam gram
 */
function calculateMacroDistribution(calories, goal = "maintenance") {
  let proteinPct, carbPct, fatPct;

  switch (goal) {
    case "weightloss":
      // Higher protein, moderate fat, lower carb
      proteinPct = 0.35; // 35% protein
      fatPct = 0.35; // 35% fat
      carbPct = 0.3; // 30% carb
      break;

    case "muscle":
      // Higher protein, higher carb, lower fat
      proteinPct = 0.3; // 30% protein
      fatPct = 0.25; // 25% fat
      carbPct = 0.45; // 45% carb
      break;

    case "maintenance":
    default:
      // Balanced distribution
      proteinPct = 0.25; // 25% protein
      fatPct = 0.3; // 30% fat
      carbPct = 0.45; // 45% carb
      break;
  }

  // Protein & Carbs = 4 calories per gram, Fat = 9 calories per gram
  const protein = Math.round((calories * proteinPct) / 4);
  const carbs = Math.round((calories * carbPct) / 4);
  const fat = Math.round((calories * fatPct) / 9);

  return {
    protein,
    carbs,
    fat,
    calories,
  };
}

/**
 * Menghitung skor kebugaran berdasarkan BMI, aktivitas, usia, dsb.
 * @param {object} userData - Data pengguna
 * @returns {number} - Skor kebugaran (0-100)
 */
function calculateFitnessScore(userData) {
  // Ini adalah perhitungan skor kebugaran yang sangat sederhana
  // Dalam aplikasi yang sebenarnya, ini bisa jauh lebih kompleks

  let score = 50; // Mulai dari nilai tengah

  // Faktor BMI (bobot: 40%)
  const bmi = calculateBMI(userData.weight, userData.height);
  if (bmi >= 18.5 && bmi < 25) {
    // BMI ideal
    score += 20;
  } else if ((bmi >= 17 && bmi < 18.5) || (bmi >= 25 && bmi < 30)) {
    // Sedikit di luar ideal
    score += 10;
  } else if ((bmi >= 16 && bmi < 17) || (bmi >= 30 && bmi < 35)) {
    // Jauh dari ideal
    score -= 10;
  } else {
    // Sangat jauh dari ideal
    score -= 20;
  }

  // Faktor aktivitas (bobot: 30%)
  switch (userData.activityLevel) {
    case "very_active":
      score += 15;
      break;
    case "active":
      score += 10;
      break;
    case "moderate":
      score += 5;
      break;
    case "light":
      score += 0;
      break;
    case "sedentary":
      score -= 5;
      break;
  }

  // Faktor usia (bobot: 20%)
  if (userData.age < 30) {
    score += 10;
  } else if (userData.age < 40) {
    score += 5;
  } else if (userData.age < 50) {
    score += 0;
  } else if (userData.age < 60) {
    score -= 5;
  } else {
    score -= 10;
  }

  // Faktor-faktor lain (bobot: 10%)
  if (userData.smoker) score -= 5;
  if (userData.chronicDisease) score -= 5;

  // Batasi skor antara 0-100
  return Math.min(100, Math.max(0, score));
}

/**
 * Menghasilkan rekomendasi kesehatan berdasarkan data pengguna
 * @param {object} userData - Data pengguna
 * @returns {object} - Objek berisi rekomendasi
 */
function generateHealthRecommendations(userData) {
  const bmi = calculateBMI(userData.weight, userData.height);
  const bmiCategory = getBMICategory(bmi);
  const dailyCalories = calculateDailyCalories(
    calculateBMR(
      userData.weight,
      userData.height,
      userData.age,
      userData.gender
    ),
    userData.activityLevel
  );

  const recommendations = {
    bmi: {
      value: bmi,
      category: bmiCategory.category,
      advice: bmiCategory.description,
    },
    nutrition: {
      calories: dailyCalories,
      caloriesToLoseWeight: Math.round(dailyCalories * 0.85), // 15% deficit
      caloriesToGainWeight: Math.round(dailyCalories * 1.15), // 15% surplus
      water: calculateWaterNeeds(
        userData.weight,
        userData.activityLevel === "sedentary"
          ? 1
          : userData.activityLevel === "light"
          ? 2
          : userData.activityLevel === "moderate"
          ? 3
          : userData.activityLevel === "active"
          ? 4
          : 5
      ),
      macros: calculateMacroDistribution(
        dailyCalories,
        userData.goal || "maintenance"
      ),
    },
    exercise: {
      minPerWeek:
        userData.activityLevel === "sedentary"
          ? 150
          : userData.activityLevel === "light"
          ? 120
          : userData.activityLevel === "moderate"
          ? 90
          : userData.activityLevel === "active"
          ? 60
          : 30,
      heartRateZones: calculateHeartRateZones(
        calculateMaxHeartRate(userData.age)
      ),
      recommendations: [],
    },
    lifestyle: {
      recommendations: [],
    },
  };

  // Rekomendasi exercise
  if (bmi < 18.5) {
    recommendations.exercise.recommendations.push(
      "Fokus pada latihan kekuatan untuk membangun massa otot",
      "Hindari kardio berlebihan yang dapat membakar terlalu banyak kalori",
      "Pilih olahraga yang meningkatkan nafsu makan seperti angkat beban"
    );
  } else if (bmi >= 25) {
    recommendations.exercise.recommendations.push(
      "Kombinasikan kardio dan latihan kekuatan untuk membakar lemak dan menjaga massa otot",
      "Mulai dengan aktivitas berintensitas rendah seperti berjalan kaki, berenang, atau bersepeda",
      "Tingkatkan intensitas secara bertahap untuk memaksimalkan pembakaran kalori"
    );
  } else {
    recommendations.exercise.recommendations.push(
      "Pertahankan keseimbangan antara kardio dan latihan kekuatan",
      "Variasikan rutinitas olahraga Anda untuk menghindari plateau",
      "Fokus pada aktivitas yang Anda nikmati untuk konsistensi jangka panjang"
    );
  }

  // Rekomendasi lifestyle
  if (
    userData.activityLevel === "sedentary" ||
    userData.activityLevel === "light"
  ) {
    recommendations.lifestyle.recommendations.push(
      "Tingkatkan aktivitas harian dengan berjalan kaki, naik tangga, atau berdiri lebih sering",
      "Batasi waktu duduk berkelanjutan dengan berdiri atau berjalan setiap 30 menit",
      "Cari hobi aktif seperti berkebun, menari, atau olahraga ringan"
    );
  }

  if (bmi >= 30) {
    recommendations.lifestyle.recommendations.push(
      "Konsultasikan dengan profesional kesehatan untuk rencana penurunan berat badan yang aman",
      "Pertimbangkan untuk mencatat makanan untuk melacak asupan kalori",
      "Tetapkan tujuan jangka pendek yang realistis untuk melihat kemajuan"
    );
  }

  recommendations.lifestyle.recommendations.push(
    "Tidur 7-9 jam setiap malam untuk mendukung metabolisme dan pemulihan",
    "Kelola stres dengan meditasi, pernapasan dalam, atau aktivitas yang menenangkan",
    "Tetap terhidrasi sepanjang hari untuk mendukung fungsi tubuh yang optimal"
  );

  return recommendations;
}
