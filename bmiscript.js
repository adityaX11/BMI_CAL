/* ==========================================================================
   FitPulse 3D: Three.js Gym Equipment & Logic Suite
   - Interactive 3D Dumbbell / Kettlebell / Barbell with Orbit Controls & Gym Atmosphere
   - Accurate WHO BMI Categorization
   - Authenticated WHO & CDC Diet Recommendations (Full-Day Meal Schedules)
   - Progressive Push-up Routines & Daily Workouts
   ========================================================================== */

// --- 1. Three.js Gym Background Scene Setup ---
let scene, camera, renderer, currentEquipmentGroup;
let dumbbellGroup, kettlebellGroup, barbellGroup;
let particlesMesh;
let isInteracting = false;

function initThreeGymScene() {
  const canvas = document.getElementById('gym-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  // Scene & Fog for atmospheric gym vibe
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0a0e17, 0.04);

  // Camera
  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 1.2, 5.5);

  // Renderer with antialias and alpha
  renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  // Controls (OrbitControls)
  let controls;
  if (typeof THREE.OrbitControls !== 'undefined') {
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;
    controls.minDistance = 2.5;
    controls.maxDistance = 8.5;
    controls.maxPolarAngle = Math.PI / 2 + 0.1; // Don't go too far under floor
  }

  // --- Lighting (Gym Neon Aesthetic) ---
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  // Primary cyan rim light
  const cyanLight = new THREE.PointLight(0x00f2fe, 2.5, 20);
  cyanLight.position.set(-3, 3, 2);
  scene.add(cyanLight);

  // Secondary purple/blue accent light
  const purpleLight = new THREE.PointLight(0x7928ca, 2.0, 20);
  purpleLight.position.set(3, -1, 2);
  scene.add(purpleLight);

  // Top white spotlight
  const spotLight = new THREE.SpotLight(0xffffff, 1.8);
  spotLight.position.set(0, 6, 3);
  spotLight.angle = Math.PI / 4;
  spotLight.penumbra = 0.6;
  scene.add(spotLight);

  // --- Materials ---
  const steelMaterial = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.9,
    roughness: 0.25,
  });

  const gripMaterial = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.4,
    roughness: 0.8,
  });

  const rubberWeightMaterial = new THREE.MeshStandardMaterial({
    color: 0x111827,
    roughness: 0.45,
    metalness: 0.1,
  });

  const neonAccentMaterial = new THREE.MeshStandardMaterial({
    color: 0x00f2fe,
    emissive: 0x00f2fe,
    emissiveIntensity: 0.35,
    roughness: 0.3,
  });

  // --- 3D Equipment 1: Dumbbell ---
  dumbbellGroup = new THREE.Group();
  
  // Handle (knurled grip)
  const dbHandleGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.3, 32);
  const dbHandle = new THREE.Mesh(dbHandleGeo, steelMaterial);
  dbHandle.rotation.z = Math.PI / 2;
  dumbbellGroup.add(dbHandle);

  // Grip texture band
  const dbGripGeo = new THREE.CylinderGeometry(0.085, 0.085, 0.7, 32);
  const dbGrip = new THREE.Mesh(dbGripGeo, gripMaterial);
  dbGrip.rotation.z = Math.PI / 2;
  dumbbellGroup.add(dbGrip);

  // Plates on both sides
  const plateConfigs = [
    { radius: 0.45, width: 0.12, pos: 0.75 },
    { radius: 0.52, width: 0.14, pos: 0.92 },
    { radius: 0.45, width: 0.12, pos: -0.75 },
    { radius: 0.52, width: 0.14, pos: -0.92 }
  ];

  plateConfigs.forEach(cfg => {
    const plateGeo = new THREE.CylinderGeometry(cfg.radius, cfg.radius, cfg.width, 32);
    const plate = new THREE.Mesh(plateGeo, rubberWeightMaterial);
    plate.rotation.z = Math.PI / 2;
    plate.position.x = cfg.pos;
    dumbbellGroup.add(plate);

    // Glowing rim stripe on outer plates
    if (Math.abs(cfg.pos) > 0.8) {
      const ringGeo = new THREE.TorusGeometry(cfg.radius * 0.98, 0.015, 16, 48);
      const ring = new THREE.Mesh(ringGeo, neonAccentMaterial);
      ring.rotation.y = Math.PI / 2;
      ring.position.x = cfg.pos + (cfg.pos > 0 ? 0.07 : -0.07);
      dumbbellGroup.add(ring);
    }
  });

  // --- 3D Equipment 2: Kettlebell ---
  kettlebellGroup = new THREE.Group();
  
  // Body sphere
  const kbBodyGeo = new THREE.SphereGeometry(0.7, 32, 32);
  const kbBody = new THREE.Mesh(kbBodyGeo, rubberWeightMaterial);
  kettlebellGroup.add(kbBody);

  // Accent Ring
  const kbRingGeo = new THREE.TorusGeometry(0.705, 0.02, 16, 48);
  const kbRing = new THREE.Mesh(kbRingGeo, neonAccentMaterial);
  kettlebellGroup.add(kbRing);

  // Handle (Torus)
  const kbHandleGeo = new THREE.TorusGeometry(0.42, 0.08, 16, 32, Math.PI);
  const kbHandle = new THREE.Mesh(kbHandleGeo, steelMaterial);
  kbHandle.position.y = 0.65;
  kettlebellGroup.add(kbHandle);

  // --- 3D Equipment 3: Barbell with Plates ---
  barbellGroup = new THREE.Group();

  // Long Bar
  const bbBarGeo = new THREE.CylinderGeometry(0.06, 0.06, 4.2, 32);
  const bbBar = new THREE.Mesh(bbBarGeo, steelMaterial);
  bbBar.rotation.z = Math.PI / 2;
  barbellGroup.add(bbBar);

  // Barbell plates
  const bbPlates = [
    { radius: 0.75, width: 0.12, pos: 1.5 },
    { radius: 0.68, width: 0.1, pos: 1.65 },
    { radius: 0.75, width: 0.12, pos: -1.5 },
    { radius: 0.68, width: 0.1, pos: -1.65 }
  ];

  bbPlates.forEach(p => {
    const pGeo = new THREE.CylinderGeometry(p.radius, p.radius, p.width, 32);
    const pMesh = new THREE.Mesh(pGeo, rubberWeightMaterial);
    pMesh.rotation.z = Math.PI / 2;
    pMesh.position.x = p.pos;
    barbellGroup.add(pMesh);

    const rim = new THREE.Mesh(new THREE.TorusGeometry(p.radius, 0.02, 16, 48), neonAccentMaterial);
    rim.rotation.y = Math.PI / 2;
    rim.position.x = p.pos;
    barbellGroup.add(rim);
  });

  // --- Background Gym Floating Particles ---
  const particlesCount = 90;
  const particlesGeo = new THREE.BufferGeometry();
  const particlePos = new Float32Array(particlesCount * 3);

  for (let i = 0; i < particlesCount * 3; i += 3) {
    particlePos[i] = (Math.random() - 0.5) * 16;
    particlePos[i + 1] = (Math.random() - 0.5) * 12;
    particlePos[i + 2] = (Math.random() - 0.5) * 12;
  }
  particlesGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0x00f2fe,
    size: 0.04,
    transparent: true,
    opacity: 0.4
  });
  particlesMesh = new THREE.Points(particlesGeo, particleMat);
  scene.add(particlesMesh);

  // Initial equipment setup
  dumbbellGroup.position.set(0, 0.2, 0);
  kettlebellGroup.position.set(0, -0.1, 0);
  barbellGroup.position.set(0, 0.2, 0);

  scene.add(dumbbellGroup);
  currentEquipmentGroup = dumbbellGroup;

  // --- Animation Loop ---
  let clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    if (currentEquipmentGroup) {
      // Gentle floating and auto-rotation
      currentEquipmentGroup.rotation.y = elapsedTime * 0.4;
      currentEquipmentGroup.rotation.x = Math.sin(elapsedTime * 0.5) * 0.15;
      currentEquipmentGroup.position.y = 0.2 + Math.sin(elapsedTime * 1.2) * 0.08;
    }

    if (particlesMesh) {
      particlesMesh.rotation.y = elapsedTime * 0.03;
    }

    if (controls) controls.update();
    renderer.render(scene, camera);
  }
  animate();

  // --- Window Resize Handling ---
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // --- 3D Model Switcher Buttons ---
  document.querySelectorAll('.switch-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.switch-btn').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');

      const model = e.currentTarget.dataset.model;
      scene.remove(currentEquipmentGroup);

      if (model === 'dumbbell') {
        currentEquipmentGroup = dumbbellGroup;
      } else if (model === 'kettlebell') {
        currentEquipmentGroup = kettlebellGroup;
      } else if (model === 'barbell') {
        currentEquipmentGroup = barbellGroup;
      }
      scene.add(currentEquipmentGroup);
    });
  });
}

