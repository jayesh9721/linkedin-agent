import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BarChart3,
  Bot,
  Brain,
  BriefcaseBusiness,
  Building2,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Eye,
  FileText,
  Filter,
  Gauge,
  Globe,
  ImagePlus,
  LineChart,
  Linkedin,
  LogOut,
  Mail,
  MessageCircle,
  MoreVertical,
  PencilLine,
  Plus,
  Send,
  SquarePen,
  ThumbsUp,
  TrendingUp,
  Upload,
  User,
  Wand2
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart as ReLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { supabase } from "./supabaseClient";
import "./styles.css";

const api = {
  analytics: "/api/analytics",
  posts: "/api/posts",
  profile: "/api/profile"
};

const fallbackAnalytics = {
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

const fallbackProfile = {
  companyName: "Acme Corp",
  brandTone: "Professional",
  industry: "Technology",
  targetAudience: "Business Owners, Marketers, Entrepreneurs",
  website: "https://acmecorp.com",
  services: ["AI Automation", "Analytics", "Growth Strategy"],
  description: "Acme Corp is a technology company focused on building AI-powered solutions that help businesses grow and operate efficiently.",
  linkedInProfile: "https://www.linkedin.com/company/acmecorp/admin"
};

const fallbackPosts = [
  { id: 1, title: "How AI is transforming the way businesses operate in 2026", excerpt: "Artificial intelligence is no longer...", date: "May 05, 2026", time: "10:30 AM", status: "Published", impressions: "2.1K", likes: "231", comments: "48", rate: "6.2%", art: "ai" },
  { id: 2, title: "5 Productivity hacks that changed our workflow", excerpt: "Small changes can lead to big...", date: "May 04, 2026", time: "09:15 AM", status: "Published", impressions: "1.8K", likes: "187", comments: "36", rate: "5.9%", art: "idea" },
  { id: 3, title: "A simple strategy that increased our ROI by 300%", excerpt: "Here's the strategy we used to...", date: "May 03, 2026", time: "11:45 AM", status: "Published", impressions: "2.4K", likes: "251", comments: "52", rate: "6.8%", art: "growth" },
  { id: 4, title: "Why your team alignment is important for growth", excerpt: "When your team is aligned,...", date: "May 02, 2026", time: "01:20 PM", status: "Published", impressions: "1.2K", likes: "128", comments: "29", rate: "5.1%", art: "team" },
  { id: 5, title: "Set goals that inspire you to take action every day", excerpt: "Goal setting is the first step...", date: "May 01, 2026", time: "08:50 AM", status: "Published", impressions: "1.6K", likes: "164", comments: "41", rate: "6.4%", art: "target" },
  { id: 6, title: "How we plan our content calendar for maximum impact", excerpt: "A well-planned content calendar...", date: "May 06, 2026", time: "10:00 AM", status: "Scheduled", impressions: "-", likes: "-", comments: "-", rate: "-", art: "calendar" },
  { id: 7, title: "The future of work is here - are you ready?", excerpt: "The way we work is changing...", date: "-", time: "", status: "Draft", impressions: "-", likes: "-", comments: "-", rate: "-", art: "future" },
  { id: 8, title: "Content marketing mistakes to avoid in 2026", excerpt: "Avoid these common mistakes...", date: "May 01, 2026", time: "07:30 AM", status: "Failed", impressions: "-", likes: "-", comments: "-", rate: "-", art: "alert" }
];

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: Gauge },
  { id: "profile", label: "Profile", icon: User },
  { id: "content", label: "Content Generation", icon: PencilLine },
  { id: "posts", label: "Posts", icon: FileText }
];

const metricIcons = {
  Impressions: Eye,
  Engagements: ThumbsUp,
  "Engagement Rate": MessageCircle,
  "Profile Views": Send
};

const artStyles = {
  ai: ["AI", "art-blue"],
  idea: ["💡", "art-dark"],
  growth: ["↗", "art-growth"],
  team: ["", "art-team"],
  target: ["◎", "art-target"],
  calendar: ["▦", "art-calendar"],
  future: ["✦", "art-paper"],
  alert: ["!", "art-alert"]
};

