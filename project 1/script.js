// --- QUOTE LOGIC (NEW) ---
const quoteTrack = document.getElementById("quoteTrack");
const motivationalQuotes = [
    "Small steps in the right direction can turn out to be the biggest step of your life.",
    "Success is the sum of small efforts, repeated day in and day out.",
    "Believe you can and you're halfway there.",
    "Your future is created by what you do today, not tomorrow.",
    "Don't watch the clock; do what it does. Keep going.",
    "The secret of your future is hidden in your daily routine.",
    "It does not matter how slowly you go as long as you do not stop.",
    "Quality is not an act, it is a habit.",
    "The only way to achieve the impossible is to believe it is possible.",
    "Don't stop when you're tired. Stop when you're done.",
    "Discipline is doing what needs to be done, even if you don't want to do it.",
    "Dream big. Start small. Act now.",
    "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
    "You don't have to be great to start, but you have to start to be great.",
    "Action is the foundational key to all success.",
    "Motivation is what gets you started. Habit is what keeps you going.",
    "Focus on the process, not the perfection.",
    "One day or day one. You decide.",
    "The harder you work for something, the greater you'll feel when you achieve it.",
    "Success doesn't come from what you do occasionally, it comes from what you do consistently."
];

// Inject Quotes into the Ticker
quoteTrack.innerHTML = motivationalQuotes.map(quote => `<span class="quote-item">${quote}</span>`).join('');


// --- DOM Elements ---
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");
const body = document.body;

const triggerAddModal = document.getElementById("triggerAddModal");
const calendarPopup = document.getElementById("calendarPopup");
const closePopupBtn = document.getElementById("closePopupBtn");
const saveDateBtn = document.getElementById("saveDateBtn");

const habitInput = document.getElementById("habitInput");
const monthSelect = document.getElementById("monthSelect");
const daySelect = document.getElementById("daySelect");
const yearSelect = document.getElementById("yearSelect");
const reminderTime = document.getElementById("reminderTime");

const habitList = document.getElementById("habitList");
const emptyState = document.getElementById("emptyState");
const totalCountDisplay = document.getElementById("totalCount");
const completionRateDisplay = document.getElementById("completionRate");

// --- 1. State Management & Colors ---
const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899'];
let habitsData = JSON.parse(localStorage.getItem("habits")) || [];

// --- 2. Chart Initialization ---
let habitChart;
const ctx = document.getElementById('habitChart').getContext('2d');

function initChart() {
    habitChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { color: '#94a3b8' } }
            },
            cutout: '70%'
        }
    });
}

// --- 3. Render Functions ---
function renderHabits() {
    habitList.innerHTML = "";
    checkDailyReset(); 

    if (habitsData.length === 0) {
        emptyState.style.display = "block";
    } else {
        emptyState.style.display = "none";
    }

    let completedCount = 0;
    const chartLabels = [];
    const chartData = [];
    const chartColors = [];

    habitsData.forEach((habit, index) => {
        if(habit.completedToday) completedCount++;

        const li = document.createElement("li");
        li.style.borderLeftColor = habit.color;

        if(habit.completedToday) {
            li.classList.add("habit-completed");
        }

        li.innerHTML = `
            <div class="habit-info">
                <strong style="color: ${habit.color}">${habit.name}</strong>
                <span class="streak-badge">
                    <i class="fas fa-fire" style="color: ${habit.streak > 0 ? '#f59e0b' : '#555'}"></i> 
                    ${habit.streak} Day Streak
                </span>
            </div>
            <div class="actions">
                ${!habit.completedToday ? `
                <button class="action-btn check-btn" onclick="toggleComplete(${index})" style="background: ${habit.color}">
                    <i class="fas fa-check"></i>
                </button>` : `
                <button class="action-btn undo-btn" onclick="toggleComplete(${index})">
                    <i class="fas fa-undo"></i>
                </button>`
                }
                <button class="action-btn edit-btn" onclick="editHabit(${index})">
                    <i class="fas fa-pen"></i>
                </button>
                <button class="action-btn delete-btn" onclick="deleteHabit(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        habitList.appendChild(li);

        chartLabels.push(habit.name);
        chartData.push(1);
        chartColors.push(habit.completedToday ? '#2d3748' : habit.color);
    });

    totalCountDisplay.innerText = habitsData.length;
    const rate = habitsData.length > 0 ? Math.round((completedCount / habitsData.length) * 100) : 0;
    completionRateDisplay.innerText = `${rate}%`;

    habitChart.data.labels = chartLabels;
    habitChart.data.datasets[0].data = chartData;
    habitChart.data.datasets[0].backgroundColor = chartColors;
    habitChart.update();
}

// --- 4. Logic Operations ---
function checkDailyReset() {
    const today = new Date().toDateString();
    habitsData.forEach(habit => {
        if (habit.lastCompletedDate !== today) {
            habit.completedToday = false;
        }
    });
    saveData();
}

window.toggleComplete = (index) => {
    const habit = habitsData[index];
    const today = new Date().toDateString();

    if (!habit.completedToday) {
        habit.completedToday = true;
        habit.streak += 1;
        habit.lastCompletedDate = today;
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: [habit.color, '#ffffff'] });
    } else {
        habit.completedToday = false;
        habit.streak = Math.max(0, habit.streak - 1);
    }
    saveData();
    renderHabits();
};

saveDateBtn.onclick = () => {
    const name = habitInput.value.trim();
    if (!name) return alert("Please enter a name!");
    const color = colors[habitsData.length % colors.length];

    const newHabit = { name, color, streak: 0, completedToday: false, lastCompletedDate: null };
    habitsData.push(newHabit);
    saveData();
    renderHabits();

    calendarPopup.style.display = "none";
    habitInput.value = "";
};

window.editHabit = (index) => {
    const habit = habitsData[index];
    const newName = prompt("Edit Habit Name:", habit.name);
    if (newName && newName.trim() !== "") {
        habitsData[index].name = newName.trim();
        saveData();
        renderHabits();
    }
};

window.deleteHabit = (index) => {
    if(confirm("Delete this habit?")) {
        habitsData.splice(index, 1);
        saveData();
        renderHabits();
    }
};

function saveData() {
    localStorage.setItem("habits", JSON.stringify(habitsData));
}

// --- 5. Helpers ---
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
months.forEach((m, i) => monthSelect.innerHTML += `<option value="${i}">${m}</option>`);
for (let y = 2024; y <= 2030; y++) yearSelect.innerHTML += `<option value="${y}">${y}</option>`;

function updateDays() {
    const month = parseInt(monthSelect.value);
    const year = parseInt(yearSelect.value);
    const days = new Date(year, month + 1, 0).getDate();
    daySelect.innerHTML = "";
    for (let d = 1; d <= days; d++) daySelect.innerHTML += `<option value="${d}">${d}</option>`;
}
monthSelect.onchange = updateDays;
yearSelect.onchange = updateDays;

triggerAddModal.onclick = () => {
    calendarPopup.style.display = "flex";
    updateDays();
    habitInput.focus();
};
closePopupBtn.onclick = () => { calendarPopup.style.display = "none"; };

// Theme Toggle
let isDarkMode = true;
themeToggle.onclick = () => {
    isDarkMode = !isDarkMode;
    if (isDarkMode) {
        body.removeAttribute("data-theme");
        themeIcon.classList.replace("fa-moon", "fa-sun");
    } else {
        body.setAttribute("data-theme", "light");
        themeIcon.classList.replace("fa-sun", "fa-moon");
    }
};

// Init
initChart();
updateDays();
renderHabits();