// --- 2. Authenticated Nutrition & Workout Database (WHO / CDC / ACSM) ---
const HEALTH_DATABASE = {
  underweight: {
    label: "Underweight",
    color: "#60a5fa",
    calorieStrategy: "+350 to +500 kcal surplus to safely build lean tissue",
    macroP: "25% (High Protein for muscle synthesis)",
    macroC: "50% (Complex Carbohydrates for energy)",
    macroF: "25% (Healthy Fats & omegas)",
    summary: "WHO & CDC guidelines recommend nutrient-dense, calorie-rich meals focusing on muscle recovery, healthy fats, and sustained positive energy balance.",
    meals: [
      {
        timing: "Breakfast (7:30 AM)",
        title: "Power Oats & Nut Butter Bowl",
        calories: "520 kcal",
        items: [
          "Rolled oats cooked with whole milk or fortified almond milk",
          "2 tbsp natural peanut or almond butter + 1 banana",
          "Handful of crushed walnuts & chia seeds",
          "2 boiled whole eggs for high biological value protein"
        ],
        benefit: "Supplies sustained complex carbs, calorie density, and 24g protein to stop fasting catabolism."
      },
      {
        timing: "Mid-Morning Snack (10:45 AM)",
        title: "Nutrient-Dense Trail & Greek Yogurt",
        calories: "340 kcal",
        items: [
          "1 cup whole milk Greek yogurt",
          "Raw honey drizzle with pumpkin seeds and almonds",
          "1 medium apple or seasonal berries"
        ],
        benefit: "Rich in gut-friendly probiotics, essential fatty acids, and zinc."
      },
      {
        timing: "Lunch (1:30 PM)",
        title: "Lean Protein, Quinoa & Avocado Plate",
        calories: "650 kcal",
        items: [
          "Grilled chicken breast, paneer, or tofu (180g)",
          "1.5 cups cooked quinoa or brown rice",
          "Half ripe avocado with extra virgin olive oil drizzle",
          "Steamed broccoli, spinach, and bell peppers"
        ],
        benefit: "CDC Plate Method enriched with heart-healthy monounsaturated fats."
      },
      {
        timing: "Evening Fuel (5:00 PM)",
        title: "Muscle Booster Smoothie",
        calories: "380 kcal",
        items: [
          "1 glass whole milk / soy milk blended with 1 banana",
          "1 scoop whey protein or sattu powder",
          "1 tbsp flaxseed meal + a pinch of cinnamon"
        ],
        benefit: "Readies muscles with glycogen and amino acids before bodyweight training."
      },
      {
        timing: "Dinner (8:30 PM)",
        title: "Salmon / Lentil Dal with Roasted Sweet Potatoes",
        calories: "580 kcal",
        items: [
          "Baked wild salmon fillet or thick mixed lentil dal (tadka)",
          "1 large baked sweet potato with herb butter",
          "Generous green leafy salad with olive oil dressing"
        ],
        benefit: "High omega-3 fatty acids to reduce joint inflammation and support deep sleep recovery."
      }
    ],
    hydration: "💧 Hydration Goal: Drink 2.5 - 3.0 Liters of water daily. Avoid filling up on water immediately before meals to preserve appetite.",
    pushupRoutine: {
      variation: "Wall to Incline Push-ups (Strength Foundations)",
      tag: "Building Foundational Push Strength",
      dailyTarget: "3 Sets of 8–10 Reps",
      tempo: "Controlled: 2 sec down, 1 sec hold, 1 sec explosive push",
      rest: "90 seconds between sets",
      steps: [
        {
          title: "Form Setup",
          desc: "Place hands shoulder-width apart on a sturdy bench or wall. Maintain a rigid core line from head to heels."
        },
        {
          title: "Elbow Path",
          desc: "Tuck elbows at 45 degrees relative to torso to avoid anterior shoulder impingement."
        },
        {
          title: "Progression Key",
          desc: "Once you achieve 3x12 clean incline reps, move hands lower toward the floor."
        }
      ]
    },
    exercises: [
      { target: "Upper Body Push", name: "Incline Push-ups", sets: "3 sets x 8-10 reps", desc: "Hands on elevated bench; builds chest, shoulders, and triceps without joint strain." },
      { target: "Lower Body", name: "Bodyweight Goblet Squats", sets: "3 sets x 12 reps", desc: "Strengthens quads, glutes, and releases natural growth factors." },
      { target: "Upper Body Pull", name: "Doorframe or Towel Rows", sets: "3 sets x 10 reps", desc: "Strengthens rhomboids and lats to balance chest pressing." },
      { target: "Core Stability", name: "Plank Hold", sets: "3 sets x 30-45 sec", desc: "Builds transverse abdominis strength needed for rigid push-up mechanics." }
    ]
  },

  normal: {
    label: "Normal Weight",
    color: "#10b981",
    calorieStrategy: "Iso-caloric maintenance (energy in = energy out)",
    macroP: "25% (Optimal Tissue Repair)",
    macroC: "50% (Sustained Glycogen)",
    macroF: "25% (Hormonal Balance)",
    summary: "WHO & CDC guidelines prioritize maintaining metabolic equilibrium, athletic conditioning, lean body mass preservation, and micronutrient diversity.",
    meals: [
      {
        timing: "Breakfast (7:30 AM)",
        title: "Mediterranean Egg & Sourdough Toast",
        calories: "450 kcal",
        items: [
          "2 whole eggs + 1 egg white scrambled with baby spinach and tomatoes",
          "2 slices whole grain sourdough bread",
          "1/4 sliced avocado with a sprinkle of chia seeds",
          "Green tea or black coffee (unsweetened)"
        ],
        benefit: "Delivers clean choline, lutein, and low-glycemic sustained morning fuel."
      },
      {
        timing: "Mid-Morning Snack (11:00 AM)",
        title: "Fresh Fruit & Raw Nut Trio",
        calories: "220 kcal",
        items: [
          "1 ripe pear or orange",
          "Small fistful of raw almonds and walnuts (approx. 25g)"
        ],
        benefit: "Polyphenols, fiber, and antioxidant cellular defense."
      },
      {
        timing: "Lunch (1:30 PM)",
        title: "Clean Harvest Power Bowl",
        calories: "550 kcal",
        items: [
          "150g grilled chicken, tuna, or grilled paneer/tofu",
          "1 cup brown rice or wild rice blend",
          "Steam roasted zucchini, bell peppers, and asparagus",
          "1 tsp olive oil and lemon vinaigrette"
        ],
        benefit: "Strict adherence to the CDC Plate Method for balanced blood sugar."
      },
      {
        timing: "Evening Snack (5:00 PM)",
        title: "Protein Crunch",
        calories: "200 kcal",
        items: [
          "Low-fat cottage cheese or roasted chickpeas (hummus with cucumber slices)",
          "Herbal infusion or warm lemon water"
        ],
        benefit: "Prevents evening binge hunger while providing slow-digesting casein/legume protein."
      },
      {
        timing: "Dinner (8:00 PM)",
        title: "Grilled Fish / Tofu Stir-Fry with Greens",
        calories: "480 kcal",
        items: [
          "White fish fillet, baked tofu, or lentil soup",
          "Stir-fried bok choy, broccoli, mushrooms in sesame garlic sauce",
          "1 small portion of steamed sweet potato or corn"
        ],
        benefit: "Low inflammatory nighttime recovery ensuring quality sleep cycles."
      }
    ],
    hydration: "💧 Hydration Goal: Drink 2.8 - 3.5 Liters of water daily. Hydrate consistently before and during exercise.",
    pushupRoutine: {
      variation: "Standard Floor Push-ups (Muscle & Core Mastery)",
      tag: "Hypertrophy & Conditioning Standard",
      dailyTarget: "3–4 Sets of 12–15 Reps",
      tempo: "Strict: 2 sec descent, 0 sec pause, 1 sec power ascent",
      rest: "60–75 seconds between sets",
      steps: [
        {
          title: "Rigid Plank Position",
          desc: "Squeeze glutes and brace abdominal wall throughout the entire movement; zero sagging of the lumbar spine."
        },
        {
          title: "Chest to Deck",
          desc: "Lower body until chest comes within 2 inches of the floor for full pectoral stretch."
        },
        {
          title: "Finisher Option",
          desc: "Add 1 set of Diamond or Decline push-ups on final set for tricep and upper pec overload."
        }
      ]
    },
    exercises: [
      { target: "Chest & Triceps", name: "Standard Floor Push-ups", sets: "4 sets x 12-15 reps", desc: "Gold standard bodyweight pressing for chest development." },
      { target: "Lower Body", name: "Walking Lunges", sets: "3 sets x 15 reps/leg", desc: "Builds single-leg stability, glute drive, and hip mobility." },
      { target: "Upper Back", name: "Pull-ups or Inverted Rows", sets: "3 sets x 8-10 reps", desc: "V-taper builder for balanced back-to-chest posture." },
      { target: "Cardio & Core", name: "Mountain Climbers & Plank", sets: "3 sets x 45 sec", desc: "Elevates VO2 max while fortifying abdominal endurance." }
    ]
  },

  overweight: {
    label: "Overweight",
    color: "#f59e0b",
    calorieStrategy: "-400 to -500 kcal deficit (Aim for safe 0.5kg/week fat loss)",
    macroP: "30% (High Satiety & Muscle Sparing)",
    macroC: "45% (High Fiber, Low GI)",
    macroF: "25% (Essential Unsaturated Fats)",
    summary: "WHO & CDC guidelines suggest a moderate calorie deficit emphasizing fiber-rich veggies, lean protein to preserve lean muscle, and reduced sodium (<2g/day).",
    meals: [
      {
        timing: "Breakfast (8:00 AM)",
        title: "High-Protein Veggie Omelet / Tofu Scramble",
        calories: "380 kcal",
        items: [
          "3 egg whites + 1 whole egg (or 150g tofu scramble)",
          "Loaded with mushrooms, spinach, bell peppers, and onion",
          "1 slice 100% whole grain sprouted toast",
          "Black coffee or warm green tea"
        ],
        benefit: "High protein and volume keeps ghrelin (hunger hormone) suppressed until lunch."
      },
      {
        timing: "Mid-Morning (11:15 AM)",
        title: "Metabolic Fiber Booster",
        calories: "140 kcal",
        items: [
          "1 crisp green apple or bowl of fresh berries",
          "10 raw almonds (portion controlled)"
        ],
        benefit: "Soluble pectin fiber slows digestion and blunts blood glucose spikes."
      },
      {
        timing: "Lunch (1:30 PM)",
        title: "CDC Rainbow Salad with Grilled Chicken / Paneer",
        calories: "450 kcal",
        items: [
          "Half plate: Romaine, cucumber, shredded carrots, purple cabbage",
          "Quarter plate: 150g grilled lemon chicken breast or light paneer/soya chunks",
          "Quarter plate: 1/2 cup black beans or brown rice",
          "Dressing: Lemon juice, black pepper, 1 tsp apple cider vinegar"
        ],
        benefit: "Huge micronutrient density, virtually zero refined sugar, highly filling."
      },
      {
        timing: "Evening Snack (5:15 PM)",
        title: "Green Tea & Sprouted Moong / Edamame",
        calories: "160 kcal",
        items: [
          "1 cup steamed sprouted mung beans or edamame with lemon and rock salt",
          "Cup of freshly brewed antioxidant green tea"
        ],
        benefit: "EGCG polyphenols promote fat oxidation; clean crunchy protein."
      },
      {
        timing: "Dinner (7:45 PM)",
        title: "Steamed Fish / Tofu with Zucchini & Cauliflower Mash",
        calories: "410 kcal",
        items: [
          "150g grilled white fish or spiced grilled tofu",
          "Steamed broccoli and seasoned cauliflower mash (low carb potato substitute)",
          "Clear vegetable broth soup"
        ],
        benefit: "Light, easy to digest, prevents evening water retention."
      }
    ],
    hydration: "💧 Hydration Goal: Drink 3.0 - 4.0 Liters of water daily. Drinking 500ml water 30 minutes before meals significantly supports portion control.",
    pushupRoutine: {
      variation: "Incline Bench to Knee Push-ups (Joint-Friendly)",
      tag: "Safe Progressive Overload for Joints",
      dailyTarget: "3 Sets of 10–12 Reps",
      tempo: "Controlled descent: Protect elbows and shoulders",
      rest: "75–90 seconds between sets",
      steps: [
        {
          title: "Joint Safety First",
          desc: "Since push-ups lift 64% of total bodyweight, higher bodyweight increases wrist/shoulder strain. Incline push-ups reduce this to ~35-45% safely."
        },
        {
          title: "Brace Core",
          desc: "Never let lower back hyperextend. Imagine pulling your belly button into your spine."
        },
        {
          title: "Progression Ladder",
          desc: "Begin on bench incline -> Move to knee push-ups -> Graduate to negative floor push-ups."
        }
      ]
    },
    exercises: [
      { target: "Chest & Shoulders", name: "Incline Bench Push-ups", sets: "3 sets x 10-12 reps", desc: "Builds pressing strength while keeping joint impact low." },
      { target: "Cardio & Calorie Burn", name: "Brisk Incline Walking / Marching", sets: "25-35 minutes", desc: "WHO standard low-impact fat-burning aerobic conditioning." },
      { target: "Lower Body", name: "Chair / Box Squats", sets: "3 sets x 12 reps", desc: "Safely strengthens knees and quadriceps with supported depth." },
      { target: "Posterior Chain", name: "Glute Bridges & Bird Dogs", sets: "3 sets x 12 reps", desc: "Strengthens lower back and glutes to alleviate posture strain." }
    ]
  },

  obese: {
    label: "Obesity",
    color: "#ef4444",
    calorieStrategy: "-500 to -750 kcal deficit (Structured, medically aligned weight regulation)",
    macroP: "32% (Maximal Muscle Preservation)",
    macroC: "43% (Strict Low-Glycemic Whole Plants)",
    macroF: "25% (Anti-inflammatory Healthy Fats)",
    summary: "Aligned with WHO and CDC obesity management protocols: focusing on eliminating ultra-processed foods, high-volume low-calorie vegetables, and joint-protective movements.",
    meals: [
      {
        timing: "Breakfast (8:00 AM)",
        title: "Fiber-Rich Green Scramble",
        calories: "340 kcal",
        items: [
          "1 whole egg + 3 egg whites with chopped spinach and tomatoes",
          "1 small slice whole wheat toast",
          "Warm lemon water + unsweetened herbal tea"
        ],
        benefit: "Stabilizes morning insulin, prevents blood glucose fluctuations."
      },
      {
        timing: "Mid-Morning (11:00 AM)",
        title: "Cucumber & Chia Infusion",
        calories: "100 kcal",
        items: [
          "Sliced cucumbers and celery sticks with lime and sea salt",
          "1 tbsp soaked chia seeds in cold water"
        ],
        benefit: "Natural cellular hydration and digestive fiber."
      },
      {
        timing: "Lunch (1:30 PM)",
        title: "Clean High-Volume Protein Bowl",
        calories: "420 kcal",
        items: [
          "160g skinless chicken breast, baked cod, or sprouted soybean/tofu",
          "Steamed broccoli, green beans, and roasted zucchini (fill 60% plate)",
          "1/3 cup cooked quinoa or wild brown rice",
          "Apple cider vinegar vinaigrette"
        ],
        benefit: "Exceptional satiety volume to curb cravings with dense nutrition."
      },
      {
        timing: "Evening Snack (5:00 PM)",
        title: "Antioxidant Green Tea & Roasted Chana",
        calories: "130 kcal",
        items: [
          "Handful of dry roasted chickpeas (chana)",
          "Hot unsweetened green tea with a squeeze of fresh lemon"
        ],
        benefit: "Clean crunch and polyphenols to sustain energy until dinner."
      },
      {
        timing: "Dinner (7:30 PM)",
        title: "Nutritious Lentil & Vegetable Stew",
        calories: "380 kcal",
        items: [
          "Warm bowl of vegetable and lentil soup (spinach, carrots, tomatoes, moong)",
          "Side of steamed asparagus or cauliflower florets with garlic herbs"
        ],
        benefit: "Ultra-clean evening digestion, zero bloating, anti-inflammatory rest."
      }
    ],
    hydration: "💧 Hydration Goal: Drink 3.5 - 4.5 Liters of water daily. Replace all juices, sodas, and sweet drinks with filtered water or herbal tea.",
    pushupRoutine: {
      variation: "Wall Push-ups to Incline (Zero Joint Friction)",
      tag: "Orthopedic-Safe Upper Body Conditioning",
      dailyTarget: "3 Sets of 10–12 Reps",
      tempo: "Smooth and controlled (2 seconds in, 2 seconds push)",
      rest: "90 seconds between sets",
      steps: [
        {
          title: "Wall Alignment",
          desc: "Stand 2-3 feet from a wall, hands flat at shoulder height. Lower chest to wall without hiking shoulders."
        },
        {
          title: "Painless Progressive Loading",
          desc: "Wall push-ups load only ~9-15% of bodyweight, ensuring tendons and rotator cuffs adapt safely."
        },
        {
          title: "Posture Lock",
          desc: "Engage glutes and upper back muscles to maintain an upright, tall posture throughout."
        }
      ]
    },
    exercises: [
      { target: "Chest & Shoulders", name: "Wall Push-ups", sets: "3 sets x 10-12 reps", desc: "Safe, zero-strain pressing movement for chest and arms." },
      { target: "Cardiovascular Health", name: "Low-Impact Brisk Walking / Water Aerobics", sets: "30-40 minutes daily", desc: "WHO recommended aerobic base for cardiovascular recovery." },
      { target: "Lower Body", name: "Seated Chair Leg Extensions & Stands", sets: "3 sets x 10 reps", desc: "Builds quad and hip mobility without heavy knee impact." },
      { target: "Core & Posture", name: "Standing Knee Lifts & Wall Angels", sets: "3 sets x 10 reps", desc: "Improves posture, spine alignment, and thoracic mobility." }
    ]
  }
};

