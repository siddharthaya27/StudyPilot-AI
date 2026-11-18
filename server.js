
const express = require("express");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: "1mb" }));
app.use(express.static(__dirname));

// Initialize OpenAI
async function startServer() {
    if (!process.env.GROQ_API_KEY) {
        console.error("GROQ_API_KEY is missing from .env");
        process.exit(1);
    }

  const OpenAI = (await import("openai")).default;

    const ai = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1"
});

    const MODEL = "openai/gpt-oss-20b";

    // Serve StudyPilot AI
    app.get("/", (req, res) => {
        res.sendFile(
            path.join(__dirname, "StudypilotAi.html")
        );
    });

    // AI Study Planner
    app.post("/api/plan", async (req, res) => {
        try {
            const {
                goal,
                availableTime,
                focus,
                subjects,
                tasks
            } = req.body;

            if (!goal || typeof goal !== "string") {
                return res.status(400).json({
                    error: "Please provide a valid study goal."
                });
            }

            const response = await ai.responses.create({
                model: MODEL,

                instructions: `
You are StudyPilot AI, a helpful academic study planner.

Create realistic study plans for college students.
Use simple language and clear headings.
Prioritize urgent tasks.
Divide available time into manageable sessions.
Include short breaks.
Never invent deadlines or academic information.
`,

                input: `
Study goal: ${goal}

Available study time: ${availableTime || "Not specified"}

Focus area: ${focus || "General study"}

Subjects:
${JSON.stringify(subjects || [])}

Pending tasks:
${JSON.stringify(tasks || [])}
`
            });

            res.json({
                plan: response.output_text ||
                    "No study plan was generated."
            });

        } catch (error) {
            console.error("Study plan error:", error);

            res.status(500).json({
                error: "Unable to generate a study plan."
            });
        }
    });

    // AI Doubt Solver
    app.post("/api/ask", async (req, res) => {
        try {
            const { question, subject } = req.body;

            if (!question || typeof question !== "string") {
                return res.status(400).json({
                    error: "Please enter a valid question."
                });
            }

            const response = await ai.responses.create({
                model: MODEL,

                instructions: `
You are StudyPilot AI, a friendly academic tutor.

Explain concepts in simple language.
Assume the student is a first-year college student.
Break difficult concepts into smaller steps.
Use examples where helpful.
For programming questions, explain the logic.
Keep answers educational and easy to understand.
`,

                input: `
Subject: ${subject || "General"}

Student question:
${question}
`
            });

            res.json({
                answer: response.output_text ||
                    "I could not generate an answer."
            });

        } catch (error) {
            console.error("Doubt solver error:", error);

            res.status(500).json({
                error: "Unable to answer your question. Please try again."
            });
        }
    });

    // Start server
   app.listen(PORT, "0.0.0.0", () => {
        console.log("--------------------------------");
        console.log("StudyPilot AI server is running");
        console.log(`Open: http://localhost:${PORT}`);
        console.log("--------------------------------");
    });
}

startServer().catch(error => {
    console.error("Server startup failed:", error);
    process.exit(1);
});
