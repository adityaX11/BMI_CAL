# FitPulse 3D — Smart BMI, Diet & Workout Suite

An interactive 3D fitness web app that calculates Body Mass Index (BMI), visualizes real gym equipment via **Three.js**, and generates evidence-based **WHO & CDC full-day meal plans** and **progressive push-up & daily workout routines**.

🔗 **Live Deployment:** [https://bmi-cal-vert.vercel.app/](https://bmi-cal-vert.vercel.app/)

---

## ✨ Features Added

### 🏋️‍♂️ 1. Interactive 3D Gym (Three.js)
- Real-time 3D rendered gym equipment (**Dumbbell**, **Kettlebell**, and **Barbell**) with metallic/rubber finishes, knurling textures, and glowing cyan/violet gym neon aesthetics.
- Interactive **Orbit Controls**: Drag to rotate, scroll to zoom, and switch between gym equipment in real-time.
- Responsive WebGL canvas with atmospheric depth fog and floating gym particle field.

### 🥗 2. Authenticated Full-Day Diet Suggestions (WHO & CDC)
- Generates a customized 5-meal full-day schedule tailored to individual BMI categories:
  - **Underweight (< 18.5):** +400 kcal nutrient-dense surplus, healthy fats, complex carbs, and protein for lean mass synthesis.
  - **Normal (18.5 - 24.9):** Isocaloric balance, clean macros, sustained energy.
  - **Overweight (25.0 - 29.9):** 400-500 kcal deficit, high satiety lean protein, low glycemic load, and fiber.
  - **Obesity (≥ 30.0):** High-volume low-calorie density, low sodium (<2g/day), anti-inflammatory foods.
- Includes macro split breakdown (Protein / Carbs / Healthy Fats) and targeted daily hydration goals.
- Verifiable links to official World Health Organization (WHO) and CDC dietary guidelines.

### 💪 3. Daily Workout & Progressive Push-up Routine
- **Tailored Push-up Protocols:**
  - *Underweight:* Incline push-up variations to establish upper body pushing mechanics and shoulder stability.
  - *Normal Weight:* Standard floor push-up hyper-trophy volume (3–4 sets of 12–15 reps) with strict tempo.
  - *Overweight:* Incline bench to knee push-ups to eliminate wrist/shoulder joint shearing.
  - *Obesity:* Wall push-ups to incline progression (lifting only 9–15% of body weight for joint protection).
- Daily calisthenic routine addressing all major muscle groups (chest, back, legs, core, and cardiovascular endurance).

### 🎨 4. Modern UI / UX
- Premium dark cyber-gym aesthetic with glassmorphism panels.
- Visual BMI score gauge and color-coded indicator track.
- 100% responsive on mobile devices and desktops.
- Zero build tools required: works out of the box with standard static hosting on Vercel.

---

## 🚀 Running Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/adityaX11/BMI_CAL.git
   ```
2. Open `index.html` in any web browser or use VS Code Live Server.