// --- 3. BMI Calculation, Range Placement & Diet/Workout Generation ---
document.addEventListener("DOMContentLoaded", () => {
  // Initialize 3D Scene
  initThreeGymScene();

  const form = document.querySelector("#bmi-form");
  const resultsContainer = document.querySelector("#results-container");
  const planSection = document.querySelector("#plan-section");

  form.addEventListener("submit", function(e) {
    e.preventDefault();

    const heightInput = document.querySelector("#height").value.trim();
    const weightInput = document.querySelector("#weight").value.trim();
    const gender = document.querySelector("#gender").value;
    const activity = document.querySelector("#activity").value;

    const height = parseFloat(heightInput);
    const weight = parseFloat(weightInput);

    if (isNaN(height) || height <= 40 || height >= 260) {
      alert("Please enter a valid height between 40 cm and 260 cm.");
      return;
    }

    if (isNaN(weight) || weight <= 15 || weight >= 350) {
      alert("Please enter a valid weight between 15 kg and 350 kg.");
      return;
    }

    // Standard BMI Calculation Formula: weight (kg) / (height (m) ^ 2)
    const heightInMeters = height / 100;
    const bmi = parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));

    // Determine category based on WHO definitions
    let categoryKey = "normal";
    let categoryLabel = "Normal Weight";
    let statusColor = "#10b981";

    if (bmi < 18.5) {
      categoryKey = "underweight";
      categoryLabel = "Underweight";
      statusColor = "#60a5fa";
    } else if (bmi >= 18.5 && bmi <= 24.9) {
      categoryKey = "normal";
      categoryLabel = "Normal Weight";
      statusColor = "#10b981";
    } else if (bmi >= 25.0 && bmi <= 29.9) {
      categoryKey = "overweight";
      categoryLabel = "Overweight";
      statusColor = "#f59e0b";
    } else {
      categoryKey = "obese";
      categoryLabel = "Obesity";
      statusColor = "#ef4444";
    }

    // Calculate Ideal Weight Range (18.5 - 24.9)
    const minHealthyWeight = (18.5 * (heightInMeters * heightInMeters)).toFixed(1);
    const maxHealthyWeight = (24.9 * (heightInMeters * heightInMeters)).toFixed(1);

    // Calculate Estimated Energy Expenditure (Mifflin-St Jeor formula)
    let bmr = (10 * weight) + (6.25 * height) - (5 * 25);
    bmr += (gender === 'male' ? 5 : -161);

    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725
    };
    const tdee = Math.round(bmr * (activityMultipliers[activity] || 1.375));

    let targetCalories = tdee;
    if (categoryKey === "underweight") targetCalories += 400;
    else if (categoryKey === "overweight") targetCalories -= 450;
    else if (categoryKey === "obese") targetCalories -= 600;

    // --- Update UI with Results ---
    resultsContainer.classList.remove("hidden");
    planSection.classList.remove("hidden");

    // Score Circle
    const bmiValEl = document.querySelector("#bmi-val");
    const bmiCatEl = document.querySelector("#bmi-category");
    const circleEl = document.querySelector(".bmi-score-circle");

    bmiValEl.textContent = bmi;
    bmiCatEl.textContent = categoryLabel;
    bmiCatEl.style.color = statusColor;
    circleEl.style.borderColor = statusColor;
    circleEl.style.boxShadow = `0 0 25px ${statusColor}70`;

    // Metrics summary
    document.querySelector("#healthy-weight-range").textContent = `${minHealthyWeight} – ${maxHealthyWeight} kg`;
    
    let weightDeltaMsg = "You are in the optimal range";
    if (weight < minHealthyWeight) {
      weightDeltaMsg = `+${(minHealthyWeight - weight).toFixed(1)} kg to reach healthy minimum`;
    } else if (weight > maxHealthyWeight) {
      weightDeltaMsg = `-${(weight - maxHealthyWeight).toFixed(1)} kg to reach healthy maximum`;
    }
    document.querySelector("#weight-delta-text").textContent = weightDeltaMsg;

    document.querySelector("#calorie-target").textContent = `~${targetCalories} kcal / day`;
    document.querySelector("#caloric-strategy").textContent = HEALTH_DATABASE[categoryKey].calorieStrategy;

    // Update Slider Position
    // Map BMI roughly from 14 to 36 onto 0% to 100%
    const clampedBmi = Math.min(Math.max(bmi, 14), 36);
    const indicatorPercent = ((clampedBmi - 14) / (36 - 14)) * 100;
    const rangeIndicator = document.querySelector("#range-indicator");
    rangeIndicator.style.left = `${indicatorPercent}%`;

    // Render Full Day Diet Plan
    renderDietPlan(categoryKey, targetCalories);

    // Render Workout Plan & Pushup Routine
    renderWorkoutPlan(categoryKey);

    // Scroll smoothly to results
    resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // --- Mobile Hamburger Menu Toggle ---
  const mobileMenuBtn = document.querySelector("#mobile-menu-btn");
  const navActions = document.querySelector("#nav-actions");

  if (mobileMenuBtn && navActions) {
    mobileMenuBtn.addEventListener("click", () => {
      mobileMenuBtn.classList.toggle("open");
      navActions.classList.toggle("open");
    });

    // Close mobile dropdown when a nav-link is clicked
    document.querySelectorAll(".nav-link").forEach(link => {
      link.addEventListener("click", () => {
        mobileMenuBtn.classList.remove("open");
        navActions.classList.remove("open");
      });
    });
  }

  // --- Comprehensive BMI Educational Modal Logic ---
  const bmiModal = document.querySelector("#bmi-modal");
  const openModalBtn = document.querySelector("#guide-modal-btn");
  const openGuideLink = document.querySelector("#open-guide-link");
  const inlineGuideBtn = document.querySelector("#inline-guide-btn");
  const closeModalBtn = document.querySelector("#modal-close-btn");
  const closeBottomBtn = document.querySelector("#modal-close-bottom-btn");

  function openGuideModal() {
    if (bmiModal) {
      bmiModal.classList.remove("hidden");
      document.body.style.overflow = "hidden"; // Prevent background scrolling
    }
  }

  function closeGuideModal() {
    if (bmiModal) {
      bmiModal.classList.add("hidden");
      document.body.style.overflow = "auto";
    }
  }

  if (openModalBtn) openModalBtn.addEventListener("click", openGuideModal);
  if (openGuideLink) openGuideLink.addEventListener("click", (e) => {
    e.preventDefault();
    openGuideModal();
  });
  if (inlineGuideBtn) inlineGuideBtn.addEventListener("click", openGuideModal);
  if (closeModalBtn) closeModalBtn.addEventListener("click", closeGuideModal);
  if (closeBottomBtn) closeBottomBtn.addEventListener("click", closeGuideModal);

  // Close modal when clicking outside modal container
  if (bmiModal) {
    bmiModal.addEventListener("click", (e) => {
      if (e.target === bmiModal) {
        closeGuideModal();
      }
    });
  }

  // Escape key closes modal
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && bmiModal && !bmiModal.classList.contains("hidden")) {
      closeGuideModal();
    }
  });

  // Clicking category pills opens modal directly
  document.querySelectorAll(".pill").forEach(pill => {
    pill.addEventListener("click", () => {
      openGuideModal();
    });
  });

  // --- Tab Navigation Logic ---
  const tabButtons = document.querySelectorAll(".tab-btn");
  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      tabButtons.forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach(tc => tc.classList.remove("active"));

      btn.classList.add("active");
      const targetId = btn.getAttribute("data-tab");
      const targetContent = document.getElementById(targetId);
      if (targetContent) targetContent.classList.add("active");
    });
  });
});

