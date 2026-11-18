/* =====================================================
   STUDYPILOT AI
   Main JavaScript File

   This file controls the functionality of the website:
   - Navigation
   - Student profile
   - Subjects
   - Study tasks
   - Dashboard
   - Local storage
   ===================================================== */


/* =====================================================
   1. SELECTING HTML ELEMENTS
   ===================================================== */

// Select one HTML element using its CSS selector.
const $ = (selector) => document.querySelector(selector);

// Select all HTML elements matching a CSS selector.
const $$ = (selector) => document.querySelectorAll(selector);


/* =====================================================
   2. LOCAL STORAGE KEYS
   ===================================================== */

// These keys identify the information saved in the browser.
const STORAGE_KEYS = {
    profile: "sp_profile",
    subjects: "sp_subjects",
    tasks: "sp_tasks"
};


/* =====================================================
   3. SAMPLE DATA
   ===================================================== */

// Sample subjects displayed when the application is
// opened for the first time.
const sampleSubjects = [
    {
        id: 1,
        name: "Mathematics",
        color: "purple",
        mastery: 55
    },
    {
        id: 2,
        name: "Python",
        color: "mint",
        mastery: 65
    },
    {
        id: 3,
        name: "Internet Programming",
        color: "blue",
        mastery: 75
    }
];


// Create a date a specified number of days from today.
function dateOffset(days) {
    const date = new Date();

    date.setDate(date.getDate() + days);

    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0")
    ].join("-");
}


// Sample study tasks for demonstration.
const sampleTasks = [
    {
        id: 1,
        title: "Revise matrices",
        subjectId: 1,
        priority: "high",
        deadline: dateOffset(1),
        completed: false
    },
    {
        id: 2,
        title: "Practice Python functions",
        subjectId: 2,
        priority: "medium",
        deadline: dateOffset(2),
        completed: false
    },
    {
        id: 3,
        title: "Review HTML forms",
        subjectId: 3,
        priority: "low",
        deadline: dateOffset(3),
        completed: true
    }
];


/* =====================================================
   4. READING AND SAVING DATA
   ===================================================== */

// Read information from browser local storage.
function readData(key, defaultValue) {
    try {
        const savedData = localStorage.getItem(key);

        return savedData
            ? JSON.parse(savedData)
            : defaultValue;

    } catch (error) {
        return defaultValue;
    }
}


// Save information in browser local storage.
// JSON.stringify converts JavaScript data into text.
function saveData(key, value) {
    localStorage.setItem(
        key,
        JSON.stringify(value)
    );
}


/* =====================================================
   5. INITIAL APPLICATION DATA
   ===================================================== */

// Load the student's saved profile.
let profile = readData(
    STORAGE_KEYS.profile,
    {
        name: "",
        hours: 3
    }
);


// Load subjects. If none exist, use sample subjects.
let subjects = readData(
    STORAGE_KEYS.subjects,
    null
);

if (!Array.isArray(subjects)) {
    subjects = sampleSubjects.map(
        subject => ({ ...subject })
    );

    saveData(STORAGE_KEYS.subjects, subjects);
}


// Load tasks. If none exist, use sample tasks.
let tasks = readData(
    STORAGE_KEYS.tasks,
    null
);

if (!Array.isArray(tasks)) {
    tasks = sampleTasks.map(
        task => ({ ...task })
    );

    saveData(STORAGE_KEYS.tasks, tasks);
}


// These variables track the current application state.
let currentPage = "dashboard";

let currentFilter = "all";


/* =====================================================
   6. HELPER FUNCTIONS
   ===================================================== */

// Generate a unique ID for newly created subjects and tasks.
function generateId() {
    return Date.now() + Math.floor(Math.random() * 1000);
}


// Find a subject's name using its ID.
function getSubjectName(subjectId) {
    const subject = subjects.find(
        item => item.id === subjectId
    );

    return subject ? subject.name : "General study";
}


// Convert a date into a readable format.
function formatDate(dateString) {
    if (!dateString) {
        return "No deadline";
    }

    const date = new Date(dateString + "T00:00:00");

    if (Number.isNaN(date.getTime())) {
        return "No deadline";
    }

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );
}


