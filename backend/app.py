from flask import Flask, request, jsonify
from flask_cors import CORS
# Ensure 'groq_ai.py' is in the same folder
from groq_ai import generate_ai_plan

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return "✅ Server is running! Open frontend/index.html in your browser."

@app.route('/generate-plan', methods=['POST'])
def generate_plan():
    try:
        data = request.json
        
        # 1. Safety BMI Calculation
        try:
            h = float(data.get('height')) / 100
            w = float(data.get('weight'))
            bmi = round(w / (h * h), 2)
            
            if bmi < 18.5: cat = "Underweight"
            elif bmi < 25: cat = "Normal Weight"
            elif bmi < 30: cat = "Overweight"
            else: cat = "Obese"
        except:
            bmi = "--"
            cat = "--"

        # 2. Prepare Profile for AI
        user_profile = {
            "age": data.get('age'),
            "gender": data.get('gender'),
            "height": data.get('height'),
            "weight": data.get('weight'),
            "bmi": bmi,
            "bmi_category": cat,
            "goal": data.get('goal'),
            "activity": data.get('activity'),
            "diet": data.get('diet'),
            "conditions": data.get('conditions')
        }

        # 3. Get AI Response
        ai_response = generate_ai_plan(user_profile)

        return jsonify({
            "status": "success",
            "bmi": bmi,
            "bmi_category": cat,
            "plan_type": f"{data.get('goal')} Focus",
            "ai_plan": ai_response
        })

    except Exception as e:
        print(f"Server Error: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    # Runs on Port 4500
    app.run(debug=True, port=4500)