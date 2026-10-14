from pathlib import Path

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

try:
    # Package import used by the Vercel root entry point.
    from .groq_ai import generate_ai_plan
except ImportError:
    # Also supports running this file directly from the backend directory.
    from groq_ai import generate_ai_plan

ROOT_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = ROOT_DIR / "frontend"

app = Flask(__name__)
CORS(app)


@app.route("/")
def home():
    """Serve the actual web application homepage."""
    return send_from_directory(FRONTEND_DIR, "index.html")


@app.route("/<path:asset_path>")
def frontend_assets(asset_path):
    """Serve frontend files such as CSS and JavaScript."""
    candidate = (FRONTEND_DIR / asset_path).resolve()
    if not candidate.is_relative_to(FRONTEND_DIR.resolve()) or not candidate.is_file():
        return jsonify({"status": "error", "message": "Not found"}), 404
    return send_from_directory(FRONTEND_DIR, asset_path)


@app.route("/generate-plan", methods=["POST"])
def generate_plan():
    try:
        data = request.get_json(silent=True)
        if not isinstance(data, dict):
            return jsonify({"status": "error", "message": "Please submit valid JSON data."}), 400

        try:
            height_cm = float(data.get("height", 0))
            weight_kg = float(data.get("weight", 0))
            if height_cm <= 0 or weight_kg <= 0:
                raise ValueError("Height and weight must be positive.")
            height_m = height_cm / 100
            bmi = round(weight_kg / (height_m * height_m), 2)
            if bmi < 18.5:
                category = "Underweight"
            elif bmi < 25:
                category = "Normal Weight"
            elif bmi < 30:
                category = "Overweight"
            else:
                category = "Obese"
        except (TypeError, ValueError, ZeroDivisionError):
            return jsonify({"status": "error", "message": "Enter a valid positive height and weight."}), 400

        user_profile = {
            "age": data.get("age"),
            "gender": data.get("gender"),
            "height": data.get("height"),
            "weight": data.get("weight"),
            "bmi": bmi,
            "bmi_category": category,
            "goal": data.get("goal"),
            "activity": data.get("activity"),
            "diet": data.get("diet"),
            "conditions": data.get("conditions"),
        }

        ai_response = generate_ai_plan(user_profile)
        return jsonify({
            "status": "success",
            "bmi": bmi,
            "bmi_category": category,
            "plan_type": f"{data.get('goal')} Focus",
            "ai_plan": ai_response,
        })
    except Exception:
        app.logger.exception("Failed to generate a fitness plan")
        return jsonify({
            "status": "error",
            "message": "The plan could not be generated. Check the server configuration and try again.",
        }), 500


if __name__ == "__main__":
    app.run(debug=False, port=4500)
