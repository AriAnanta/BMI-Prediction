from flask import Flask, request, jsonify, render_template, flash, redirect, url_for
import pickle
import numpy as np
import pandas as pd
from datetime import datetime
import os

app = Flask(__name__, static_folder='static')
app.secret_key = os.urandom(24)

# Load semua model dan model scalernya
with open('linear_model.pkl', 'rb') as f:
    model = pickle.load(f)
with open('scaler.pkl', 'rb') as f:
    scaler = pickle.load(f)

# Mapping untuk features yang kaetegori
gender_mapping = {'Female': 0, 'Male': 1}
workout_mapping = {'Yoga': 0, 'HIIT': 1, 'Cardio': 2, 'Strength': 3}

def validate_input(data):
    """Validasi input dari user"""
    errors = []
    
    # Validasi range umur
    if data['Age'] < 12 or data['Age'] > 100:
        errors.append("Umur harus antara 12 dan 100 tahun")
    
    # Validasi berat dan tinggi
    if data['Weight'] <= 0 or data['Weight'] > 300:
        errors.append("Berat badan harus antara 1-300 kg")
    
    if data['Height'] <= 0 or data['Height'] > 2.5:
        errors.append("Tinggi badan harus antara 0.1-2.5 meter")
    
    # Validasi detak jantung
    if data['Max_BPM'] <= 0 or data['Max_BPM'] > 220:
        errors.append("Detak jantung maksimum tidak valid (harus antara 1-220)")
    
    if data['Avg_BPM'] <= 0 or data['Avg_BPM'] > data['Max_BPM']:
        errors.append("Detak jantung rata-rata tidak valid (harus antara 1 dan Max BPM)")
    
    if data['Resting_BPM'] <= 30 or data['Resting_BPM'] > data['Avg_BPM']:
        errors.append("Detak jantung istirahat tidak valid (harus antara 30 dan Avg BPM)")
    
    # Validasi lain
    if data['Water_Intake'] <= 0 or data['Water_Intake'] > 10:
        errors.append("Konsumsi air harus antara 0.1-10 liter")
    
    return errors

def calculate_additional_stats(data):
    """Menghitung statistik tambahan dari data input"""
    stats = {}
    
    # Hitung BMI secara manual (sebagai verifikasi)
    stats['calculated_bmi'] = data['Weight'] / (data['Height'] ** 2)
    
    # Target detak jantung latihan (THR) berdasarkan formula Karvonen
    max_hr = 220 - data['Age']
    resting_hr = data['Resting_BPM']
    stats['target_hr_min'] = resting_hr + 0.5 * (max_hr - resting_hr)  # 50%
    stats['target_hr_max'] = resting_hr + 0.85 * (max_hr - resting_hr)  # 85%
    
    # Estimasi kebutuhan kalori harian
    # Formula Harris-Benedict
    if data['Gender'] == 'Male':
        bmr = 88.362 + (13.397 * data['Weight']) + (4.799 * data['Height'] * 100) - (5.677 * data['Age'])
    else:
        bmr = 447.593 + (9.247 * data['Weight']) + (3.098 * data['Height'] * 100) - (4.330 * data['Age'])
    
    # Faktor aktivitas berdasarkan frekuensi latihan
    if data['Workout_Frequency'] <= 1:
        activity_factor = 1.2  # Sedentary
    elif data['Workout_Frequency'] <= 3:
        activity_factor = 1.375  # Lightly active
    elif data['Workout_Frequency'] <= 5:
        activity_factor = 1.55  # Moderately active
    else:
        activity_factor = 1.725  # Very active
    
    stats['daily_calories_need'] = bmr * activity_factor
    
    # Efisiensi pembakaran kalori
    if data['Session_Duration'] > 0:
        stats['calories_burned_per_hour'] = data['Calories_Burned'] / data['Session_Duration']
    else:
        stats['calories_burned_per_hour'] = 0
    
    return stats

