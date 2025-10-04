import { formLabelClasses } from "@/lib/constant";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";
import RichTextEditor from "./rich-text-editor";
import ImageUpload from "./image-upload";
import { useState } from "react";
import { Investor } from "@/lib/types/projects";
import { slugify } from "@/lib/utils";
import { Button } from "./ui/button";
import { Facebook, Twitter, Linkedin, Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function InvestorBasicDetails({
  formData,
  setFormData,
  formErrors,
}: {
  formData: Investor;
  setFormData: (formData: Investor) => void;
  formErrors: any;
}) {
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  const SOCIAL_PLATFORMS = [
    "website",
    "facebook",
    "twitter",
    "linkedin",
  ] as const;

  const handleAddSocialLink = () => {
    const usedPlatforms = (formData.links || []).map((link) => link.type);
    const availablePlatform =
      SOCIAL_PLATFORMS.find((platform) => !usedPlatforms.includes(platform)) ||
      "facebook";
    setFormData({
      ...formData,
      links: [...(formData.links || []), { type: availablePlatform, url: "" }],
    });
  };

  const handleSocialLinkChange = (
    index: number,
    field: "type" | "url",
    value: string
  ) => {
    const updatedSocialLinks = [...(formData.links || [])];
    if (
      field === "type" &&
      (formData.links || []).some(
        (link, i) => i !== index && link.type === value
      )
    ) {
      return;
    }
    updatedSocialLinks[index] = {
      ...updatedSocialLinks[index],
      [field]: value,
    };
    setFormData({ ...formData, links: updatedSocialLinks });
  };

  const handleRemoveSocialLink = (index: number) => {
    const updatedSocialLinks = (formData.links || []).filter(
      (_, i) => i !== index
    );
    setFormData({ ...formData, links: updatedSocialLinks });
  };

  const socialLinkIcons: Record<
    string,
    React.ComponentType<{ className?: string }>
  > = {
    facebook: Facebook,
    twitter: Twitter,
    linkedin: Linkedin,
    website: Globe,
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="bg-muted/50 p-4 rounded-md dark:bg-slate-800/40">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className={`${formLabelClasses} dark:text-white`}
              >
                Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="name"
                required
                placeholder="Enter project name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: e.target.value,
                    slug: slugify(e.target.value),
                  })
                }
                className={cn(
                  "h-12 dark:bg-slate-900 dark:border-slate-700 dark:text-white",
                  {
                    "border-red-500 focus-visible:ring-red-500":
                      formData.name !== "" && formData.name.length < 3,
                  }
                )}
              />
              {formData.name !== "" && formData.name.length < 3 && (
                <p className="text-xs text-red-500 mt-1">
                  Investor name must be at least 3 characters.
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="slug"
                className={`${formLabelClasses} dark:text-white`}
              >
                Investor Slug
              </label>
              <Input
                id="slug"
                placeholder="Enter URL-friendly slug for this event"
                value={formData.slug || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    slug: e.target.value,
                  })
                }
                className="h-12 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
              />
              <p className="text-xs text-muted-foreground mt-1">
                URL-friendly version of the investor name (only letters, numbers,
                and hyphens)
              </p>
            </div>

            <div>
              <label
                htmlFor="description"
                className={`${formLabelClasses} dark:text-white`}
              >
                Description
              </label>
              <RichTextEditor
                value={formData.description ?? ""}
                onChange={(value) =>
                  setFormData({ ...formData, description: value })
                }
                placeholder="Enter project description"
                minWords={15}
                maxWords={500}
                className="min-h-[100px] dark:bg-slate-900 dark:border-slate-700 dark:text-white"
              />
            </div>

            <div>
              <label className={`${formLabelClasses} dark:text-white`}>
                Upload Logo
              </label>
              <p className="text-sm text-muted-foreground mb-2 dark:text-slate-300">
                Upload a logo for your investor to enhance its visibility.
              </p>
              <p className="text-xs text-muted-foreground mb-4 dark:text-slate-300">
                Recommended size: 1200 × 630 pixels (PNG, JPEG, SVG are
                supported)
              </p>
              <ImageUpload
                value={formData.logo || ""}
                onChange={(value) =>
                  setFormData({
                    ...formData,
                    logo: value,
                    logoAltText: formData.name,
                  })
                }
                disabled={formSubmitting}
              />
            </div>

            <div>
              <label className={`${formLabelClasses} dark:text-white`}>
                Social Links
              </label>
              <p className="text-sm text-muted-foreground mb-4 dark:text-slate-300">
                Add social media links to promote your project.
              </p>
              <div className="space-y-4">
                {(formData.links || []).map((link, index) => {
                  const Icon = socialLinkIcons[link.type];
                  const usedPlatforms = (formData.links || [])
                    .filter((_, i) => i !== index)
                    .map((l) => l.type);
                  const availablePlatforms = SOCIAL_PLATFORMS.filter(
                    (platform) => !usedPlatforms.includes(platform)
                  );
                  return (
                    <div key={index} className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {Icon && (
                          <Icon className="w-5 h-5 text-primary dark:text-blue-400" />
                        )}
                        <Select
                          value={link.type}
                          onValueChange={(value) =>
                            handleSocialLinkChange(index, "type", value)
                          }
                        >
                          <SelectTrigger className="w-40 h-12 dark:bg-slate-900 dark:border-slate-700 dark:text-white">
                            <SelectValue placeholder="Select platform" />
                          </SelectTrigger>
                          <SelectContent className="dark:bg-slate-900 dark:border-slate-700 dark:text-white">
                            {availablePlatforms.map((platform) => (
                              <SelectItem key={platform} value={platform}>
                                {platform.charAt(0).toUpperCase() +
                                  platform.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Input
                        value={link.url}
                        onChange={(e) =>
                          handleSocialLinkChange(index, "url", e.target.value)
                        }
                        placeholder="Enter URL"
                        className={cn(
                          "flex-1 h-12 dark:bg-slate-900 dark:border-slate-700 dark:text-white",
                          {
                            "border-red-500 focus-visible:ring-red-500":
                              link.url &&
                              !/^(https?:\/\/)?[\w-]+(\.[\w-]+)+[/#?]?.*$/.test(
                                link.url
                              ),
                          }
                        )}
                        aria-describedby={`social-link-${index}-error`}
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveSocialLink(index)}
                        disabled={formSubmitting}
                        className="h-10 min-w-[100px] rounded-md"
                        aria-label={`Remove ${link.type} link`}
                      >
                        Remove
                      </Button>
                      {link.url &&
                        !/^(https?:\/\/)?[\w-]+(\.[\w-]+)+[/#?]?.*$/.test(
                          link.url
                        ) && (
                          <p
                            id={`social-link-${index}-error`}
                            className="text-xs text-red-500 mt-1"
                          >
                            Invalid URL
                          </p>
                        )}
                    </div>
                  );
                })}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddSocialLink}
                  disabled={
                    formSubmitting ||
                    (formData.links || []).length >= SOCIAL_PLATFORMS.length
                  }
                  className="h-10 min-w-[100px] rounded-md border-gray-200 dark:border-slate-700 text-foreground dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700/50"
                >
                  Add Social Link
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvestorBasicDetails;
