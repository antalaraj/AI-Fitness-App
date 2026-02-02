# backend/fitness_logic.py

def calculate_bmi(weight_kg, height_cm):
    """Calculates BMI based on weight and height."""
    if height_cm <= 0: return 0
    height_m = height_cm / 100
    bmi = round(weight_kg / (height_m ** 2), 2)
    return bmi

def get_bmi_category(bmi):
    """Classifies BMI into standard health categories."""
    if bmi < 18.5: return "Underweight"
    elif 18.5 <= bmi < 24.9: return "Normal Weight"
    elif 25 <= bmi < 29.9: return "Overweight"
    else: return "Obese"

def recommend_plan_type(bmi_category, goal, activity):
    """
    Determines the best high-level strategy (Plan Type) 
    based on user's current status and goals.
    """
    plan = "Balanced Fitness" # Default

    if goal == "Weight Loss":
        if activity == "Low":
            plan = "Low-Impact Fat Burn"
        else:
            plan = "High-Intensity Interval Training (HIIT) & Cardio"
    elif goal == "Muscle Gain":
        plan = "Hypertrophy & Strength Training"
    elif goal == "Maintenance":
        plan = "Functional Fitness & Flexibility"
    
    return plan