// Calculate the percentage of completed tasks.
function calculateProgress() {
    if (tasks.length === 0) {
        return 0;
    }

    const completedTasks = tasks.filter(
        task => task.completed
    ).length;

    return Math.round(
        (completedTasks / tasks.length) * 100
    );
}


// Display a message after an action.
function showMessage(message) {
    alert(message);
}


/* =====================================================
   7. PAGE NAVIGATION
   ===================================================== */

// Display the selected page and hide the others.
function showPage(pageName) {

    const selectedPage = $("#page-" + pageName);

    if (!selectedPage) {
        return;
    }

    currentPage = pageName;

    // Activate the selected page.
    $$(".page").forEach(page => {
        page.classList.toggle(
            "active",
            page.id === "page-" + pageName
        );
    });

    // Highlight the selected navigation button.
    $$(".nav-link").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.page === pageName
        );
    });

    // Update the heading.
    const headings = {
        dashboard: "Dashboard",
        subjects: "My Subjects",
        tasks: "Study Tasks",
        planner: "AI Study Planner",
        doubts: "AI Doubt Solver",
        analytics: "Progress & Analytics",
        settings: "Settings"
    };

    $("#pageHeading").textContent =
        headings[pageName] || "StudyPilot AI";

    // Refresh application information.
    renderAll();
}


// Open the main application.
function openApp() {

    $("#welcomePage").classList.add("hidden");

    $("#setupPage").classList.add("hidden");

    $("#appShell").classList.remove("hidden");

    showPage("dashboard");
}


/* =====================================================
   8. PROFILE AND HEADER
   ===================================================== */

// Update the welcome message and profile information.
function renderProfile() {

    const name = profile.name || "Student";

    const initial = name
        .trim()
        .charAt(0)
        .toUpperCase() || "S";

    $("#sidebarName").textContent = name;

    $("#sidebarAvatar").textContent = initial;

    $("#dashboardGreeting").textContent =
        "Welcome back, " + name + "!";

    $("#todayLabel").textContent =
        new Date().toLocaleDateString(
            "en-IN",
            {
                weekday: "long",
                day: "numeric",
                month: "short"
            }
        );

    $("#settingsName").value = profile.name || "";

    $("#settingsHours").value =
        String(profile.hours || 3);
}


/* =====================================================
   9. DASHBOARD
   ===================================================== */

// Update the dashboard statistics.
function renderDashboard() {

    const completed = tasks.filter(
        task => task.completed
    ).length;

    const pending = tasks.length - completed;

    const progress = calculateProgress();


    // Update the four dashboard statistics.
    $("#subjectCount").textContent = subjects.length;

    $("#completedCount").textContent = completed;

    $("#studyHours").textContent =
        (profile.hours || 3) + "h";

    $("#completionRate").textContent =
        progress + "%";


    // Update the circular progress indicator.
    $("#progressPercentage").textContent =
        progress + "%";

    $("#progressRing").style.background =
        `conic-gradient(
            var(--green) ${progress}%,
            #203758 ${progress}%
        )`;


    // Update completed and remaining task counts.
    $("#progressCompleted").textContent = completed;

    $("#progressRemaining").textContent = pending;


    // Show priority tasks.
    const priorityContainer = $("#priorityTasks");

    const priorityTasks = tasks
        .filter(task => !task.completed)
        .sort((a, b) => {
            const order = {
                high: 1,
                medium: 2,
                low: 3
            };

            return order[a.priority] - order[b.priority];
        })
        .slice(0, 4);


    if (priorityTasks.length === 0) {

        priorityContainer.innerHTML =
            `<p class="muted">No pending tasks. Great work!</p>`;

    } else {

        priorityContainer.innerHTML =
            priorityTasks.map(task => `
                <div class="compact-task">
                    <div>
                        <strong>${escapeHTML(task.title)}</strong>
                        <small>${escapeHTML(getSubjectName(task.subjectId))}</small>
                    </div>
                    <span>${escapeHTML(task.priority)}</span>
                </div>
            `).join("");
    }


    // Display the student's subjects.
    $("#dashboardSubjects").innerHTML =
        subjects.map(subject => `
            <div class="compact-subject">
                <span>${escapeHTML(subject.name)}</span>
                <strong>${Number(subject.mastery) || 0}%</strong>
            </div>
        `).join("");


    // Display upcoming deadlines.
    const upcoming = tasks
        .filter(task => !task.completed && task.deadline)
        .sort((a, b) =>
            a.deadline.localeCompare(b.deadline)
        )
        .slice(0, 4);


    if (upcoming.length === 0) {

        $("#upcomingDeadlines").innerHTML =
            `<p class="muted">No upcoming deadlines.</p>`;

    } else {

        $("#upcomingDeadlines").innerHTML =
            upcoming.map(task => `
                <div class="deadline-item">
                    <strong>${escapeHTML(task.title)}</strong>
                    <small>${formatDate(task.deadline)}</small>
                </div>
            `).join("");
    }


    // Update the dashboard recommendation.
    if (pending === 0) {

        $("#dashboardRecommendation").textContent =
            "All your tasks are completed!";

        $("#recommendationDescription").textContent =
            "You can now plan your next learning goal.";

    } else {

        $("#dashboardRecommendation").textContent =
            "Focus on your highest-priority task.";

        $("#recommendationDescription").textContent =
            "Complete one important task at a time to maintain progress.";
    }
}
// ==========================================
// 1. HELPER FUNCTIONS
// ==========================================

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}