function computeAnalytics(rawPosts) {
  if (rawPosts.length === 0) return fallbackAnalytics;

  const totalImpressions = rawPosts.reduce((s, p) => s + (p.impressions || 0), 0);
  const totalLikes = rawPosts.reduce((s, p) => s + (p.likes || 0), 0);
  const totalComments = rawPosts.reduce((s, p) => s + (p.comments || 0), 0);
  const totalEngagements = totalLikes + totalComments;

  const published = rawPosts.filter((p) => p.status === "Published");
  const avgRate = published.length > 0
    ? (published.reduce((s, p) => s + (p.engagement_rate || 0), 0) / published.length).toFixed(2)
    : "0.00";

  const byDate = {};
  rawPosts.forEach((p) => {
    if (!p.post_date) return;
    const day = new Date(`${p.post_date}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (!byDate[day]) byDate[day] = { day, impressions: 0, rateSum: 0, posts: 0 };
    byDate[day].impressions += p.impressions || 0;
    byDate[day].rateSum += p.engagement_rate || 0;
    byDate[day].posts += 1;
  });
  const timeline = Object.values(byDate)
    .map((d) => ({ day: d.day, impressions: d.impressions, rate: parseFloat((d.rateSum / d.posts).toFixed(2)), posts: d.posts }))
    .sort((a, b) => new Date(`${a.day}, 2026`) - new Date(`${b.day}, 2026`));

  const dateRange = timeline.length >= 2
    ? `${timeline[0].day} - ${timeline[timeline.length - 1].day}`
    : timeline.length === 1 ? timeline[0].day : "All Time";

  return {
    dateRange,
    metrics: [
      { label: "Impressions", value: formatMetric(totalImpressions), tone: "blue" },
      { label: "Engagements", value: formatMetric(totalEngagements), tone: "green" },
      { label: "Engagement Rate", value: `${avgRate}%`, tone: "violet" },
      { label: "Profile Views", value: "—", tone: "orange" }
    ],
    timeline: timeline.length > 0 ? timeline : fallbackAnalytics.timeline
  };
}

function normalizePosts(rawPosts) {
  return rawPosts.map((p) => ({
    ...p,
    art: statusToArt(p.status),
    excerpt: p.short_description || "",
    date: p.post_date ? new Date(`${p.post_date}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "-",
    time: p.post_time || "",
    impressions: formatMetric(p.impressions),
    likes: formatMetric(p.likes),
    comments: formatMetric(p.comments),
    rate: p.engagement_rate != null ? `${p.engagement_rate}%` : "-"
  }));
}

function App() {
  const [active, setActive] = useState("dashboard");
  const [profile, setProfile] = useApi(api.profile, fallbackProfile);
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [rawPosts, setRawPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState(null);

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthLoading(false);
    });

    return () => { listener.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!supabase || !session) return;
    setPostsLoading(true);
    setPostsError(null);
    supabase
      .from("linkedin_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) setPostsError(error.message);
        else setRawPosts(data || []);
        setPostsLoading(false);
      });
  }, [session?.user?.id]);

  const posts = useMemo(() => normalizePosts(rawPosts), [rawPosts]);
  const analytics = useMemo(() => computeAnalytics(rawPosts), [rawPosts]);

  async function handleSignOut() {
    await supabase?.auth.signOut();
    setActive("dashboard");
  }

  if (authLoading) {
    return <div className="auth-loading">Loading...</div>;
  }

  if (!session) {
    return <AuthPage />;
  }

  return (
    <div className="app-shell">
      <Sidebar active={active} onChange={setActive} user={session.user} onSignOut={handleSignOut} />
      <main className="main">
        {active === "dashboard" && <Dashboard analytics={analytics} posts={posts} />}
        {active === "profile" && profile && <Profile profile={profile} user={session.user} />}
        {active === "posts" && <Posts posts={posts} loading={postsLoading} error={postsError} />}
        {active === "content" && <ContentGeneration user={session.user} />}
      </main>
    </div>
  );
}

function useApi(url, fallback) {
  const [data, setData] = useState(fallback);

  useEffect(() => {
    let mounted = true;
    fetch(url)
      .then((response) => (response.ok ? response.json() : fallback))
      .then((payload) => mounted && setData(payload))
      .catch(() => mounted && setData(fallback));
    return () => {
      mounted = false;
    };
  }, [url]);

  return [data, setData];
}

