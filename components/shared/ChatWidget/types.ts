export type ContextMode =
  | "all"
  | "theme_finder"
  | "blog_guide"
  | "project_brief"
  | "pricing_help";

export interface MessageCard {
  title: string;
  description: string;
  href: string;
  tag?: string;
  icon?: "theme" | "blog" | "pricing" | "contact" | "code";
}

export interface SuggestionItem {
  label: string;
  action: string;
  mode?: ContextMode;
}

export interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: string;
  mode?: ContextMode;
  codeSnippet?: { language: string; code: string };
  cards?: MessageCard[];
  suggestions?: SuggestionItem[];
}

export interface ProjectBriefData {
  projectType: string;
  techStack: string;
  keyFeatures: string[];
  budget: string;
  customNotes: string;
}
