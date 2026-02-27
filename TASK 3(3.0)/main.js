// ---------------- AUTH PAGE (index.html) ----------------
const tabLogin = document.getElementById("tab-login");
const tabSignup = document.getElementById("tab-signup");
const panelLogin = document.getElementById("panel-login");
const panelSignup = document.getElementById("panel-signup");
const switchText = document.getElementById("switch-text");
const errorBox = document.getElementById("error");
const successBox = document.getElementById("success");

let currentMode = "login";

function setMode(mode) {
  currentMode = mode;

  if (mode === "login") {
    tabLogin?.classList.add("tab-active");
    tabSignup?.classList.remove("tab-active");
    panelLogin?.classList.add("panel-active");
    panelSignup?.classList.remove("panel-active");
    if (switchText) switchText.textContent = "Need an account? Switch to signup";
  } else {
    tabSignup?.classList.add("tab-active");
    tabLogin?.classList.remove("tab-active");
    panelSignup?.classList.add("panel-active");
    panelLogin?.classList.remove("panel-active");
    if (switchText) switchText.textContent = "Already have an account? Switch to login";
  }

  if (errorBox) errorBox.style.display = "none";
  if (successBox) successBox.style.display = "none";
}

if (tabLogin && tabSignup && switchText) {
  tabLogin.addEventListener("click", () => setMode("login"));
  tabSignup.addEventListener("click", () => setMode("signup"));
  switchText.addEventListener("click", () => {
    setMode(currentMode === "login" ? "signup" : "login");
  });
}

// SIGNUP
const signupForm = document.getElementById("form-signup");
if (signupForm) {
  signupForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const emailInput = document.getElementById("signup-email");
    const passwordInput = document.getElementById("signup-password");
    const confirmInput = document.getElementById("signup-confirm");

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const confirm = confirmInput.value.trim();

    errorBox.style.display = "none";
    successBox.style.display = "none";

    if (!email || !password || !confirm) {
      errorBox.textContent = "Fill in all fields.";
      errorBox.style.display = "block";
      return;
    }

    if (!emailInput.checkValidity()) {
      errorBox.textContent = "Please enter a valid email address.";
      errorBox.style.display = "block";
      return;
    }

    if (password.length < 6) {
      errorBox.textContent = "Password should be at least 6 characters.";
      errorBox.style.display = "block";
      return;
    }

    if (password !== confirm) {
      errorBox.textContent = "Passwords do not match.";
      errorBox.style.display = "block";
      return;
    }

    const fakeUser = { email, password };
    localStorage.setItem("nova_demo_user", JSON.stringify(fakeUser)); // [web:202]

    successBox.textContent =
      "Signup saved for this browser. You can now log in with this email and password.";
    successBox.style.display = "block";

    setTimeout(() => {
      setMode("login");
      const loginEmailInput = document.getElementById("login-email");
      if (loginEmailInput) loginEmailInput.value = email;
    }, 800);
  });
}

// LOGIN
const loginForm = document.getElementById("form-login");
if (loginForm) {
  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const emailInput = document.getElementById("login-email");
    const passwordInput = document.getElementById("login-password");

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    errorBox.style.display = "none";
    successBox.style.display = "none";

    if (!emailInput.checkValidity()) {
      errorBox.textContent = "Please enter a valid email address.";
      errorBox.style.display = "block";
      return;
    }

    const stored = localStorage.getItem("nova_demo_user");
    if (!stored) {
      errorBox.textContent =
        "No signup found in this browser. Please create an account first.";
      errorBox.style.display = "block";
      return;
    }

    const fakeUser = JSON.parse(stored);
    const emailMatch = fakeUser.email === email;
    const passMatch = fakeUser.password === password;

    if (emailMatch && passMatch) {
      localStorage.setItem("nova_demo_active_email", email);
      window.location.href = "dashboard.html";
    } else {
      errorBox.textContent =
        "Email or password is incorrect for this demo account.";
      errorBox.style.display = "block";
    }
  });
}

