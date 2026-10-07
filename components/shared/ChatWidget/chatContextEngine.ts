import { ContextMode, Message, ProjectBriefData } from "./types";

export const INITIAL_PROJECT_BRIEF: ProjectBriefData = {
  projectType: "SaaS Web Application",
  techStack: "Next.js & Tailwind CSS",
  keyFeatures: ["Authentication", "Stripe Checkout", "Dark Mode UI"],
  budget: "$500 - $2,500",
  customNotes: "",
};

export const INITIAL_MESSAGES: Message[] = [
  {
    id: "welcome-1",
    sender: "bot",
    text: "👋 Hi! Welcome to **Themora Smart Assistant**.\n\nYou can ask any question, share your **own project context & requirements**, or use our quick modes below to get tailored recommendations for templates, blogs, and custom development.",
    timestamp: "Just now",
    suggestions: [
      { label: "📋 Send Custom Project Brief", action: "open_brief_modal" },
      { label: "🎨 Recommend Theme for My Project", action: "mode_theme_finder", mode: "theme_finder" },
      { label: "✍️ Ask Coding / Design Question", action: "mode_blog_guide", mode: "blog_guide" },
      { label: "💎 Licenses & Pricing Breakdown", action: "mode_pricing_help", mode: "pricing_help" },
    ],
  },
];