// Render Diet Function
function renderDietPlan(categoryKey, targetCalories) {
  const data = HEALTH_DATABASE[categoryKey];
  if (!data) return;

  document.querySelector("#diet-badge").textContent = `Category: ${data.label}`;
  document.querySelector("#diet-heading").textContent = `Full-Day Nutrition & Meal Plan (~${targetCalories} kcal)`;
  document.querySelector("#diet-summary").textContent = data.summary;

  document.querySelector("#macro-p").textContent = `Protein: ${data.macroP}`;
  document.querySelector("#macro-c").textContent = `Carbs: ${data.macroC}`;
  document.querySelector("#macro-f").textContent = `Healthy Fats: ${data.macroF}`;

  const mealsContainer = document.querySelector("#meals-container");
  mealsContainer.innerHTML = "";

  data.meals.forEach(m => {
    const mealEl = document.createElement("div");
    mealEl.className = "meal-card";
    mealEl.innerHTML = `
      <div class="meal-header">
        <span class="meal-timing">${m.timing}</span>
        <span class="meal-cal">${m.calories}</span>
      </div>
      <h3 class="meal-title">${m.title}</h3>
      <ul class="meal-items-list">
        ${m.items.map(item => `<li>${item}</li>`).join("")}
      </ul>
      <div class="meal-benefit">${m.benefit}</div>
    `;
    mealsContainer.appendChild(mealEl);
  });

  const hydrationBox = document.querySelector("#diet-hydration-box");
  hydrationBox.innerHTML = `
    <div style="font-size: 1.5rem;">💧</div>
    <div>${data.hydration}</div>
  `;
}