function AuthPage() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    if (!supabase) {
      setMessage("Supabase env values are missing.");
      return;
    }

    setIsSubmitting(true);
    const authRequest = mode === "login"
      ? supabase.auth.signInWithPassword({ email, password })
      : supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName || email } }
      });

    const { error } = await authRequest;
    setIsSubmitting(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    if (mode === "signup") {
      setMessage("Account created. Check your email if confirmation is enabled, then sign in.");
      setMode("login");
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="brand auth-brand">
          <div className="brand-mark">
            <TrendingUp size={28} strokeWidth={3} />
          </div>
          <div>
            <strong>LinkedIn Growth</strong>
            <span>Agent</span>
          </div>
        </div>

        <h1>{mode === "login" ? "Welcome back" : "Create your account"}</h1>
        <p>{mode === "login" ? "Sign in to manage your LinkedIn growth workspace." : "Sign up to start saving your company profile."}</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <label>
              <span>Name</span>
              <input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="John Doe" />
            </label>
          )}
          <label>
            <span>Email</span>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" required />
          </label>
          <label>
            <span>Password</span>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Minimum 6 characters" required minLength={6} />
          </label>
          <button className="primary-button" type="submit" disabled={isSubmitting}>
            <Mail size={18} />
            {isSubmitting ? "Please wait..." : mode === "login" ? "Sign In" : "Sign Up"}
          </button>
        </form>

        {message && <p className="auth-message">{message}</p>}

        <button className="auth-switch" type="button" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
          {mode === "login" ? "Create an account" : "Already have an account? Sign in"}
        </button>
      </section>
    </main>
  );
}

function Sidebar({ active, onChange, user, onSignOut }) {
  const displayName = user?.user_metadata?.full_name || user?.email || "User";
  const initials = displayName
    .split(/[ @.]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">
          <TrendingUp size={28} strokeWidth={3} />
        </div>
        <div>
          <strong>LinkedIn Growth</strong>
          <span>Agent</span>
        </div>
      </div>

      <nav className="nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              className={`nav-item ${active === item.id ? "active" : ""}`}
              key={item.id}
              onClick={() => onChange(item.id)}
              type="button"
            >
              <Icon size={22} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <button className="account" type="button" onClick={onSignOut}>
        <span className="avatar">{initials}</span>
        <span>
          <strong>{displayName}</strong>
          <small>Sign out</small>
        </span>
        <LogOut size={18} />
      </button>
    </aside>
  );
}

function PageHeader({ icon: Icon, title, subtitle, action, hideDatePicker = false }) {
  return (
    <header className="page-header">
      <div>
        <div className="title-line">
          <h1>
            {Icon && <Icon size={30} />}
            {title}
          </h1>
          {action}
        </div>
        <p>{subtitle}</p>
      </div>
      {!hideDatePicker && (
        <button className="date-picker" type="button">
          <Calendar size={20} />
          May 01 - May 05, 2026
          <ChevronDown size={18} />
        </button>
      )}
    </header>
  );
}

