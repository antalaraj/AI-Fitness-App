# AI Fitness Planner App 🏋️‍♂️🤖

Smart, Safe, and Personalised Fitness Planning System using Generative AI.

## 🌐 Live Demo

**Try the application here:** https://ai-fitness-planner-app.vercel.app/

## Overview
AI Fitness Planner App is a full-stack web application that uses Generative Artificial Intelligence to create personalised workout, diet, and mindset plans based on user-specific data. Unlike traditional fitness applications that rely on static templates, this system dynamically generates intelligent fitness guidance using large language models combined with health-based rule logic.

The application analyses user attributes such as age, height, weight, fitness goals, activity level, and dietary preferences to produce safe, realistic, and professional fitness plans.

---

## Key Features
- Automatic BMI calculation for safety analysis  
- 7-day personalised workout plan  
- 7-day diet plan (Vegetarian / Non-Vegetarian / Vegan)  
- Daily mindset and habit coaching  
- Clean and user-friendly interface  
- Professional PDF report generation for offline use  

---

## Tech Stack

### Frontend
- HTML5  
- CSS3  
- JavaScript  

### Backend
- Python  
- Flask  

### AI & Tools
- Groq API  
- Groq-hosted language model  
- jsPDF  
- xhtml2pdf  

---

## System Workflow
1. User enters personal details (age, height, weight, goals, preferences)  
2. System calculates BMI and performs safety checks  
3. AI model generates workout, diet, and mindset plan  
4. Results displayed on web interface  
5. User can download a PDF report  

---

## Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/antalaraj/AI-Fitness-App.git
cd AI-Fitness-App
```

### 2. Create virtual environment (optional)
```bash
python -m venv venv
venv\\Scripts\\activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Setup environment variables
Create a `.env` file inside `backend/`:
```
GROQ_API_KEY=your_api_key_here
```

### 5. Run backend
```bash
cd backend
python app.py
```

### 6. Run frontend
Open `frontend/index.html` in your browser.

---

## Project Structure
```
AI-Fitness-App/
│
├── backend/
│   ├── app.py
│   ├── services/
│   └── templates/
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── README.md
└── .gitignore
```

---

## Advantages
- Highly personalised fitness plans  
- AI-driven intelligent recommendations  
- Beginner-safe with BMI-based logic  
- Cost-effective alternative to personal trainers  
- Real-world usability with PDF export  

---

## Applications
- Personal fitness planning  
- AI/ML academic projects  
- Health-tech prototypes  
- AI-powered lifestyle systems  

---

## Future Enhancements
- User authentication system  
- Progress tracking dashboard  
- Mobile app version  
- Integration with wearable devices  
- Multilingual support  

---

## 👨‍💻 Author
Raj Antala  
🎓 PGDM Student in AI and Data Science  
🏫 Adani Institute of Digital Technology Management (AIDTM)  
📍 Gandhinagar, India  
📧 antalaraj214@gmail.com  
🔗 www.linkedin.com/in/antalaraj

---

## License
This project is for educational and academic purposes.
