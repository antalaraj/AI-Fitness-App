import os
import json
from groq import Groq
from dotenv import load_dotenv

# --------------------------------------------------
# Environment Setup
# --------------------------------------------------
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise EnvironmentError("❌ GROQ_API_KEY not found in environment variables.")

client = Groq(api_key=GROQ_API_KEY)


# --------------------------------------------------
# Main AI Plan Generator
# --------------------------------------------------
def generate_ai_plan(user_profile):
    """
    Generates a world-class, elite-level personalized fitness plan
    using Groq GenAI and returns PREMIUM HTML output.
    """

    # --------------------------------------------------
    # SYSTEM PROMPT (Elite Persona + Hard Constraints)
    # --------------------------------------------------
    system_prompt = """
    You are an elite, globally certified fitness trainer, sports scientist,
    nutrition strategist, and behavioral coach.

    You are STRICTLY FORBIDDEN from generating generic, repetitive,
    or template-based fitness plans.

    MISSION:
    Generate a PREMIUM, WORLD-CLASS, deeply personalized fitness and
    nutrition plan that is superior to all commercial fitness apps.

    NON-NEGOTIABLE RULES:
    1. ❌ Do NOT repeat the same workout structure or exercises across days
    2. ❌ Do NOT repeat meals across days
    3. ❌ Do NOT use generic motivation (e.g., "keep going", "you’re doing great")
    4. ❌ Do NOT create extreme or unsafe routines
    5. ❌ Do NOT sound robotic or templated

    INTERNAL QUALITY CHECK (MANDATORY):
    Before responding, verify internally that:
    - Each workout day has a unique purpose
    - Nutrition varies meaningfully day-to-day
    - Coaching language is human, premium, and motivational
    - Plan is safe, realistic, and user-specific

    If ANY rule is violated, regenerate internally before responding.

    Output MUST be valid JSON only.
    No markdown, no explanations, no comments.
    """

    # --------------------------------------------------
    # USER PROMPT (Structured Control + Schema)
    # --------------------------------------------------
    user_prompt = f"""
    USER PROFILE:
    Age: {user_profile['age']}
    Gender: {user_profile['gender']}
    Height: {user_profile['height']} cm
    Weight: {user_profile['weight']} kg
    BMI: {user_profile['bmi']}
    BMI Category: {user_profile['bmi_category']}
    Fitness Goal: {user_profile['goal']}
    Activity Level: {user_profile['activity']}
    Dietary Preference: {user_profile['diet']}
    Health Conditions: {user_profile['conditions'] or 'None'}

    PLAN TYPE:
    {user_profile['goal']} – Personalized Lifestyle Transformation

    REQUIREMENTS:

    WORKOUT PLAN:
    - 7 days
    - Each day MUST include:
      • purpose
      • warm_up
      • main_workout
      • cool_down
      • estimated_duration
      • coaching_cue

    NUTRITION PLAN:
    - 7 days
    - STRICTLY follow dietary preference: {user_profile['diet']}
    - Use affordable, commonly available foods
    - Include:
      • Breakfast
      • Lunch
      • Dinner
      • Snacks
    - NO repeated meals across days

    COACHING:
    - One emotionally intelligent coaching message per day
    - Focus on habits, identity, discipline, and long-term mindset
    - Avoid clichés completely

    OUTPUT FORMAT (STRICT JSON ONLY):

    {{
      "overview": {{
        "plan_type": "{user_profile['goal']} Focus",
        "weekly_focus": "One concise strategic focus sentence"
      }},
      "workout_plan": {{
        "Day 1": {{
          "purpose": "...",
          "warm_up": "...",
          "main_workout": "...",
          "cool_down": "...",
          "estimated_duration": "...",
          "coaching_cue": "..."
        }}
      }},
      "diet_plan": {{
        "Day 1": {{
          "Breakfast": "...",
          "Lunch": "...",
          "Dinner": "...",
          "Snacks": "..."
        }}
      }},
      "daily_coaching": {{
        "Day 1": "..."
      }}
    }}

    Return ONLY the JSON object.
    """

    try:
        # --------------------------------------------------
        # Groq API Call
        # --------------------------------------------------
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.75,       # creativity without chaos
            max_tokens=4500,
            response_format={"type": "json_object"}
        )

        ai_content = completion.choices[0].message.content

        # --------------------------------------------------
        # Safe JSON Parsing
        # --------------------------------------------------
        try:
            plan_data = json.loads(ai_content)
        except json.JSONDecodeError:
            raise ValueError("❌ AI returned invalid JSON structure.")

        # --------------------------------------------------
        # Convert JSON → Premium HTML
        # --------------------------------------------------
        return json_to_html(plan_data)

    except Exception as e:
        return f"""
        <div style="
            background:#fee2e2;
            border:1px solid #fecaca;
            padding:20px;
            border-radius:10px;
            color:#991b1b;
            font-weight:500;">
            ⚠️ Error generating personalized plan:<br>
            <small>{str(e)}</small>
        </div>
        """


