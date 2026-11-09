// GET SAVED DATA

let activities = JSON.parse(localStorage.getItem("activities")) || [];

let goal = Number(localStorage.getItem("goal")) || 5000;

let reminders = JSON.parse(localStorage.getItem("reminders")) || [];

let profile = JSON.parse(localStorage.getItem("profile")) || {
    name: "",
    email: ""
};

let progressChart = null;


// NAVIGATION

function showSection(id) {
    document.querySelectorAll(".section").forEach(section => {
        section.classList.remove("active");
    });

    document.getElementById(id).classList.add("active");

    if (id === "progress") {
        setTimeout(drawChart, 0);
    }
}


// ADD ACTIVITY

function addActivity() {

    let type = document.getElementById("activityType").value;

    let duration = Number(document.getElementById("duration").value);

    let steps = Number(document.getElementById("steps").value);

    if (!duration || duration < 1 || steps < 0 ||
        document.getElementById("duration").value === "" ||
        document.getElementById("steps").value === "") {

        alert("Please enter valid activity details!");
        return;
    }

    let activity = {
        type: type,
        duration: duration,
        steps: steps,
        date: new Date().toISOString().slice(0, 10)
    };

    activities.push(activity);

    localStorage.setItem("activities", JSON.stringify(activities));

    document.getElementById("duration").value = "";
    document.getElementById("steps").value = "";

    updateDashboard();

    alert("Activity added successfully!");
}


// GET TODAY'S STEPS

function getTodaySteps() {

    let today = new Date().toISOString().slice(0, 10);

    return activities
        .filter(a => a.date === today)
        .reduce((sum, a) => sum + a.steps, 0);
}


// DASHBOARD UPDATE

function updateDashboard() {

    let today = new Date().toISOString().slice(0, 10);

    let todayActivities = activities.filter(a => a.date === today);

    let steps = getTodaySteps();

    let percent = Math.min((steps / goal) * 100, 100);

    document.getElementById("totalSteps").innerText = steps;

    document.getElementById("totalWorkouts").innerText =
        todayActivities.length;

    document.getElementById("goalPercent").innerText =
        Math.round(percent) + "%";

    document.getElementById("progressBar").style.width =
        percent + "%";

    document.getElementById("progressText").innerText =
        steps + " / " + goal + " steps";

    let history = document.getElementById("activityHistory");

    let recent = document.getElementById("recentActivities");

    history.innerHTML = "";
    recent.innerHTML = "";

    activities.slice().reverse().forEach(a => {

        let item = document.createElement("div");

        item.className = "activity-item";

        item.innerHTML = `
            <span>
                <strong>${a.type}</strong><br>
                ${a.duration} minutes | ${a.steps} steps
            </span>
            <span>${a.date}</span>
        `;

        history.appendChild(item);

        if (a.date === today) {
            recent.appendChild(item.cloneNode(true));
        }
    });

    if (activities.length === 0) {
        history.innerText = "No activities recorded yet.";
        recent.innerText = "No recent activities.";
    }
}


// SAVE GOAL

function saveGoal() {

    let newGoal = Number(document.getElementById("stepGoal").value);

    if (!Number.isFinite(newGoal) || newGoal <= 0) {
        alert("Enter a valid goal!");
        return;
    }

    goal = newGoal;

    localStorage.setItem("goal", goal);

    document.getElementById("goalDisplay").innerText =
        "Your Goal: " + goal + " Steps";

    updateDashboard();

    alert("Goal saved successfully!");
}


// WEEKLY GRAPH

function drawChart() {

    let labels = [];
    let values = [];

    for (let i = 6; i >= 0; i--) {

        let date = new Date();

        date.setDate(date.getDate() - i);

        let dateString = date.toISOString().slice(0, 10);

        labels.push(date.toLocaleDateString("en-US", {
            weekday: "short"
        }));

        let total = activities
            .filter(a => a.date === dateString)
            .reduce((sum, a) => sum + a.steps, 0);

        values.push(total);
    }

    let ctx = document.getElementById("progressChart");

    if (progressChart) {
        progressChart.destroy();
    }

    progressChart = new Chart(ctx, {
        type: "bar",

        data: {
            labels: labels,

            datasets: [{
                label: "Daily Steps",

                data: values,

                backgroundColor: "#16875c",

                borderRadius: 6
            }]
        },

        options: {
            responsive: true,

            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}


// ADD REMINDER

function addReminder() {

    let message =
        document.getElementById("reminderMessage").value.trim();

    let time =
        document.getElementById("reminderTime").value;

    if (!message || !time) {
        alert("Please enter reminder details!");
        return;
    }

    reminders.push({
        message: message,
        time: time
    });

    localStorage.setItem("reminders", JSON.stringify(reminders));

    document.getElementById("reminderMessage").value = "";
    document.getElementById("reminderTime").value = "";

    displayReminders();

    alert("Reminder saved!");
}


// DISPLAY REMINDERS

function displayReminders() {

    let list = document.getElementById("reminderList");

    list.innerHTML = "";

    reminders.forEach((r, index) => {

        let item = document.createElement("div");

        item.className = "reminder-item";

        item.innerHTML = `
            <span>${r.message} - ${r.time}</span>
            <button onclick="deleteReminder(${index})">Delete</button>
        `;

        list.appendChild(item);
    });
}


// DELETE REMINDER

function deleteReminder(index) {

    reminders.splice(index, 1);

    localStorage.setItem("reminders", JSON.stringify(reminders));

    displayReminders();
}


// SAVE PROFILE

function saveProfile() {

    profile.name =
        document.getElementById("userName").value.trim();

    profile.email =
        document.getElementById("userEmail").value.trim();

    if (!profile.name || !profile.email ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {

        alert("Please enter a valid name and email!");
        return;
    }

    localStorage.setItem("profile", JSON.stringify(profile));

    document.getElementById("profileInfo").innerText =
        "Welcome " + profile.name + "! Profile saved successfully.";

    alert("Profile updated!");
}


// INITIALIZE APPLICATION

document.getElementById("today").innerText =
    new Date().toLocaleDateString();

document.getElementById("stepGoal").value = goal;

document.getElementById("goalDisplay").innerText =
    "Your Goal: " + goal + " Steps";

document.getElementById("userName").value = profile.name;

document.getElementById("userEmail").value = profile.email;

if (profile.name) {
    document.getElementById("profileInfo").innerText =
        "Welcome " + profile.name + "!";
}

updateDashboard();

displayReminders();