// Context-aware NLP engine for user messages
export function generateContextualResponse(
  query: string,
  mode: ContextMode,
  userBriefHistory?: ProjectBriefData
): Omit<Message, "id" | "sender" | "timestamp"> {
  const q = query.toLowerCase();

  // 1. Check for specific frameworks & stacks
  const mentionsNext = q.includes("next") || q.includes("nextjs") || q.includes("next.js");
  const mentionsReact = q.includes("react") || q.includes("reactjs");
  const mentionsFigma = q.includes("figma") || q.includes("ui kit") || q.includes("source file");
  const mentionsFramer = q.includes("framer");
  const mentionsWebflow = q.includes("webflow");
  const mentionsWordPress = q.includes("wordpress") || q.includes("wp");
  const mentionsSaas = q.includes("saas") || q.includes("dashboard") || q.includes("admin") || q.includes("analytics");
  const mentionsEcommerce = q.includes("ecommerce") || q.includes("shop") || q.includes("store") || q.includes("stripe");
  const mentionsAgency = q.includes("agency") || q.includes("portfolio") || q.includes("personal") || q.includes("freelance");

  // 2. Check for blog / coding / architectural queries
  const isCodingQuestion =
    q.includes("how to") ||
    q.includes("how do") ||
    q.includes("setup") ||
    q.includes("install") ||
    q.includes("code") ||
    q.includes("server action") ||
    q.includes("tailwind") ||
    q.includes("typescript") ||
    q.includes("auth") ||
    q.includes("best practice");

  // 3. Check for custom project / hiring queries
  const isCustomHire =
    q.includes("custom") ||
    q.includes("hire") ||
    q.includes("build for me") ||
    q.includes("agency service") ||
    q.includes("quote") ||
    q.includes("contract") ||
    q.includes("developer");

  // 4. Check for pricing / license queries
  const isPricingQuery =
    q.includes("price") ||
    q.includes("pricing") ||
    q.includes("plan") ||
    q.includes("license") ||
    q.includes("cost") ||
    q.includes("refund") ||
    q.includes("lifetime") ||
    q.includes("subscription");

  // --- Scenario A: User provides a custom Project Brief ---
  if (q.includes("project brief") || q.includes("custom brief context")) {
    return {
      text: `🚀 **Project Context Analyzed!**\n\nHere is our architectural summary for your project:\n• **Type:** ${userBriefHistory?.projectType || "Custom Platform"}\n• **Recommended Stack:** ${userBriefHistory?.techStack || "Next.js + Tailwind + TypeScript"}\n• **Key Features:** ${userBriefHistory?.keyFeatures.join(", ") || "Full-Stack features"}\n• **Estimated Budget/Tier:** ${userBriefHistory?.budget || "Flexible"}\n\nWe have pre-built starter templates that can save you 100+ hours, or our engineering team can build it end-to-end:`,
      cards: [
        {
          title: `Matching ${userBriefHistory?.techStack || "Next.js"} Templates`,
          description: "Production-ready foundation with clean architecture and components.",
          href: `/template?search=${encodeURIComponent(userBriefHistory?.techStack.split(" ")[0] || "React")}`,
          tag: "Ready to Deploy",
          icon: "theme",
        },
        {
          title: "Book Custom Engineering Consultation",
          description: "Our leads will review your brief and provide a timeline & estimate.",
          href: "/contact",
          tag: "Talk to Us",
          icon: "contact",
        },
      ],
      suggestions: [
        { label: "🎨 Browse Recommended Templates", action: "browse_all_templates" },
        { label: "💎 View Pricing Plans", action: "mode_pricing_help", mode: "pricing_help" },
      ],
    };
  }

  // --- Scenario B: Coding or Tutorial Question (Blog / Guide Context) ---
  if (isCodingQuestion || mode === "blog_guide") {
    let snippet = undefined;
    if (mentionsNext || q.includes("server action") || q.includes("auth")) {
      snippet = {
        language: "typescript",
        code: `// app/actions/user.ts (Next.js 15 Server Action)\n"use server";\n\nexport async function createUser(data: { email: string; name: string }) {\n  // Validation & Database mutation\n  const res = await db.user.create({ data });\n  return { success: true, user: res };\n}`,
      };
    } else if (mentionsFigma || q.includes("token")) {
      snippet = {
        language: "css",
        code: `/* Figma Tokens in Tailwind CSS */\n:root {\n  --primary: 217 91% 60%;\n  --background: 232 47% 6%;\n  --card: 235 43% 10%;\n}`,
      };
    }

    return {
      text: `💡 **Technical Analysis & Guidance:**\n\nFor your question regarding **"${query}"**, we recommend following modern modular patterns:\n\n1. **Separation of Concerns:** Keep server actions, data hooks, and UI presentation components strictly isolated.\n2. **Type-Safety:** Use TypeScript Zod schemas for all client-to-server contracts.\n3. **Design Tokens:** Rely on consistent HSL color variables for seamless dark/light mode switches.\n\nHere are related in-depth articles and tutorials from the Themora Blog:`,
      codeSnippet: snippet,
      cards: [
        {
          title: "Next.js 15 & Full-Stack Best Practices",
          description: "Complete guide to server components, server actions, and caching.",
          href: "/blogs",
          tag: "Tutorial",
          icon: "blog",
        },
        {
          title: "Scalable Design Systems & UI Tokens",
          description: "Bridging the gap between Figma components and React codebases.",
          href: "/blogs",
          tag: "Design Guide",
          icon: "blog",
        },
      ],
      suggestions: [
        { label: "🎨 View Matching Code Templates", action: "find_templates" },
        { label: "📋 Send Custom Project Brief", action: "open_brief_modal" },
      ],
    };
  }

  // --- Scenario C: Theme & Template Search (Theme Finder Context) ---
  if (
    mentionsNext ||
    mentionsReact ||
    mentionsFigma ||
    mentionsFramer ||
    mentionsWebflow ||
    mentionsWordPress ||
    mentionsSaas ||
    mentionsEcommerce ||
    mentionsAgency ||
    mode === "theme_finder"
  ) {
    let stackName = "Next.js & React";
    let searchParam = "React";
    if (mentionsFigma) {
      stackName = "Figma UI Kit";
      searchParam = "Figma";
    } else if (mentionsFramer) {
      stackName = "Framer";
      searchParam = "Framer";
    } else if (mentionsWebflow) {
      stackName = "Webflow";
      searchParam = "Webflow";
    } else if (mentionsWordPress) {
      stackName = "WordPress";
      searchParam = "WordPress";
    }

    return {
      text: `🎯 **Personalized Theme Recommendations:**\n\nBased on your context (${stackName} ${mentionsSaas ? "· SaaS/Dashboard" : mentionsEcommerce ? "· E-Commerce" : ""}), here are the top hand-curated templates that match your requirements:`,
      cards: [
        {
          title: `${stackName} Premium Collection`,
          description: "Fully responsive, optimized Lighthouse score, dark mode & source assets included.",
          href: `/template?search=${encodeURIComponent(searchParam)}`,
          tag: "Recommended",
          icon: "theme",
        },
        {
          title: "All Hand-Picked Templates",
          description: "Explore 2,000+ templates with live demos, ratings, and instant downloads.",
          href: "/template",
          tag: "Catalog",
          icon: "theme",
        },
      ],
      suggestions: [
        { label: "💎 View Pricing & Lifetime Access", action: "mode_pricing_help", mode: "pricing_help" },
        { label: "📋 Build Custom Project Brief", action: "open_brief_modal" },
      ],
    };
  }

  // --- Scenario D: Pricing & License Queries ---
  if (isPricingQuery || mode === "pricing_help") {
    return {
      text: `💎 **Themora Pricing & Licensing Details:**\n\nEvery template purchased includes **lifetime access**, **free future updates**, and **complete source files (Figma + Code)**.\n\n• **Single License:** Use on 1 personal or client production site.\n• **Pro/Agency License:** Use on unlimited client projects with priority VIP support.\n• **Refund Policy:** 14-day quality guarantee if any technical defect is verified.`,
      cards: [
        {
          title: "Compare All Pricing Plans",
          description: "Choose the plan that fits your business or agency needs.",
          href: "/pricing",
          tag: "Lifetime License",
          icon: "pricing",
        },
        {
          title: "Enterprise & Custom Inquiries",
          description: "Contact our enterprise team for custom licensing terms.",
          href: "/contact",
          tag: "Custom",
          icon: "contact",
        },
      ],
      suggestions: [
        { label: "🎨 Browse Top Templates", action: "find_templates" },
        { label: "📋 Build Custom Brief", action: "open_brief_modal" },
      ],
    };
  }

  // --- Scenario E: Custom Project Build / Agency Services ---
  if (isCustomHire) {
    return {
      text: `🚀 **Themora Custom Development Services:**\n\nOur creative engineering studio builds high-end digital products:\n• **UI/UX & Design Systems:** Figma design tokens, prototypes, brand identity.\n• **Full-Stack Web:** Next.js 15, React, Node.js, Tailwind, PostgreSQL/Prisma.\n• **Mobile Apps:** React Native (iOS & Android cross-platform).\n\nLet's discuss your project scope:`,
      cards: [
        {
          title: "Start a Project with Themora",
          description: "Share your scope, timeline, and budget directly with our team.",
          href: "/contact",
          tag: "Let's Talk",
          icon: "contact",
        },
      ],
      suggestions: [
        { label: "📋 Fill Project Brief Form", action: "open_brief_modal" },
        { label: "🎨 Browse Templates First", action: "find_templates" },
      ],
    };
  }

  // --- Fallback Natural Response ---
  return {
    text: `Thanks for sharing your context! Regarding **"${query}"**, I have gathered our best resources for you.\n\nFeel free to explore our curated template marketplace, read technical blog guides, or fill out a custom project brief below:`,
    cards: [
      {
        title: `Search "${query}" in Marketplace`,
        description: "Find matching themes, UI kits, and plugins.",
        href: `/template?search=${encodeURIComponent(query)}`,
        tag: "Search Results",
        icon: "theme",
      },
      {
        title: "Themora Engineering & Design Blog",
        description: "Tutorials, design system architectures, and framework guides.",
        href: "/blogs",
        tag: "Articles",
        icon: "blog",
      },
    ],
    suggestions: [
      { label: "📋 Send Custom Project Brief", action: "open_brief_modal" },
      { label: "🎨 Recommended Themes", action: "find_templates" },
      { label: "💎 View Pricing", action: "mode_pricing_help", mode: "pricing_help" },
    ],
  };
}