# --------------------------------------------------
# JSON → PREMIUM HTML CONVERTER
# --------------------------------------------------
def json_to_html(data):
    """
    Converts structured GenAI JSON into premium, frontend-ready HTML.
    """

    html = ""

    # -------------------- Overview --------------------
    overview = data.get("overview", {})
    html += f"""
    <div style="background:linear-gradient(135deg,#4f46e5,#3730a3);
                color:white;padding:25px;border-radius:14px;
                margin-bottom:30px;">
        <small style="opacity:0.85;text-transform:uppercase;">
            Coach Strategy
        </small>
        <h2 style="margin:5px 0 10px 0;">
            {overview.get('plan_type','Personalized Plan')}
        </h2>
        <p style="font-style:italic;">
            “{overview.get('weekly_focus','Sustainable transformation') }”
        </p>
    </div>
    """

    # -------------------- Workout --------------------
    html += "<h3>💪 Elite Workout Protocol</h3>"
    for day, d in data.get("workout_plan", {}).items():
        html += f"""
        <div style="border:1px solid #e5e7eb;
                    border-radius:10px;
                    padding:18px;
                    margin-bottom:15px;">
            <strong style="color:#4f46e5;">{day} – {d.get('purpose')}</strong>
            <p><b>Warm-up:</b> {d.get('warm_up')}</p>
            <p><b>Main Workout:</b> {d.get('main_workout')}</p>
            <p><b>Cool-down:</b> {d.get('cool_down')}</p>
            <p><b>Duration:</b> {d.get('estimated_duration')}</p>
            <div style="background:#f0fdf4;padding:10px;border-left:4px solid #10b981;">
                💡 <i>{d.get('coaching_cue')}</i>
            </div>
        </div>
        """


    # -------------------- Nutrition Strategy (Table Format) --------------------
    html += """
    <h3 style="margin-top:40px; color:#1f2937;">🥗 Nutrition Strategy</h3>

    <div style="overflow-x:auto;">
    <table style="
        width:100%;
        border-collapse:collapse;
        margin-top:15px;
        font-size:0.95rem;
        min-width:700px;
    ">
        <thead>
            <tr style="background:#4f46e5; color:white;">
                <th style="padding:12px; text-align:left;">Day</th>
                <th style="padding:12px; text-align:left;">Breakfast</th>
                <th style="padding:12px; text-align:left;">Lunch</th>
                <th style="padding:12px; text-align:left;">Dinner</th>
                <th style="padding:12px; text-align:left;">Snacks</th>
            </tr>
        </thead>
        <tbody>
    """

    for day, meals in data.get("diet_plan", {}).items():
        breakfast = meals.get("Breakfast", "-")
        lunch = meals.get("Lunch", "-")
        dinner = meals.get("Dinner", "-")
        snacks = meals.get("Snacks", "-")

        html += f"""
            <tr style="border-bottom:1px solid #e5e7eb; background:white;">
                <td style="padding:12px; font-weight:600; color:#4f46e5;">{day}</td>
                <td style="padding:12px; color:#374151;">{breakfast}</td>
                <td style="padding:12px; color:#374151;">{lunch}</td>
                <td style="padding:12px; color:#374151;">{dinner}</td>
                <td style="padding:12px; color:#374151;">{snacks}</td>
            </tr>
        """

    html += """
        </tbody>
    </table>
    </div>
    """

    # --- 4. DAILY MINDSET & HABITS (Elite Coaching Grid) ---
    coaching_data = data.get("daily_coaching", data.get("daily_motivation", {}))

    html += """
    <h3 style="
        color:#1f2937;
        border-bottom:2px solid #e5e7eb;
        padding-bottom:10px;
        margin-top:40px;
        margin-bottom:20px;
    ">
        🧠 Daily Mindset & Habits
    </h3>

    <div style="
        display:grid;
        grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));
        gap:16px;
    ">
    """

    for day, tip in coaching_data.items():
        tip_text = tip if tip else "Consistency builds confidence. Show up today."

        html += f"""
        <div style="
            background:#ffffff;
            padding:20px;
            border-radius:10px;
            border:1px solid #e5e7eb;
            border-top:5px solid #f59e0b;
            box-shadow:0 4px 6px rgba(0,0,0,0.04);
            transition:transform 0.2s ease;
        ">
            <div style="
                display:flex;
                align-items:center;
                gap:8px;
                margin-bottom:10px;
            ">
                <span style="font-size:1.2rem;">🎯</span>
                <strong style="
                    color:#92400e;
                    font-size:0.85rem;
                    text-transform:uppercase;
                    letter-spacing:0.6px;
                ">
                    {day}
                </strong>
            </div>

            <p style="
                margin:0;
                color:#374151;
                font-style:italic;
                line-height:1.6;
            ">
                “{tip_text}”
            </p>

            <div style="
                margin-top:12px;
                font-size:0.8rem;
                color:#6b7280;
            ">
                — Your AI Coach
            </div>
        </div>
        """

    html += "</div>"


    return html