function Dashboard({ analytics, posts }) {
  const publishedPosts = posts.filter((post) => post.status === "Published");
  const topPosts = [...publishedPosts].sort((a, b) => Number.parseFloat(b.engagement_rate) - Number.parseFloat(a.engagement_rate));

  return (
    <section>
      <PageHeader title="Dashboard" subtitle="Overview of your LinkedIn growth performance" />

      <div className="metrics-grid">
        {analytics.metrics.map((metric) => (
          <MetricCard metric={metric} key={metric.label} />
        ))}
      </div>

      <div className="chart-grid">
        <Panel title="Impressions Over Time" className="chart-panel">
          <ResponsiveContainer width="100%" height={220}>
            <ReLineChart data={analytics.timeline} margin={{ top: 14, right: 14, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#d9e1ee" />
              <XAxis dataKey="day" axisLine={{ stroke: "#d8e0ec" }} tickLine={false} tick={{ fill: "#17213a", fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#17213a", fontSize: 12 }} tickFormatter={(value) => (value === 0 ? "0" : `${value / 1000}K`)} />
              <Tooltip formatter={(value) => [`${Math.round(value / 1000)}K`, "Impressions"]} />
              <Line type="monotone" dataKey="impressions" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 5, fill: "#2563eb" }} activeDot={{ r: 6 }} />
            </ReLineChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Engagement Rate Over Time" className="chart-panel">
          <ResponsiveContainer width="100%" height={220}>
            <ReLineChart data={analytics.timeline} margin={{ top: 14, right: 14, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#d9e1ee" />
              <XAxis dataKey="day" axisLine={{ stroke: "#d8e0ec" }} tickLine={false} tick={{ fill: "#17213a", fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#17213a", fontSize: 12 }} tickFormatter={(value) => `${value}%`} ticks={[0, 3, 6, 9, 12]} />
              <Tooltip formatter={(value) => [`${value}%`, "Rate"]} />
              <Line type="monotone" dataKey="rate" stroke="#16a34a" strokeWidth={2.5} dot={{ r: 5, fill: "#16a34a" }} activeDot={{ r: 6 }} />
            </ReLineChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <div className="dashboard-bottom">
        <Panel title="Posting Frequency">
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={analytics.timeline.map((point) => ({ ...point, day: point.day.replace("Apr 29", "Mon").replace("Apr 30", "Tue").replace("May 1", "Wed").replace("May 2", "Thu").replace("May 3", "Fri").replace("May 4", "Sat").replace("May 5", "Sun") }))}>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#d9e1ee" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#17213a", fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} ticks={[0, 2, 4, 6]} tick={{ fill: "#17213a", fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="posts" radius={[3, 3, 0, 0]} fill="#2563eb" barSize={22} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Recent Posts">
          <MiniTable posts={posts.slice(0, 5)} mode="recent" />
        </Panel>

        <Panel title="Top Performing Posts">
          <MiniTable posts={topPosts.slice(0, 5)} mode="top" />
        </Panel>
      </div>
    </section>
  );
}

function MetricCard({ metric }) {
  const Icon = metricIcons[metric.label];
  return (
    <article className="metric-card">
      <div className={`metric-icon ${metric.tone}`}>
        <Icon size={34} />
      </div>
      <div>
        <p>{metric.label}</p>
        <strong>{metric.value}</strong>
        {metric.change != null && <span>↑ {metric.change}%</span>}
      </div>
    </article>
  );
}

function Panel({ title, children, className = "" }) {
  return (
    <article className={`panel ${className}`}>
      <h2>{title}</h2>
      {children}
    </article>
  );
}

function PostArt({ type, small = false }) {
  const [text, className] = artStyles[type] || artStyles.ai;
  return <div className={`post-art ${className} ${small ? "small" : ""}`}>{text}</div>;
}

function MiniTable({ posts, mode }) {
  return (
    <div className="mini-table">
      <div className="mini-row mini-head">
        <span>Post</span>
        {mode === "recent" ? (
          <>
            <span>Date</span>
            <span>Impressions</span>
            <span>Comments</span>
          </>
        ) : (
          <>
            <span>Impressions</span>
            <span>Engagement Rate</span>
          </>
        )}
      </div>
      {posts.map((post) => (
        <div className="mini-row" key={`${mode}-${post.id}`}>
          <span className="mini-post">
            <PostArt type={post.art} small />
            <b>{post.title}</b>
          </span>
          {mode === "recent" ? (
            <>
              <span>{post.date}</span>
              <span>{post.impressions}</span>
              <span>{post.comments}</span>
            </>
          ) : (
            <>
              <span>{post.impressions}</span>
              <span className="green-text">{post.rate}</span>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

function Profile({ profile, user }) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(() => ({
    ...profile,
    servicesText: Array.isArray(profile?.services) ? profile.services.join(", ") : "",
    logoText: "ACME CORP",
    coverImageUrl: "",
    brandColorsText: "#2563EB, #0F172A, #E2E8F0",
    writingStyle: "Clear, concise, and value-driven",
    memoryBrandTone: "Professional, Trustworthy, Helpful",
    preferredCtaStyle: "Action-oriented and benefit-focused",
    keywords: Array.isArray(profile?.keywords) ? profile.keywords.join(", ") : "AI, Automation, Growth, Productivity, Efficiency",
    competitors: Array.isArray(profile?.competitors) ? profile.competitors.join(", ") : "HubSpot, Salesforce, Zoho, Pipedrive"
  }));
  const [profileRowId, setProfileRowId] = useState(null);
  const [saveStatus, setSaveStatus] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      if (!supabase) {
        setSaveStatus("Supabase env values are missing.");
        return;
      }

      const { data, error } = await supabase
        .from("linkedin_profiles")
        .select(`
          id,
          company_name,
          brand_tone,
          industry,
          target_audience,
          website,
          services,
          company_description,
          writing_style,
          memory_brand_tone,
          preferred_cta_style,
          keywords,
          competitors,
          logo_text,
          cover_image_url,
          brand_colors,
          linkedin_profile_url
        `)
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!mounted) return;

      if (error) {
        setSaveStatus(`Supabase load failed: ${error.message}`);
        return;
      }

      if (data) {
        setProfileRowId(data.id);
        setForm((current) => ({ ...current, ...profileRowToForm(data) }));
      }
    }

    loadProfile();
    return () => {
      mounted = false;
    };
  }, [user.id]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleProfileAction() {
    if (!isEditing) {
      setSaveStatus("");
      setIsEditing(true);
      return;
    }

    if (!supabase) {
      setSaveStatus("Supabase env values are missing.");
      return;
    }

    setSaveStatus("Saving...");
    const payload = { ...formToProfileRow(form), user_id: user.id };
    
    const { data, error } = await supabase
      .from("linkedin_profiles")
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      setSaveStatus(`Save failed: ${error.message}`);
      return;
    }

    setProfileRowId(data.id);
    setForm((current) => ({ ...current, ...profileRowToForm(data) }));
    setIsEditing(false);
    setSaveStatus("Saved to Supabase.");
  }

  const services = splitList(form.servicesText);
  const permissions = splitList(form.permissionsText);
  const brandColors = splitList(form.brandColorsText);

  return (
    <section>
      <PageHeader
        icon={User}
        title="Profile"
        subtitle="Manage your company information and LinkedIn connection"
        action={
          <button
            className={isEditing ? "primary-button compact-action" : "outline-button compact-action"}
            type="button"
            onClick={handleProfileAction}
          >
            {isEditing ? <CircleCheck size={16} /> : <SquarePen size={16} />}
            {isEditing ? "Save" : "Edit"}
          </button>
        }
      />
      {saveStatus && <p className="profile-status">{saveStatus}</p>}

      <div className="profile-grid">
        <Panel title="">
          <SectionTitle icon={Building2} title="Company Information" />
          <div className="form-grid">
            <Field label="Company Name" value={form.companyName} disabled={!isEditing} onChange={(value) => updateField("companyName", value)} />
            <SelectField label="Brand Tone" value={form.brandTone} disabled={!isEditing} onChange={(value) => updateField("brandTone", value)} />
            <SelectField label="Industry" value={form.industry} disabled={!isEditing} onChange={(value) => updateField("industry", value)} />
            <Field label="Target Audience" value={form.targetAudience} disabled={!isEditing} onChange={(value) => updateField("targetAudience", value)} />
            <Field label="Website" value={form.website} disabled={!isEditing} onChange={(value) => updateField("website", value)} />
            <TagField label="Services / Products" value={form.servicesText} values={services} disabled={!isEditing} onChange={(value) => updateField("servicesText", value)} />
            <label className="field wide">
              <span>Company Description</span>
              <textarea value={form.description} disabled={!isEditing} onChange={(event) => updateField("description", event.target.value)} />
            </label>
          </div>
        </Panel>

        <Panel title="">
          <SectionTitle icon={Brain} title="AI Brand Memory" subtitle="This helps AI generate content that matches your brand" />
          <div className="memory-list">
            {[
              ["Writing Style", "writingStyle"],
              ["Brand Tone", "memoryBrandTone"],
              ["Preferred CTA Style", "preferredCtaStyle"],
              ["Keywords", "keywords"],
              ["Competitors", "competitors"]
            ].map(([label, field]) => (
              <div className="memory-item" key={label}>
                <span>{label}</span>
                {isEditing ? (
                  <input value={form[field]} onChange={(event) => updateField(field, event.target.value)} />
                ) : (
                  <b>{form[field]}</b>
                )}
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="">
          <SectionTitle icon={ImagePlus} title="Branding Assets" subtitle="Upload your brand assets" />
          <div className="asset-grid">
            <div className="asset-item">
              <span className="asset-label">Logo</span>
              {isEditing ? (
                <input className="asset-input" value={form.logoText} onChange={(event) => updateField("logoText", event.target.value)} />
              ) : (
                <div className="logo-card"><LineChart size={48} /><b>{form.logoText}</b></div>
              )}
              <p className="asset-hint">400 × 400 px</p>
            </div>
            <div className="asset-item asset-cover">
              <span className="asset-label">Cover Image</span>
              {isEditing ? (
                <input className="asset-input" value={form.coverImageUrl} placeholder="Paste image URL…" onChange={(event) => updateField("coverImageUrl", event.target.value)} />
              ) : (
                <div className="cover-image" style={form.coverImageUrl ? { backgroundImage: `url(${form.coverImageUrl})` } : undefined} />
              )}
              <p className="asset-hint">1128 × 191 px</p>
            </div>
            <div className="asset-item asset-colors-row">
              <span className="asset-label">Brand Colors</span>
              {isEditing ? (
                <input className="asset-input" value={form.brandColorsText} placeholder="#HEX, #HEX, …" onChange={(event) => updateField("brandColorsText", event.target.value)} />
              ) : (
                <div className="swatches">
                  {brandColors.map((color) => <ColorSwatch color={color} key={color} />)}
                </div>
              )}
            </div>
          </div>
        </Panel>

        <Panel title="">
          <SectionTitle icon={Linkedin} title="LinkedIn Information" brand />
          <div className="stack">
            <Field label="LinkedIn Profile URL" value={form.linkedInProfile} disabled={!isEditing} onChange={(value) => updateField("linkedInProfile", value)} />
          </div>
        </Panel>
      </div>
    </section>
  );
}

function SectionTitle({ icon: Icon, title, subtitle, brand }) {
  return (
    <div className="section-title">
      <div className={brand ? "linkedin-icon" : "soft-icon"}><Icon size={22} /></div>
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </div>
  );
}

function Field({ label, value, disabled, onChange }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input value={value} disabled={disabled} onChange={(event) => onChange?.(event.target.value)} />
    </label>
  );
}

function SelectField({ label, value, disabled, onChange }) {
  return (
    <label className="field select-field">
      <span>{label}</span>
      <div className={disabled ? "readonly-display" : ""}>
        <input value={value} disabled={disabled} onChange={(event) => onChange?.(event.target.value)} />
        {!disabled && <ChevronDown size={17} />}
      </div>
    </label>
  );
}

function TagField({ label, values, value, disabled, onChange }) {
  return (
    <label className="field tag-field">
      <span>{label}</span>
      {disabled ? (
        <div>
          {values.map((item) => <b key={item}>{item}</b>)}
        </div>
      ) : (
        <input value={value} onChange={(event) => onChange?.(event.target.value)} />
      )}
    </label>
  );
}

function splitList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function formToProfileRow(form) {
  return {
    company_name: form.companyName,
    brand_tone: form.brandTone,
    industry: form.industry,
    target_audience: form.targetAudience,
    website: form.website,
    services: splitList(form.servicesText),
    company_description: form.description,
    writing_style: form.writingStyle,
    memory_brand_tone: form.memoryBrandTone,
    preferred_cta_style: form.preferredCtaStyle,
    keywords: splitList(form.keywords),
    competitors: splitList(form.competitors),
    logo_text: form.logoText,
    cover_image_url: form.coverImageUrl,
    brand_colors: splitList(form.brandColorsText),
    linkedin_profile_url: form.linkedInProfile
  };
}

function profileRowToForm(row) {
  return {
    companyName: row.company_name || "",
    brandTone: row.brand_tone || "",
    industry: row.industry || "",
    targetAudience: row.target_audience || "",
    website: row.website || "",
    servicesText: Array.isArray(row?.services) ? row.services.join(", ") : "",
    description: row.company_description || "",
    writingStyle: row.writing_style || "",
    memoryBrandTone: row.memory_brand_tone || "",
    preferredCtaStyle: row.preferred_cta_style || "",
    keywords: Array.isArray(row?.keywords) ? row.keywords.join(", ") : "",
    competitors: Array.isArray(row?.competitors) ? row.competitors.join(", ") : "",
    logoText: row.logo_text || "",
    coverImageUrl: row.cover_image_url || "",
    brandColorsText: Array.isArray(row?.brand_colors) ? row.brand_colors.join(", ") : "",
    linkedInProfile: row.linkedin_profile_url || ""
  };
}

function parseDateForSupabase(value) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function ColorSwatch({ color }) {
  return (
    <div>
      <span style={{ background: color }} />
      <small>{color}</small>
    </div>
  );
}

function formatMetric(value) {
  if (value == null) return "-";
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return String(value);
}

function statusToArt(status) {
  const s = (status || "").toLowerCase();
  if (s === "scheduled") return "calendar";
  if (s === "draft") return "future";
  if (s === "failed") return "alert";
  return "ai";
}

function formatPostDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

function formatPostTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function Posts({ posts, loading, error }) {
  const tabs = ["All Posts", "Published", "Scheduled", "Drafts", "Failed"];
  const [activeTab, setActiveTab] = useState(0);

  const filteredPosts = posts.filter((post) => {
    if (activeTab === 0) return true;
    const tab = tabs[activeTab];
    const statusMatch = tab === "Drafts" ? "draft" : tab.toLowerCase();
    return (post.status || "").toLowerCase() === statusMatch;
  });

  return (
    <section>
      <PageHeader title="Posts" subtitle="Manage and track all your LinkedIn posts" hideDatePicker />
      <div className="posts-toolbar">
        <div className="tabs">
          {tabs.map((tab, index) => (
            <button
              className={index === activeTab ? "active" : ""}
              key={tab}
              type="button"
              onClick={() => setActiveTab(index)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      <div className="posts-table">
        <div className="posts-head">
          <span>Post</span>
          <span>Status</span>
          <span>Date <ChevronDown size={14} /></span>
          <span>Impressions</span>
          <span>Likes</span>
          <span>Comments</span>
          <span>Engagement Rate</span>
          <span>Actions</span>
        </div>
        {loading && (
          <div className="posts-row" style={{ justifyContent: "center", padding: "2rem", gridColumn: "1 / -1" }}>
            <span>Loading posts...</span>
          </div>
        )}
        {error && (
          <div className="posts-row" style={{ justifyContent: "center", padding: "2rem", gridColumn: "1 / -1", color: "var(--red, #e53e3e)" }}>
            <span>Error: {error}</span>
          </div>
        )}
        {!loading && !error && filteredPosts.length === 0 && (
          <div className="posts-row" style={{ justifyContent: "center", padding: "2rem", gridColumn: "1 / -1", color: "var(--muted, #888)" }}>
            <span>No posts found.</span>
          </div>
        )}
        {!loading && !error && filteredPosts.map((post) => (
          <div className="posts-row" key={post.id}>
            <div className="post-cell">
              {post.thumbnail_url
                ? <img src={post.thumbnail_url} alt="" className="post-art" style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} />
                : <PostArt type={post.art} />
              }
              <div><strong>{post.title}</strong><p>{post.excerpt}</p></div>
            </div>
            <span className={`status ${(post.status || "draft").toLowerCase()}`}>{post.status || "Draft"}</span>
            <span>{post.date}<small>{post.time}</small></span>
            <span>{post.impressions}</span>
            <span>{post.likes}</span>
            <span>{post.comments}</span>
            <span className={post.rate !== "-" ? "green-text" : ""}>{post.rate}</span>
            <button className="icon-button" type="button"><MoreVertical size={20} /></button>
          </div>
        ))}
        <div className="table-footer">
          <span>Showing {filteredPosts.length} post{filteredPosts.length !== 1 ? "s" : ""}</span>
          <div>
            <button className="page-button" type="button"><ChevronLeft size={18} /></button>
            <button className="page-button active" type="button">1</button>
            <button className="page-button" type="button"><ChevronRight size={18} /></button>
          </div>
        </div>
      </div>
    </section>
  );
}

function ContentGeneration({ user }) {
  const [prompt, setPrompt] = useState(
    "Share a concise insight about how AI automation helps business teams save time without losing quality."
  );
  const [draft, setDraft] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [saveStatus, setSaveStatus] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);

  const postImage = "https://tempfile.aiquickdraw.com/workers/nano/image_1777924252410_eneud1.png";

  const formattedDraft = useMemo(() => {
    if (!draft) return "";
    if (typeof draft === "string") return draft;
    if (Array.isArray(draft)) {
      return draft
        .map((item) => extractDraftText(item) || JSON.stringify(item, null, 2))
        .filter(Boolean)
        .join("\n\n");
    }
    return extractDraftText(draft) || JSON.stringify(draft, null, 2);
  }, [draft]);

  async function handleGenerateDraft() {
    const trimmedPrompt = prompt.trim();
    setError("");
    setDraft("");
    setGeneratedImage(null);
    setSaveStatus("");
    setIsExpanded(false);

    if (!trimmedPrompt) {
      setError("Please enter text before generating a draft.");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmedPrompt })
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Draft generation failed.");
      }

      const generatedText = payload.text || extractDraftText(payload.result) || "";
      const draftImage = extractDraftImage(payload.result);

      setDraft(generatedText || payload.result);
      if (draftImage) setGeneratedImage(draftImage);

      if (!supabase) {
        setSaveStatus("Generated, but Supabase is not configured.");
        return;
      }

      const { error: saveError } = await supabase.from("content_generations").insert({
        user_id: user.id,
        prompt: trimmedPrompt,
        generated_draft: generatedText,
        webhook_result: payload.result,
        status: "completed"
      });

      if (saveError) {
        setSaveStatus(`Generated, but Supabase save failed: ${saveError.message}`);
        return;
      }

      setSaveStatus("Generated and saved to Supabase.");
    } catch (generationError) {
      setError(generationError.message || "Draft generation failed.");
      if (supabase) {
        await supabase.from("content_generations").insert({
          user_id: user.id,
          prompt: trimmedPrompt,
          generated_draft: null,
          webhook_result: null,
          status: "failed",
          error_message: generationError.message || "Draft generation failed."
        });
      }
    } finally {
      setIsGenerating(false);
    }
  }

  function handlePostOnLinkedin() {
    if (!formattedDraft) return;
    const url = `https://www.linkedin.com/sharing/share-offsite/?text=${encodeURIComponent(formattedDraft)}`;
    window.open(url, "_blank", "noreferrer");
  }

  return (
    <section>
      <PageHeader icon={Wand2} title="Content Generation" subtitle="Draft LinkedIn content from your brand memory" />
      <div className="content-workspace">
        <Panel title="New Post">
          <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} />
          <button className="primary-button" type="button" onClick={handleGenerateDraft} disabled={isGenerating}>
            <Wand2 size={18} />
            {isGenerating ? "Generating..." : "Generate Draft"}
          </button>
          {error && <p className="form-error">{error}</p>}
          {saveStatus && <p className="profile-status content-save-status">{saveStatus}</p>}
        </Panel>
        <Panel title="Post Preview">
          <div className="mobile-preview-section">
            <div className="mobile-phone">
              <div className="mobile-content">
                {formattedDraft ? (
                  <div className="linkedin-post">
                    <div className="post-header">
                      <div className="post-avatar">
                        <img
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.user_metadata?.full_name || user?.email || "User")}&background=random`}
                          alt=""
                          style={{ borderRadius: "50%" }}
                        />
                      </div>
                      <div className="post-meta">
                        <span className="post-author">{user?.user_metadata?.full_name || user?.email || "User"}</span>
                        <span className="post-headline">Digital Strategist | Content Creator</span>
                        <span className="post-time">1h • <Globe size={10} /></span>
                      </div>
                    </div>

                    <div className={`post-text ${!isExpanded ? "collapsed" : ""}`}>
                      {formattedDraft}
                    </div>

                    {!isExpanded && (
                      <>
                        <button className="see-more" onClick={() => setIsExpanded(true)}>...more</button>
                        <div className="post-image-container">
                          <img src={generatedImage || postImage} alt="Post preview" className="post-image" />
                        </div>
                      </>
                    )}

                    {isExpanded && (
                      <div className="post-image-container">
                        <img src={generatedImage || postImage} alt="Post preview" className="post-image" />
                      </div>
                    )}

                    <div className="post-footer">
                      <div className="post-action"><ThumbsUp size={16} /> Like</div>
                      <div className="post-action"><MessageCircle size={16} /> Comment</div>
                      <div className="post-action"><Send size={16} /> Repost</div>
                      <div className="post-action"><Send size={16} /> Send</div>
                    </div>
                  </div>
                ) : (
                  <div className="draft-output empty" style={{ height: "100%" }}>
                    {isGenerating ? (
                      <div className="spinner-container">
                        <div className="spinner" />
                        <span className="loading-text">Generating your LinkedIn post...</span>
                      </div>
                    ) : (
                      "Your generated LinkedIn draft will appear here."
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          {!isGenerating && formattedDraft && (
            <div className="draft-container" style={{ marginTop: "18px" }}>
              <button className="primary-button linkedin-post-button" type="button" onClick={handlePostOnLinkedin}>
                <Linkedin size={18} />
                Post on LinkedIn
              </button>
            </div>
          )}
        </Panel>
      </div>
    </section>
  );
}

function extractDraftText(value) {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value.map((item) => extractDraftText(item)).filter(Boolean).join("\n\n");
  }
  if (!value || typeof value !== "object") return "";

  const textKeys = ["output", "draft", "result", "text", "message", "content", "response"];
  for (const key of textKeys) {
    if (typeof value[key] === "string") return value[key];
  }

  for (const nestedValue of Object.values(value)) {
    const nestedText = extractDraftText(nestedValue);
    if (nestedText) return nestedText;
  }

  return "";
}

function extractDraftImage(value) {
  if (!value || typeof value !== "object") return null;

  // Check specific keys first
  const imgKeys = ["resultJson", "image", "imageUrl", "photo", "url", "img"];
  for (const key of imgKeys) {
    if (typeof value[key] === "string" && value[key].startsWith("http")) {
      return value[key];
    }
  }

  // Deep search
  for (const nestedValue of Object.values(value)) {
    const found = extractDraftImage(nestedValue);
    if (found) return found;
  }

  return null;
}

createRoot(document.getElementById("root")).render(<App />);