def get_bmi_category(bmi):
    if bmi < 18.5:
        return "Underweight", [
            "Tingkatkan asupan kalori dengan makanan bergizi",
            "Konsumsi protein yang cukup untuk membangun massa otot",
            "Lakukan latihan kekuatan (strength training) untuk membangun massa otot",
            "Konsultasikan dengan ahli gizi untuk program penambahan berat badan yang sehat",
            "Perhatikan kepadatan tulang dengan asupan kalsium yang cukup"
        ]
    elif 18.5 <= bmi < 24.9:
        return "Normal", [
            "Pertahankan pola makan sehat dan seimbang",
            "Lakukan olahraga rutin minimal 30 menit per hari",
            "Jaga konsistensi jadwal makan",
            "Tetap aktif dan pertahankan gaya hidup sehat",
            "Lakukan pemeriksaan kesehatan rutin setiap tahun"
        ]
    elif 25 <= bmi < 29.9:
        return "Overweight", [
            "Kurangi asupan kalori secara bertahap",
            "Tingkatkan aktivitas kardio (minimal 45 menit per hari)",
            "Hindari makanan tinggi gula dan lemak jenuh",
            "Perbanyak konsumsi sayur dan buah",
            "Pertimbangkan untuk melakukan tracking kalori harian"
        ]
    else:
        return "Obese", [
            "Konsultasi dengan dokter atau ahli gizi untuk program penurunan berat badan",
            "Lakukan olahraga teratur dengan intensitas sedang",
            "Batasi porsi makan dan pilih makanan rendah kalori",
            "Pertimbangkan untuk bergabung dengan support group",
            "Pantau tekanan darah dan kadar gula darah secara rutin"
        ]

def get_workout_recommendation(workout_type, experience_level):
    recommendations = {
        'Yoga': {
            1: ["Mulai dengan yoga dasar seperti Hatha Yoga", "Fokus pada pose-pose sederhana seperti Mountain Pose dan Child's Pose", "Ikuti kelas yoga untuk pemula 2-3 kali seminggu", "Prioritaskan teknik pernapasan yang benar", "Gunakan alat bantu yoga seperti blok atau tali untuk membantu pose"],
            2: ["Tingkatkan ke level intermediate seperti Vinyasa Flow", "Coba variasi pose yang lebih menantang seperti Crow Pose", "Tambah durasi latihan menjadi 60-90 menit", "Eksplorasi variasi pernapasan yang lebih kompleks", "Mulai mempraktikkan meditasi setelah sesi yoga"],
            3: ["Eksplorasi advanced poses seperti Handstand dan Scorpion", "Pertimbangkan untuk mengikuti pelatihan instruktur", "Gabungkan dengan meditasi dan teknik pernapasan mendalam", "Tambahkan praktek Ashtanga atau Power Yoga", "Atur tantangan personal dengan rutinitas yang lebih intens"]
        },
        'HIIT': {
            1: ["Mulai dengan interval pendek (20 detik kerja, 40 detik istirahat)", "Fokus pada teknik yang benar daripada kecepatan", "Istirahat cukup (24-48 jam) antar sesi", "Pilih latihan dasar seperti jumping jack, squat, dan push-up", "Batasi sesi latihan maksimal 20 menit"],
            2: ["Tingkatkan intensitas latihan (30 detik kerja, 30 detik istirahat)", "Tambah variasi gerakan seperti burpee dan mountain climber", "Kurangi waktu istirahat secara bertahap", "Tambahkan beban ringan untuk tantangan ekstra", "Perpanjang durasi latihan menjadi 30 menit"],
            3: ["Maksimalkan intensitas dengan interval Tabata (20 detik kerja, 10 detik istirahat)", "Tambah kompleksitas gerakan kombinasi", "Buat program HIIT sendiri yang sesuai target", "Gunakan peralatan seperti kettlebell dan medicine ball", "Lakukan circuit training dengan 8-10 latihan berbeda"]
        },
        'Cardio': {
            1: ["Mulai dengan jogging ringan selama 15-20 menit", "Kombinasikan dengan jalan cepat menggunakan metode interval", "Atur napas dengan benar (hidung masuk, mulut keluar)", "Pilih permukaan yang tidak terlalu keras untuk berlari", "Gunakan sepatu yang sesuai untuk menghindari cedera"],
            2: ["Tingkatkan kecepatan bertahap dengan latihan fartlek", "Tambah variasi cardio seperti berenang atau bersepeda", "Masukkan interval training dengan rasio 1:2 (sprint:jalan)", "Perpanjang durasi latihan menjadi 30-45 menit", "Perhatikan zona detak jantung target selama latihan"],
            3: ["Siap untuk maraton dengan program latihan terstruktur", "Tambah tantangan dengan lari lintas alam atau trail running", "Buat program cardio kompleks dengan variasi intensitas", "Lakukan latihan tempo run dan interval panjang", "Pertimbangkan penggunaan alat monitoring seperti jam GPS"]
        },
        'Strength': {
            1: ["Mulai dengan bodyweight exercise untuk memperkuat dasar", "Pelajari teknik dasar squat, deadlift, dan bench press", "Fokus pada form yang benar sebelum menambah beban", "Latih seluruh tubuh 2-3 kali seminggu", "Gunakan repetisi tinggi (12-15) dengan beban ringan"],
            2: ["Tambah beban secara bertahap dengan prinsip progressive overload", "Variasikan latihan dengan alat dan free weights", "Perhatikan nutrisi terutama asupan protein (1.6-2g/kg berat badan)", "Bagi latihan berdasarkan kelompok otot (split routine)", "Kurangi repetisi (8-12) dan tambah beban secara moderat"],
            3: ["Maksimalkan beban dengan tetap memperhatikan teknik", "Buat program split yang efektif (Push/Pull/Legs atau Upper/Lower)", "Fokus pada muscle groups spesifik dengan variasi latihan", "Pertimbangkan teknik khusus seperti drop sets atau supersets", "Perhatikan periodisasi latihan untuk mencegah plateau"]
        }
    }
    return recommendations[workout_type][experience_level]

