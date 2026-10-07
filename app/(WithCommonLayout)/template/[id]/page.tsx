import TemplateDetailsContainer from "@/components/modules/CommonModules/template/TemplateDetails/TemplateDetailsContainer";
import type { Metadata } from "next";
import React from "react";

// Server-side: call the backend directly (the client's dev proxy path is relative)
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050/api/v1";

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}): Promise<Metadata> {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;
    const response = await fetch(`${API_URL}/templates/${id}`, { next: { revalidate: 300 } });
    const template = response.ok ? (await response.json()).data : null;

    if (template) {
      return {
        title: `${template.title} - Themora`,
        description: template.shortDescription || `Premium ${template.title} template available at Themora`,
        openGraph: {
          title: template.title,
          description: template.shortDescription || `Premium ${template.title} template`,
          images: template.imageUrl ? [template.imageUrl] : [],
          type: "website",
        },
        twitter: {
          card: "summary_large_image",
          title: template.title,
          description: template.shortDescription || `Premium ${template.title} template`,
          images: template.imageUrl ? [template.imageUrl] : [],
        },
      };
    }
  } catch (error) {
    // Fallback metadata if template fetch fails
    return {
      title: "Template Details - Themora",
      description: "View template details and purchase premium templates",
    };
  }

  return {
    title: "Template Details - Themora",
    description: "View template details and purchase premium templates",
  };
}

export default async function TemplateDetailsPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const { id } = resolvedParams;
  return <TemplateDetailsContainer id={id} />;
}
