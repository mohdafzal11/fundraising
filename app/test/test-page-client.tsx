"use client";
import { cleanSEOIMAGEURL, getPageUrl } from "@/lib/utils";
import { useEffect, useState } from "react";

interface Project {
  slug: string;
}

interface TestPageClientProps {
  project: Project;
}

export default function TestPageClient({ project }: TestPageClientProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const logContext = {
    requestId: Date.now().toString(),
    component: "TestPageClient",
    slug: project.slug,
  };

  const fetchSeoImage = async () => {
    console.debug({ ...logContext, message: "Starting image fetch" });
    setIsLoading(true);
    setError(null);

    try {
      const url = getPageUrl(`/api/og-image-project/${project.slug}`);

      const response = await fetch(url);
      if (!response.ok) {
        const errorMessage = `Failed to fetch image: ${response.status} ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const {data} = await response.json()
      setImageUrl(data)
    } catch (error: any) {
      console.error({ ...logContext, message: "Error fetching image", error: error.message });
      setError(error.message || "Failed to load image");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.debug({ ...logContext, message: "Mounting component, initiating image fetch" });
    fetchSeoImage();
  }, [project.slug]);


  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">Test Page</h1>
      {isLoading && <p className="text-gray-500">Loading image...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      {imageUrl && !error && (
        <img
          src={imageUrl}
          alt={`SEO image for project ${project.slug}`}
          className="max-w-full h-auto rounded-lg shadow-md"
          onError={() => {
            console.error({ ...logContext, message: "Image failed to load in <img> element" });
            setError("Failed to display image");
            setImageUrl(null);
          }}
        />
      )}
    </div>
  );
}