def get_advanced_health_insights(data, stats):
    """Memberikan insight kesehatan yang lebih mendalam"""
    insights = {
        'heart_rate_status': 'Normal' if 60 <= data['Resting_BPM'] <= 100 else 'Perlu perhatian khusus',
        'hydration_status': 'Baik' if data['Water_Intake'] >= 2.5 else 'Perlu ditingkatkan',
        'workout_consistency': 'Baik' if data['Workout_Frequency'] >= 3 else 'Perlu ditingkatkan'
    }
    
    # Target heart rate zone
    insights['target_hr_zone'] = f"{int(stats['target_hr_min'])} - {int(stats['target_hr_max'])} BPM"
    
    # Workout efficiency based on calories burned per hour
    if stats['calories_burned_per_hour'] < 200:
        insights['workout_efficiency'] = "Rendah - Perlu ditingkatkan intensitasnya"
    elif stats['calories_burned_per_hour'] < 400:
        insights['workout_efficiency'] = "Sedang - Sudah baik namun masih bisa ditingkatkan"
    else:
        insights['workout_efficiency'] = "Tinggi - Pertahankan intensitas latihan"
    
    # Recovery assessment based on heart rate data
    max_hr = data['Max_BPM']
    resting_hr = data['Resting_BPM']
    hr_reserve = max_hr - resting_hr
    
    if hr_reserve > 130:
        insights['recovery_assessment'] = "Sangat Baik - Jantung memiliki kapasitas pemulihan yang tinggi"
    elif hr_reserve > 100:
        insights['recovery_assessment'] = "Baik - Kapasitas pemulihan jantung dalam kisaran normal"
    else:
        insights['recovery_assessment'] = "Perlu Perhatian - Kapasitas pemulihan jantung rendah"
    
    # Fat percentage assessment
    if data['Gender'] == 'Male':
        if data['Fat_Percentage'] < 10:
            insights['fat_percentage_status'] = "Sangat Rendah - Bisa berisiko bagi kesehatan"
        elif data['Fat_Percentage'] < 20:
            insights['fat_percentage_status'] = "Ideal - Pertahankan"
        else:
            insights['fat_percentage_status'] = "Di atas ideal - Perlu dikurangi"
    else:  # Female
        if data['Fat_Percentage'] < 15:
            insights['fat_percentage_status'] = "Sangat Rendah - Bisa berisiko bagi kesehatan"
        elif data['Fat_Percentage'] < 25:
            insights['fat_percentage_status'] = "Ideal - Pertahankan"
        else:
            insights['fat_percentage_status'] = "Di atas ideal - Perlu dikurangi"
    
    return insights

