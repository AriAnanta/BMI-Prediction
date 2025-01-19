from flask import Flask, request, jsonify, render_template
import pickle
import numpy as np

app = Flask(__name__)

# Load semua model dan transformer
with open('linear_model.pkl', 'rb') as f:
    model = pickle.load(f)
with open('scaler.pkl', 'rb') as f:
    scaler = pickle.load(f)

# Mapping untuk kategori
gender_mapping = {'Female': 0, 'Male': 1}
workout_mapping = {'Yoga': 0, 'HIIT': 1, 'Cardio': 2, 'Strength': 3}

def get_bmi_category(bmi):
    if bmi < 18.5:
        return "Underweight", [
            "Tingkatkan asupan kalori dengan makanan bergizi",
            "Konsumsi protein yang cukup untuk membangun massa otot",
            "Lakukan latihan kekuatan (strength training) untuk membangun massa otot",
            "Konsultasikan dengan ahli gizi untuk program penambahan berat badan yang sehat"
        ]
    elif 18.5 <= bmi < 24.9:
        return "Normal", [
            "Pertahankan pola makan sehat dan seimbang",
            "Lakukan olahraga rutin minimal 30 menit per hari",
            "Jaga konsistensi jadwal makan",
            "Tetap aktif dan pertahankan gaya hidup sehat"
        ]
    elif 25 <= bmi < 29.9:
        return "Overweight", [
            "Kurangi asupan kalori secara bertahap",
            "Tingkatkan aktivitas kardio (minimal 45 menit per hari)",
            "Hindari makanan tinggi gula dan lemak jenuh",
            "Perbanyak konsumsi sayur dan buah"
        ]
    else:
        return "Obese", [
            "Konsultasi dengan dokter atau ahli gizi untuk program penurunan berat badan",
            "Lakukan olahraga teratur dengan intensitas sedang",
            "Batasi porsi makan dan pilih makanan rendah kalori",
            "Pertimbangkan untuk bergabung dengan support group"
        ]

def get_workout_recommendation(workout_type, experience_level):
    recommendations = {
        'Yoga': {
            1: ["Mulai dengan yoga dasar", "Fokus pada pose-pose sederhana", "Ikuti kelas yoga untuk pemula"],
            2: ["Tingkatkan ke level intermediate", "Coba variasi pose yang lebih menantang", "Tambah durasi latihan"],
            3: ["Eksplorasi advanced poses", "Pertimbangkan untuk menjadi instruktur", "Gabungkan dengan meditasi"]
        },
        'HIIT': {
            1: ["Mulai dengan interval pendek", "Fokus pada teknik yang benar", "Istirahat cukup antar sesi"],
            2: ["Tingkatkan intensitas latihan", "Tambah variasi gerakan", "Kurangi waktu istirahat"],
            3: ["Maksimalkan intensitas", "Tambah kompleksitas gerakan", "Buat program HIIT sendiri"]
        },
        'Cardio': {
            1: ["Mulai dengan jogging ringan", "Kombinasikan dengan jalan cepat", "Atur napas dengan benar"],
            2: ["Tingkatkan kecepatan bertahap", "Tambah variasi cardio", "Masukkan interval training"],
            3: ["Siap untuk maraton", "Tambah tantangan dengan lari lintas alam", "Buat program cardio kompleks"]
        },
        'Strength': {
            1: ["Mulai dengan bodyweight exercise", "Pelajari teknik dasar", "Fokus pada form yang benar"],
            2: ["Tambah beban secara bertahap", "Variasikan latihan", "Perhatikan nutrisi"],
            3: ["Maksimalkan beban", "Buat program split yang efektif", "Fokus pada muscle groups spesifik"]
        }
    }
    return recommendations[workout_type][experience_level]

@app.route('/', methods=['GET'])
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        if request.is_json:
            data = request.get_json()
        else:
            # Ambil data dari form
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
        
        # Encode categorical variables menggunakan mapping
        gender_encoded = gender_mapping[data['Gender']]
        workout_encoded = workout_mapping[data['Workout_Type']]
       
        # Prepare features for scaling
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

        # Standarisasi datanya dulu
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

        # Tambahan insight kesehatannya biar nambah informasi aja si
        health_insights = {
            'heart_rate_status': 'Normal' if 60 <= data['Resting_BPM'] <= 100 else 'Perlu perhatian khusus',
            'hydration_status': 'Baik' if data['Water_Intake'] >= 2.5 else 'Perlu ditingkatkan',
            'workout_consistency': 'Baik' if data['Workout_Frequency'] >= 3 else 'Perlu ditingkatkan'
        }
        
        if request.is_json:
            return jsonify({
                'status': 'success',
                'predicted_bmi': predicted_bmi,
                'bmi_category': bmi_category,
                'bmi_recommendations': bmi_recommendations,
                'workout_recommendations': workout_recommendations,
                'health_insights': health_insights
            })
        else:
            return render_template('index.html', 
                                 prediction=f'Predicted BMI: {predicted_bmi:.2f}',
                                 bmi_category=bmi_category,
                                 bmi_recommendations=bmi_recommendations,
                                 workout_recommendations=workout_recommendations,
                                 health_insights=health_insights,
                                 input_data=data)

    except Exception as e:
        if request.is_json:
            return jsonify({
                'status': 'error',
                'message': str(e)
            })
        else:
            return render_template('index.html', error=str(e))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True) 