// ---------------- DASHBOARD PAGE (dashboard.html) ----------------
if (window.location.pathname.endsWith("dashboard.html")) {
  const activeEmail = localStorage.getItem("nova_demo_active_email") || "";
  const signedEmailElement = document.getElementById("signed-email");
  const greetingEl = document.getElementById("greeting");
  const statCycles = document.getElementById("stat-cycles");
  const statTasks = document.getElementById("stat-tasks");
  const statOrders = document.getElementById("stat-orders");
  const ordersList = document.getElementById("orders-list");
  const settingsHint = document.getElementById("settings-hint");

  const toggleDensity = document.getElementById("toggle-density");
  const toggleTheme = document.getElementById("toggle-theme");
  const toggleEmailBadge = document.getElementById("toggle-email-badge");

  const taskInput = document.getElementById("task-input");
  const addTaskBtn = document.getElementById("add-task-btn");
  const taskListEl = document.getElementById("task-list");

  // localStorage keys
  const SETTINGS_KEY = "nova_focus_settings";
  const TASKS_KEY = "nova_focus_tasks";
  const CYCLES_KEY = "nova_focus_cycles";
  const ORDERS_KEY = "nova_demo_orders"; // reuse from previous dashboard

  // --- helpers ---
  function loadJSON(key, fallback) {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    try {
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }
  function saveJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // --- header email + greeting ---
  if (signedEmailElement && activeEmail) {
    signedEmailElement.textContent = activeEmail;
  }
  if (greetingEl) {
    const hour = new Date().getHours();
    let label = "Hello";
    if (hour < 12) label = "Good morning";
    else if (hour < 18) label = "Good afternoon";
    else label = "Good evening";
    greetingEl.textContent = `${label}${activeEmail ? ", " + activeEmail.split("@")[0] : ""}`;
  }

  // ---------------- TIMER ----------------
  const displayEl = document.getElementById("timer-display");
  const labelEl = document.getElementById("timer-label");
  const startBtn = document.getElementById("timer-start");
  const pauseBtn = document.getElementById("timer-pause");
  const resetBtn = document.getElementById("timer-reset");

  let timerSeconds = 25 * 60;
  let timerId = null;

  function renderTimer() {
    const m = String(Math.floor(timerSeconds / 60)).padStart(2, "0");
    const s = String(timerSeconds % 60).padStart(2, "0");
    if (displayEl) displayEl.textContent = `${m}:${s}`;
  }

  function setTimerLabel(text) {
    if (labelEl) labelEl.textContent = text;
  }

  function loadCycles() {
    return loadJSON(CYCLES_KEY, 0);
  }
  function saveCycles(value) {
    saveJSON(CYCLES_KEY, value);
    if (statCycles) statCycles.textContent = String(value);
  }

  renderTimer();
  saveCycles(loadCycles()); // update UI

  function startTimer() {
    if (timerId) return;
    setTimerLabel("Focus mode running…");
    timerId = setInterval(() => {
      timerSeconds -= 1;
      if (timerSeconds <= 0) {
        clearInterval(timerId);
        timerId = null;
        timerSeconds = 25 * 60;
        renderTimer();
        setTimerLabel("Cycle complete! Take a short break.");
        const next = loadCycles() + 1;
        saveCycles(next);
      } else {
        renderTimer();
      }
    }, 1000);
  }

  function pauseTimer() {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
      setTimerLabel("Paused.");
    }
  }

  function resetTimer() {
    pauseTimer();
    timerSeconds = 25 * 60;
    renderTimer();
    setTimerLabel("Ready when you are.");
  }

  startBtn?.addEventListener("click", startTimer);
  pauseBtn?.addEventListener("click", pauseTimer);
  resetBtn?.addEventListener("click", resetTimer);

  // ---------------- TASKS ----------------
  function loadTasks() {
    return loadJSON(TASKS_KEY, []);
  }

  function saveTasks(tasks) {
    saveJSON(TASKS_KEY, tasks);
    if (statTasks) statTasks.textContent = String(tasks.length);
  }

  function renderTasks() {
    if (!taskListEl) return;
    const tasks = loadTasks();
    taskListEl.innerHTML = "";
    tasks.forEach((task, index) => {
      const li = document.createElement("li");
      li.className = "task-item" + (task.done ? " done" : "");
      li.innerHTML = `
        <input type="checkbox" ${task.done ? "checked" : ""}>
        <span>${task.text}</span>
        <div class="task-actions">
          <button class="task-btn" data-action="delete">Del</button>
        </div>
      `;
      const checkbox = li.querySelector("input");
      checkbox.addEventListener("change", () => {
        const updated = loadTasks();
        updated[index].done = checkbox.checked;
        saveTasks(updated);
        renderTasks();
      });
      const delBtn = li.querySelector('[data-action="delete"]');
      delBtn.addEventListener("click", () => {
        const updated = loadTasks();
        updated.splice(index, 1);
        saveTasks(updated);
        renderTasks();
      });
      taskListEl.appendChild(li);
    });
    saveTasks(tasks);
  }

  addTaskBtn?.addEventListener("click", () => {
    const text = taskInput.value.trim();
    if (!text) return;
    const tasks = loadTasks();
    tasks.push({ text, done: false });
    taskInput.value = "";
    saveTasks(tasks);
    renderTasks();
  });

  taskInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      addTaskBtn.click();
    }
  });

  renderTasks();

  // ---------------- ORDERS (read-only from localStorage) ----------------
  function renderOrders() {
    if (!ordersList || !statOrders) return;
    const orders = loadJSON(ORDERS_KEY, {});
    const entries = Object.values(orders);
    statOrders.textContent = String(entries.length);
    if (entries.length === 0) {
      ordersList.textContent = "No orders yet. Use the old collections dashboard to create demo orders.";
      return;
    }
    const latest = entries[entries.length - 1];
    ordersList.innerHTML = `
      <div class="line">Last order: <strong>${latest.id || "ORD"}</strong></div>
      <div class="line">${latest.count || 0} items · ${latest.currency || "USD"} ${latest.total || 0}</div>
      <div class="line">${latest.at || ""}</div>
    `;
  }

  renderOrders();

  // ---------------- SETTINGS ----------------
  function loadSettings() {
    return loadJSON(SETTINGS_KEY, {
      dense: false,
      theme: "dark",
      showEmailInGreeting: false,
    });
  }

  function applySettings() {
    const s = loadSettings();
    const body = document.body;

    if (toggleDensity) toggleDensity.checked = s.dense;
    if (toggleTheme) toggleTheme.checked = s.theme === "alt";
    if (toggleEmailBadge) toggleEmailBadge.checked = s.showEmailInGreeting;

    if (s.dense) body.classList.add("nova-density-compact");
    else body.classList.remove("nova-density-compact");

    if (s.theme === "alt") body.classList.add("nova-theme-alt");
    else body.classList.remove("nova-theme-alt");

    if (settingsHint) {
      settingsHint.textContent = `Theme: ${s.theme === "alt" ? "Alt" : "Dark"} • Layout: ${s.dense ? "Compact" : "Relaxed"}`;
    }

    if (greetingEl && activeEmail) {
      const hour = new Date().getHours();
      let label = "Hello";
      if (hour < 12) label = "Good morning";
      else if (hour < 18) label = "Good afternoon";
      else label = "Good evening";

      if (s.showEmailInGreeting) {
        greetingEl.textContent = `${label}, ${activeEmail}`;
      } else {
        greetingEl.textContent = `${label}, ${activeEmail.split("@")[0]}`;
      }
    }
  }

  function saveAndApplySettings(changes) {
    const s = Object.assign(loadSettings(), changes);
    saveJSON(SETTINGS_KEY, s);
    applySettings();
  }

  toggleDensity?.addEventListener("change", () => {
    saveAndApplySettings({ dense: toggleDensity.checked });
  });

  toggleTheme?.addEventListener("change", () => {
    saveAndApplySettings({ theme: toggleTheme.checked ? "alt" : "dark" });
  });

  toggleEmailBadge?.addEventListener("change", () => {
    saveAndApplySettings({ showEmailInGreeting: toggleEmailBadge.checked });
  });

  applySettings();

  console.log("Focus dashboard ready.");
}