// Render Workout & Push-ups Function
function renderWorkoutPlan(categoryKey) {
  const data = HEALTH_DATABASE[categoryKey];
  if (!data) return;

  const pushupHero = document.querySelector("#pushup-hero");
  const p = data.pushupRoutine;

  pushupHero.innerHTML = `
    <div class="pushup-header">
      <div>
        <span class="pushup-tag">${p.tag}</span>
        <h3 style="font-size: 1.5rem; font-weight: 800; margin-top: 8px; color: #fff;">${p.variation}</h3>
      </div>
    </div>
    
    <div class="pushup-stat-boxes">
      <div class="pushup-stat">
        <span class="lbl">Daily Target</span>
        <span class="val">${p.dailyTarget}</span>
      </div>
      <div class="pushup-stat">
        <span class="lbl">Tempo Cadence</span>
        <span class="val" style="font-size: 1rem;">${p.tempo}</span>
      </div>
      <div class="pushup-stat">
        <span class="lbl">Rest Interval</span>
        <span class="val" style="font-size: 1.1rem;">${p.rest}</span>
      </div>
    </div>

    <div class="pushup-guide-steps">
      ${p.steps.map(s => `
        <div class="guide-step">
          <strong>${s.title}</strong>
          ${s.desc}
        </div>
      `).join("")}
    </div>
  `;

  const exContainer = document.querySelector("#exercises-container");
  exContainer.innerHTML = "";

  data.exercises.forEach(ex => {
    const card = document.createElement("div");
    card.className = "exercise-card";
    card.innerHTML = `
      <div class="ex-top">
        <span class="ex-target">${ex.target}</span>
        <span class="ex-sets">${ex.sets}</span>
      </div>
      <div class="ex-name">${ex.name}</div>
      <div class="ex-desc">${ex.desc}</div>
    `;
    exContainer.appendChild(card);
  });
}