function getPriorityLabel(priority) {
    const labels = {
        high: "High",
        medium: "Medium",
        low: "Low"
    };

    return labels[priority] || "Medium";
}


function getTodayDate() {
    const today = new Date();
    return today.toISOString().split("T")[0];
}


// ==========================================
// 2. SUBJECT MANAGEMENT
// ==========================================

function renderSubjects() {
    const container = $("#subjectsGrid");
    const taskSubject = $("#taskSubject");

    if (!container) return;

    if (subjects.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No subjects added yet</h3>
                <p>Add your first subject to get started.</p>
            </div>
        `;
    } else {
        container.innerHTML = subjects.map(subject => {
            const subjectTasks = tasks.filter(
                task => task.subjectId === subject.id
            );

            const completedTasks = subjectTasks.filter(
                task => task.completed
            ).length;

            const progress = subjectTasks.length
                ? Math.round((completedTasks / subjectTasks.length) * 100)
                : 0;

            return `
                <article class="subject-card">
                    <div class="subject-card-header">
                        <span
                            class="subject-color"
                            style="background:${escapeHTML(subject.color)}">
                        </span>

                        <button
                            class="delete-subject"
                            data-delete-subject="${escapeHTML(subject.id)}"
                            aria-label="Delete subject">
                            ×
                        </button>
                    </div>

                    <h3>${escapeHTML(subject.name)}</h3>

                    <p>
                        ${subjectTasks.length} tasks
                        · ${completedTasks} completed
                    </p>

                    <div class="progress-track">
                        <div
                            class="progress-fill"
                            style="width:${progress}%">
                        </div>
                    </div>

                    <small>${progress}% completed</small>
                </article>
            `;
        }).join("");
    }

    if (taskSubject) {
        taskSubject.innerHTML = `
            <option value="">Select a subject</option>
            ${subjects.map(subject => `
                <option value="${escapeHTML(subject.id)}">
                    ${escapeHTML(subject.name)}
                </option>
            `).join("")}
        `;
    }
}


function openSubjectForm() {
    $("#subjectFormPanel")?.classList.remove("hidden");
}


function closeSubjectForm() {
    $("#subjectFormPanel")?.classList.add("hidden");
}


function addSubject(event) {
    event.preventDefault();

    const name = $("#subjectName")?.value.trim();
    const color = $("#subjectColor")?.value || "#8B5CF6";

    if (!name) {
        showMessage("Please enter a subject name.");
        return;
    }

    const alreadyExists = subjects.some(
        subject => subject.name.toLowerCase() === name.toLowerCase()
    );

    if (alreadyExists) {
        showMessage("This subject already exists.");
        return;
    }

    subjects.push({
        id: generateId(),
        name,
        color,
        mastery: 0
    });

    saveData();
    renderAll();

    $("#subjectForm")?.reset();
    closeSubjectForm();

    showMessage("Subject added successfully!");
}


function deleteSubject(subjectId) {
    const subjectTasks = tasks.filter(
        task => task.subjectId === subjectId
    );

    if (subjectTasks.length > 0) {
        showMessage("Delete its tasks before deleting this subject.");
        return;
    }

    subjects = subjects.filter(
        subject => subject.id !== subjectId
    );

    saveData();
    renderAll();

    showMessage("Subject deleted.");
}


// ==========================================
// 3. TASK MANAGEMENT
// ==========================================

function renderTasks() {
    const container = $("#tasksList");
    const countLabel = $("#taskCountLabel");

    if (!container) return;

    let filteredTasks = [...tasks];

    if (currentFilter === "active") {
        filteredTasks = filteredTasks.filter(task => !task.completed);
    }

    if (currentFilter === "completed") {
        filteredTasks = filteredTasks.filter(task => task.completed);
    }

    if (countLabel) {
        countLabel.textContent = `${filteredTasks.length} tasks`;
    }

    if (filteredTasks.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No tasks found</h3>
                <p>Add a task or change your filter.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filteredTasks.map(task => {
        const subject = subjects.find(
            item => item.id === task.subjectId
        );

        return `
            <article class="task-item ${task.completed ? "completed" : ""}">
                <div class="task-main">
                    <input
                        type="checkbox"
                        class="task-checkbox"
                        data-task-toggle="${escapeHTML(task.id)}"
                        ${task.completed ? "checked" : ""}
                    >

                    <div class="task-details">
                        <h3>${escapeHTML(task.title)}</h3>

                        <p>
                            ${escapeHTML(subject?.name || "No subject")}
                            · ${escapeHTML(formatDate(task.deadline))}
                        </p>
                    </div>
                </div>

                <div class="task-actions">
                    <span class="priority-tag priority-${escapeHTML(task.priority)}">
                        ${getPriorityLabel(task.priority)}
                    </span>

                    <button
                        class="delete-task"
                        data-delete-task="${escapeHTML(task.id)}"
                        aria-label="Delete task">
                        ×
                    </button>
                </div>
            </article>
        `;
    }).join("");
}


function openTaskForm() {
    if (subjects.length === 0) {
        showMessage("Please add a subject first.");
        return;
    }

    $("#taskFormPanel")?.classList.remove("hidden");

    const dateInput = $("#taskDate");

    if (dateInput && !dateInput.value) {
        dateInput.value = getTodayDate();
    }
}


function closeTaskForm() {
    $("#taskFormPanel")?.classList.add("hidden");
}


function addTask(event) {
    event.preventDefault();

    const title = $("#taskTitle")?.value.trim();
    const subjectId = $("#taskSubject")?.value;
    const deadline = $("#taskDate")?.value;
    const priority = $("#taskPriority")?.value || "medium";

    if (!title || !subjectId || !deadline) {
        showMessage("Please complete all task fields.");
        return;
    }

    tasks.push({
        id: generateId(),
        title,
        subjectId,
        deadline,
        priority,
        completed: false
    });

    saveData();
    renderAll();

    $("#taskForm")?.reset();
    closeTaskForm();

    showMessage("Task added successfully!");
}


function toggleTask(taskId) {
    tasks = tasks.map(task => {
        if (task.id === taskId) {
            return {
                ...task,
                completed: !task.completed
            };
        }

        return task;
    });

    saveData();
    renderAll();
}


function deleteTask(taskId) {
    tasks = tasks.filter(task => task.id !== taskId);

    saveData();
    renderAll();

    showMessage("Task deleted.");
}


// ==========================================
// 4. ANALYTICS
// ==========================================

function renderAnalytics() {
    const completed = tasks.filter(
        task => task.completed
    ).length;

    const total = tasks.length;

    const rate = total
        ? Math.round((completed / total) * 100)
        : 0;

    if ($("#analyticsCompleted")) {
        $("#analyticsCompleted").textContent = completed;
    }

    if ($("#analyticsSubjects")) {
        $("#analyticsSubjects").textContent = subjects.length;
    }

    if ($("#analyticsRate")) {
        $("#analyticsRate").textContent = `${rate}%`;
    }

    const subjectContainer = $("#analyticsSubjectsList");

    if (subjectContainer) {
        subjectContainer.innerHTML = subjects.map(subject => {
            const subjectTasks = tasks.filter(
                task => task.subjectId === subject.id
            );

            const done = subjectTasks.filter(
                task => task.completed
            ).length;

            const percentage = subjectTasks.length
                ? Math.round((done / subjectTasks.length) * 100)
                : 0;

            return `
                <div class="analytics-subject">
                    <div class="analytics-subject-heading">
                        <span>${escapeHTML(subject.name)}</span>
                        <span>${percentage}%</span>
                    </div>

                    <div class="progress-track">
                        <div
                            class="progress-fill"
                            style="width:${percentage}%">
                        </div>
                    </div>
                </div>
            `;
        }).join("");
    }

    const taskProgress = $("#analyticsTaskProgress");

    if (taskProgress) {
        taskProgress.innerHTML = `
            <p>${completed} of ${total} tasks completed</p>
            <div class="progress-track">
                <div
                    class="progress-fill"
                    style="width:${rate}%">
                </div>
            </div>
        `;
    }
}


// ==========================================
// 5. AI API CONNECTION
// ==========================================

async function requestStudyPilotAI(endpoint, payload) {
    try {
        const response = await fetch(endpoint, {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "AI request failed.");
        }

        return data;

    } catch (error) {
        console.error("StudyPilot AI Error:", error);

        throw error;
    }
}


// ==========================================
// 6. AI STUDY PLANNER
// ==========================================

async function generateStudyPlan() {
    const goal = $("#plannerGoal")?.value.trim();
    const availableTime = $("#plannerTime")?.value;
    const focus = $("#plannerFocus")?.value;

    const resultContainer = $("#plannerSummary");
    const button = $("#generateAIPlanButton");

    if (!goal) {
        showMessage("Please enter your study goal.");
        return;
    }

    if (!resultContainer) return;

    if (button) {
        button.disabled = true;
        button.textContent = "Generating...";
    }

    resultContainer.innerHTML = `
        <p>StudyPilot AI is preparing your study plan...</p>
    `;

    try {
        const result = await requestStudyPilotAI("/api/plan", {
            goal,
            availableTime,
            focus,
            subjects: subjects.map(subject => subject.name),
            tasks: tasks.filter(task => !task.completed).map(task => ({
                title: task.title,
                subject: getSubjectName(task.subjectId),
                deadline: task.deadline,
                priority: task.priority
            }))
        });

        resultContainer.innerHTML = `
            <div class="ai-plan-result">
                <h3>Your Personalized Study Plan</h3>
                <div>${escapeHTML(result.plan || "No plan was returned.")}</div>
            </div>
        `;

    } catch (error) {
        resultContainer.innerHTML = `
            <div class="ai-error">
                <h3>Unable to connect to AI</h3>
                <p>${escapeHTML(error.message)}</p>
                <p>Please check that the StudyPilot server is running.</p>
            </div>
        `;

    } finally {
        if (button) {
            button.disabled = false;
            button.textContent = "Generate AI Plan";
        }
    }
}


// ==========================================
// 7. AI DOUBT SOLVER
// ==========================================

function addChatMessage(message, sender) {
    const container = $("#chatMessages");

    if (!container) return;

    const messageElement = document.createElement("div");

    messageElement.className =
        `chat-message ${sender === "user" ? "user-message" : "assistant-message"}`;

    const avatar = sender === "user" ? "You" : "AI";

    messageElement.innerHTML = `
        <div class="chat-avatar">${avatar}</div>

        <div class="message-content">
            ${escapeHTML(message).replace(/\n/g, "<br>")}
        </div>
    `;

    container.appendChild(messageElement);

    container.scrollTop = container.scrollHeight;
}


async function sendDoubt(event) {
    event.preventDefault();

    const input = $("#chatInput");
    const subjectSelect = $("#doubtSubject");

    const question = input?.value.trim();
    const subject = subjectSelect?.value || "General";

    if (!question) return;

    addChatMessage(question, "user");

    input.value = "";

    const sendButton = $("#sendChatButton");

    if (sendButton) {
        sendButton.disabled = true;
    }

    try {
        const result = await requestStudyPilotAI("/api/ask", {
            question,
            subject
        });

        addChatMessage(
            result.answer || "I could not generate an answer.",
            "assistant"
        );

    } catch (error) {
        addChatMessage(
            "Sorry, I could not connect to the AI service. Please try again later.",
            "assistant"
        );

        console.error(error);

    } finally {
        if (sendButton) {
            sendButton.disabled = false;
        }

        input?.focus();
    }
}


function clearChat() {
    const container = $("#chatMessages");

    if (!container) return;

    container.innerHTML = `
        <div class="chat-message assistant-message">
            <div class="chat-avatar">AI</div>

            <div class="message-content">
                Hello! I'm your StudyPilot AI assistant.
                Ask me anything about your subjects.
            </div>
        </div>
    `;
}


// ==========================================
// 8. SETTINGS
// ==========================================

function loadSettings() {
    const nameInput = $("#settingsName");
    const hoursInput = $("#settingsHours");

    if (nameInput) {
        nameInput.value = profile.name || "";
    }

    if (hoursInput) {
        hoursInput.value = profile.studyHours || 3;
    }
}


function saveSettings(event) {
    event.preventDefault();

    const name = $("#settingsName")?.value.trim();
    const studyHours = Number($("#settingsHours")?.value);

    if (!name) {
        showMessage("Please enter your name.");
        return;
    }

    profile = {
        ...profile,
        name,
        studyHours
    };

    saveData();
    renderAll();

    showMessage("Settings saved successfully!");
}


function resetApplication() {
    const confirmed = confirm(
        "Are you sure you want to reset all StudyPilot data?"
    );

    if (!confirmed) return;

    localStorage.removeItem(STORAGE_KEYS.profile);
    localStorage.removeItem(STORAGE_KEYS.subjects);
    localStorage.removeItem(STORAGE_KEYS.tasks);

    location.reload();
}


// ==========================================
// 9. RENDER ALL SECTIONS
// ==========================================

function renderAll() {
    renderProfile();
    renderDashboard();
    renderSubjects();
    renderTasks();
    renderAnalytics();
    loadSettings();
}


// ==========================================
// 10. EVENT LISTENERS
// ==========================================

function setupEventListeners() {

    // Navigation
    $$("[data-page]").forEach(button => {
        button.addEventListener("click", () => {
            showPage(button.dataset.page);
        });
    });
// Get Started button
$("#getStartedButton")?.addEventListener("click", openApp);

    // Subject form
    $("#addSubjectButton")?.addEventListener(
        "click",
        openSubjectForm
    );

    $("#closeSubjectForm")?.addEventListener(
        "click",
        closeSubjectForm
    );

    $("#subjectForm")?.addEventListener(
        "submit",
        addSubject
    );


    // Task form
    $("#addTaskButton")?.addEventListener(
        "click",
        openTaskForm
    );

    $("#closeTaskForm")?.addEventListener(
        "click",
        closeTaskForm
    );

    $("#taskForm")?.addEventListener(
        "submit",
        addTask
    );


    // Task filters
    $("#taskFilters")?.addEventListener("click", event => {
        const button = event.target.closest("[data-filter]");

        if (!button) return;

        currentFilter = button.dataset.filter;

        $$("#taskFilters [data-filter]").forEach(item => {
            item.classList.toggle("active", item === button);
        });

        renderTasks();
    });


    // Subject and task actions
    document.addEventListener("click", event => {
        const deleteSubjectButton = event.target.closest(
            "[data-delete-subject]"
        );

        if (deleteSubjectButton) {
            deleteSubject(deleteSubjectButton.dataset.deleteSubject);
        }

        const deleteTaskButton = event.target.closest(
            "[data-delete-task]"
        );

        if (deleteTaskButton) {
            deleteTask(deleteTaskButton.dataset.deleteTask);
        }
    });


    // Task completion
    document.addEventListener("change", event => {
        const checkbox = event.target.closest("[data-task-toggle]");

        if (checkbox) {
            toggleTask(checkbox.dataset.taskToggle);
        }
    });


    // AI Planner
    $("#generateAIPlanButton")?.addEventListener(
        "click",
        generateStudyPlan
    );


    // AI Doubt Solver
    $("#chatForm")?.addEventListener(
        "submit",
        sendDoubt
    );

    $("#clearChatButton")?.addEventListener(
        "click",
        clearChat
    );


    // Settings
    $("#settingsForm")?.addEventListener(
        "submit",
        saveSettings
    );

    $("#resetDataButton")?.addEventListener(
        "click",
        resetApplication
    );
}


// ==========================================
// 11. APPLICATION INITIALIZATION
// ==========================================

function initializeApp() {
    setupEventListeners();

    renderAll();

    // Start with the dashboard
    showPage("dashboard");

    console.log("StudyPilot AI initialized successfully!");
}


// Start the application
initializeApp();