@app.route('/', methods=['GET'])
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        if request.is_json:
            data = request.get_json()
        else:
            # Ambil data dari form di index.html
            data = {
                'Age': float(request.form['Age']),
                'Gender': request.form['Gender'],
                'Weight': float(request.form['Weight']),
                'Height': float(request.form['Height']),
                'Max_BPM': float(request.form['Max_BPM']),
                'Avg_BPM': float(request.form['Avg_BPM']),
                'Resting_BPM': float(request.form['Resting_BPM']),
                'Session_Duration': float(request.form['Session_Duration']),
                'Calories_Burned': float(request.form['Calories_Burned']),
                'Workout_Type': request.form['Workout_Type'],
                'Fat_Percentage': float(request.form['Fat_Percentage']),
                'Water_Intake': float(request.form['Water_Intake']),
                'Workout_Frequency': float(request.form['Workout_Frequency']),
                'Experience_Level': float(request.form['Experience_Level'])
            }
        
        # Validasi input
        validation_errors = validate_input(data)
        if validation_errors:
            if request.is_json:
                return jsonify({
                    'status': 'error',
                    'message': validation_errors
                }), 400
            else:
                for error in validation_errors:
                    flash(error, 'danger')
                return redirect(url_for('home'))
                
        # Hitung statistik tambahan
        additional_stats = calculate_additional_stats(data)
        
        # Encode categorical variables menggunakan mapping yang sudah di set diatas
        gender_encoded = gender_mapping[data['Gender']]
        workout_encoded = workout_mapping[data['Workout_Type']]
       
        # Lakukan scaling pada data features
        features = np.array([
            data['Age'],
            gender_encoded,
            data['Weight'],
            data['Height'],
            data['Max_BPM'],
            data['Avg_BPM'],
            data['Resting_BPM'],
            data['Session_Duration'],
            data['Calories_Burned'],
            workout_encoded,
            data['Fat_Percentage'],
            data['Water_Intake'],
            data['Workout_Frequency'],
            data['Experience_Level']
        ]).reshape(1, -1)

        # Lakukan standarisasi pada data features
        features_scaled = scaler.transform(features)
        
        # Prediksi BMI nya 
        prediction = model.predict(features_scaled)
        predicted_bmi = float(prediction[0])

        # Menentukan Kategori BMI dan rekomendasi
        bmi_category, bmi_recommendations = get_bmi_category(predicted_bmi)
        workout_recommendations = get_workout_recommendation(
            data['Workout_Type'], 
            int(data['Experience_Level'])
        )

        # Mendapatkan insight kesehatan yang lebih detail
        health_insights = get_advanced_health_insights(data, additional_stats)
        
        # Membuat data untuk visualisasi
        visualization_data = {
            'bmi': {
                'value': round(predicted_bmi, 2),
                'min': 15,
                'max': 40,
                'ranges': [
                    {'min': 0, 'max': 18.5, 'label': 'Underweight', 'color': '#3498db'},
                    {'min': 18.5, 'max': 24.9, 'label': 'Normal', 'color': '#2ecc71'},
                    {'min': 24.9, 'max': 29.9, 'label': 'Overweight', 'color': '#f39c12'},
                    {'min': 29.9, 'max': 100, 'label': 'Obese', 'color': '#e74c3c'}
                ]
            },
            'heart_rate': {
                'resting': data['Resting_BPM'],
                'average': data['Avg_BPM'],
                'max': data['Max_BPM'],
                'target_min': additional_stats['target_hr_min'],
                'target_max': additional_stats['target_hr_max']
            },
            'daily_calories': additional_stats['daily_calories_need'],
            'workout_efficiency': additional_stats['calories_burned_per_hour'],
            'macronutrients': {
                'total': round(additional_stats['daily_calories_need']),
                'protein': round(additional_stats['daily_calories_need'] * 0.25),
                'carbs': round(additional_stats['daily_calories_need'] * 0.5),
                'fat': round(additional_stats['daily_calories_need'] * 0.25),
                'protein_grams': round((additional_stats['daily_calories_need'] * 0.25) / 4),  # 4 kalori per gram protein
                'carbs_grams': round((additional_stats['daily_calories_need'] * 0.5) / 4),     # 4 kalori per gram karbohidrat
                'fat_grams': round((additional_stats['daily_calories_need'] * 0.25) / 9)       # 9 kalori per gram lemak
            },
            'health_metrics': {
                'ideal_weight': round(22 * (data['Height'] ** 2), 1),  # BMI 22 sebagai target ideal
                'water_needs': round(data['Weight'] * 0.033, 1),  # 33ml per kg berat badan
                'activity_level': 'Rendah' if data['Workout_Frequency'] <= 2 else ('Sedang' if data['Workout_Frequency'] <= 4 else 'Tinggi'),
                'fitness_index': round((220 - data['Age'] - data['Resting_BPM']) / 15)  # Simple fitness index
            }
        }
        
        # Format tanggal untuk report
        current_date = datetime.now().strftime("%d %B %Y, %H:%M")
        
        if request.is_json:
            return jsonify({
                'status': 'success',
                'predicted_bmi': predicted_bmi,
                'bmi_category': bmi_category,
                'bmi_recommendations': bmi_recommendations,
                'workout_recommendations': workout_recommendations,
                'health_insights': health_insights,
                'additional_stats': additional_stats,
                'visualization_data': visualization_data
            })
        else:
            return render_template('result.html', 
                                prediction=f'Predicted BMI: {predicted_bmi:.2f}',
                                bmi_category=bmi_category,
                                bmi_recommendations=bmi_recommendations,
                                workout_recommendations=workout_recommendations,
                                health_insights=health_insights,
                                additional_stats=additional_stats,
                                visualization_data=visualization_data,
                                current_date=current_date,
                                user_data=data)

    except Exception as e:
        if request.is_json:
            return jsonify({
                'status': 'error',
                'message': str(e)
            })
        else:
            return render_template('error.html', error=str(e))

@app.route('/about')
def about():
    """Halaman tentang aplikasi dan cara kerja BMI"""
    return render_template('about.html')

if __name__ == '__main__':
    # Buat folder static jika belum ada
    if not os.path.exists('static'):
        os.makedirs('static')
        
    app.run(host='0.0.0.0', port=8000, debug=True) 