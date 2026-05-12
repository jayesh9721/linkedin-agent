import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";

const app = express();
const port = process.env.PORT || 3001;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.resolve(__dirname, "../dist");
const generateDraftWebhook = process.env.N8N_GENERATE_DRAFT_WEBHOOK;

app.use(express.json());

const analytics = {
  dateRange: "May 01 - May 05, 2026",
  metrics: [
    { label: "Impressions", value: "128.4K", change: "18.6", tone: "blue" },
    { label: "Engagements", value: "8.7K", change: "24.3", tone: "green" },
    { label: "Engagement Rate", value: "6.79%", change: "11.2", tone: "violet" },
    { label: "Profile Views", value: "2.3K", change: "15.7", tone: "orange" }
  ],
  timeline: [
    { day: "Apr 29", impressions: 17000, rate: 4.1, posts: 2 },
    { day: "Apr 30", impressions: 24500, rate: 5.9, posts: 3 },
    { day: "May 1", impressions: 39800, rate: 7.7, posts: 4 },
    { day: "May 2", impressions: 28200, rate: 5.5, posts: 5 },
    { day: "May 3", impressions: 31600, rate: 6.4, posts: 3 },
    { day: "May 4", impressions: 24600, rate: 4.6, posts: 2 },
    { day: "May 5", impressions: 30900, rate: 8.8, posts: 1 }
  ]
};

const posts = [
  {
    id: 1,
    title: "How AI is transforming the way businesses operate in 2026",
    excerpt: "Artificial intelligence is no longer...",
    date: "May 05, 2026",
    time: "10:30 AM",
    status: "Published",
    impressions: "2.1K",
    likes: "231",
    comments: "48",
    rate: "6.2%",
    art: "ai"
  },
  {
    id: 2,
    title: "5 Productivity hacks that changed our workflow",
    excerpt: "Small changes can lead to big...",
    date: "May 04, 2026",
    time: "09:15 AM",
    status: "Published",
    impressions: "1.8K",
    likes: "187",
    comments: "36",
    rate: "5.9%",
    art: "idea"
  },
  {
    id: 3,
    title: "A simple strategy that increased our ROI by 300%",
    excerpt: "Here's the strategy we used to...",
    date: "May 03, 2026",
    time: "11:45 AM",
    status: "Published",
    impressions: "2.4K",
    likes: "251",
    comments: "52",
    rate: "6.8%",
    art: "growth"
  },
  {
    id: 4,
    title: "Why your team alignment is important for growth",
    excerpt: "When your team is aligned,...",
    date: "May 02, 2026",
    time: "01:20 PM",
    status: "Published",
    impressions: "1.2K",
    likes: "128",
    comments: "29",
    rate: "5.1%",
    art: "team"
  },
  {
    id: 5,
    title: "Set goals that inspire you to take action every day",
    excerpt: "Goal setting is the first step...",
    date: "May 01, 2026",
    time: "08:50 AM",
    status: "Published",
    impressions: "1.6K",
    likes: "164",
    comments: "41",
    rate: "6.4%",
    art: "target"
  },
  {
    id: 6,
    title: "How we plan our content calendar for maximum impact",
    excerpt: "A well-planned content calendar...",
    date: "May 06, 2026",
    time: "10:00 AM",
    status: "Scheduled",
    impressions: "-",
    likes: "-",
    comments: "-",
    rate: "-",
    art: "calendar"
  },
  {
    id: 7,
    title: "The future of work is here - are you ready?",
    excerpt: "The way we work is changing...",
    date: "-",
    time: "",
    status: "Draft",
    impressions: "-",
    likes: "-",
    comments: "-",
    rate: "-",
    art: "future"
  },
  {
    id: 8,
    title: "Content marketing mistakes to avoid in 2026",
    excerpt: "Avoid these common mistakes...",
    date: "May 01, 2026",
    time: "07:30 AM",
    status: "Failed",
    impressions: "-",
    likes: "-",
    comments: "-",
    rate: "-",
    art: "alert"
  }
];

const profile = {
  companyName: "Acme Corp",
  industry: "Technology",
  website: "https://acmecorp.com",
  brandTone: "Professional",
  targetAudience: "Business Owners, Marketers, Entrepreneurs",
  services: ["AI Automation", "Analytics", "Growth Strategy"],
  description: "Acme Corp is a technology company focused on building AI-powered solutions that help businesses grow and operate efficiently.",
  linkedInPage: "https://www.linkedin.com/company/acmecorp",
  linkedInProfile: "https://www.linkedin.com/company/acmecorp/admin",
  tokenExpires: "May 20, 2026, 11:59 PM",
  permissions: ["Read Analytics", "Create Posts"]
};

app.get("/api/analytics", (_req, res) => res.json(analytics));
app.get("/api/posts", (_req, res) => res.json(posts));
app.get("/api/profile", (_req, res) => res.json(profile));
app.post("/api/generate-draft", async (req, res) => {
  const prompt = String(req.body?.prompt || "").trim();

  if (!prompt) {
    return res.status(400).json({ error: "Please enter text before generating a draft." });
  }

  try {
    if (!generateDraftWebhook) {
      return res.status(500).json({ error: "Missing N8N_GENERATE_DRAFT_WEBHOOK in .env." });
    }

    const webhookResponse = await fetch(generateDraftWebhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, text: prompt })
    });

    const contentType = webhookResponse.headers.get("content-type") || "";
    const payload = contentType.includes("application/json")
      ? await webhookResponse.json()
      : await webhookResponse.text();

    if (!webhookResponse.ok) {
      return res.status(webhookResponse.status).json({
        error: "The n8n workflow returned an error.",
        details: payload
      });
    }

    res.json({ result: payload, text: extractResponseText(payload) });
  } catch (error) {
    res.status(502).json({
      error: "Unable to reach the n8n workflow.",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

function extractResponseText(value) {
  if (typeof value === "string") return value;
  if (!value) return "";

  if (Array.isArray(value)) {
    return value
      .map((item) => extractResponseText(item))
      .filter(Boolean)
      .join("\n\n");
  }

  if (typeof value === "object") {
    const textKeys = ["output", "draft", "result", "text", "message", "content", "response"];
    for (const key of textKeys) {
      if (typeof value[key] === "string") return value[key];
    }

    for (const nestedValue of Object.values(value)) {
      const nestedText = extractResponseText(nestedValue);
      if (nestedText) return nestedText;
    }

    return JSON.stringify(value, null, 2);
  }

  return String(value);
}

app.use(express.static(distPath));
app.get("*", (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

export default app;

if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log(`LinkedIn Growth Agent running on http://localhost:${port}`);
  });
}
