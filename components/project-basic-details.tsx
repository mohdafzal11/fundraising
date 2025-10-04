import { formLabelClasses, PROJECT_CATEGORIES } from "@/lib/constant";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";
import RichTextEditor from "./rich-text-editor";
import ImageUpload from "./image-upload";
import { useState } from "react";
import { Project } from "@/lib/types/projects";
import { slugify } from "@/lib/utils";
import { Button } from "./ui/button";
import { Facebook, Twitter, Linkedin } from "lucide-react";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function ProjectBasicDetails({
  formData,
  setFormData,
  formErrors,
}: {
  formData: Project;
  setFormData: (formData: Project) => void;
  formErrors: any;
}) {
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  const SOCIAL_PLATFORMS = [
    "website",
    "facebook",
    "twitter",
    "linkedin",
    "youtube",
    "instagram",
    "tiktok",
    "discord",
    "twitch",
    "blog",
    "other",
  ] as const;

  const handleAddSocialLink = () => {
    setFormData({
      ...formData,
      links: [...(formData.links || []), { type: "website", url: "" }],
    });
  };

  const handleSocialLinkChange = (
    index: number,
    field: "type" | "url",
    value: string
  ) => {
    const updatedSocialLinks = [...(formData.links || [])];
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

  const handleCategoryChange = (category: string) => {
    let updatedCategories: string[] = [...(formData.category || [])];
    if (updatedCategories.includes(category)) {
      updatedCategories = updatedCategories.filter((cat) => cat !== category);
    } else {
      updatedCategories.push(category);
    }
    setFormData({ ...formData, category: updatedCategories });
  };

  const socialLinkIcons: Record<
    string,
    React.ComponentType<{ className?: string }>
  > = {
    facebook: Facebook,
    twitter: Twitter,
    linkedin: Linkedin,
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
                  Project name must be at least 3 characters.
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="slug"
                className={`${formLabelClasses} dark:text-white`}
              >
                Project Slug <span className="text-red-500">*</span>
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
                URL-friendly version of the project name (only letters, numbers,
                and hyphens)
              </p>
            </div>

            <div>
              <label
                htmlFor="symbol"
                className={`${formLabelClasses} dark:text-white`}
              >
                Symbol
              </label>
              <Input
                id="symbol"
                placeholder="Enter project symbol"
                value={formData.symbol || ""}
                onChange={(e) =>
                  setFormData({ ...formData, symbol: e.target.value })
                }
                className="h-12 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
              />
            </div>

            <div>
              <label
                htmlFor="title"
                className={`${formLabelClasses} dark:text-white`}
              >
                Title
              </label>
              <Input
                id="title"
                placeholder="Enter project title"
                value={formData.title || ""}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="h-12 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
              />
            </div>

            <div>
              <label
                htmlFor="category"
                className={`${formLabelClasses} dark:text-white`}
              >
                Category <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Popover
                  open={isCategoryDropdownOpen}
                  onOpenChange={setIsCategoryDropdownOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={isCategoryDropdownOpen}
                      className={cn(
                        "h-12 w-full justify-between dark:bg-slate-900 dark:border-slate-700 dark:text-white",
                        {
                          "border-red-500 focus-visible:ring-red-500":
                            formErrors.category,
                        }
                      )}
                    >
                      {formData.category?.length
                        ? formData.category.join(", ")
                        : "Select categories"}
                      <span className="ml-2">▼</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0 dark:bg-slate-900 dark:border-slate-700">
                    <Command className="dark:bg-slate-900 dark:text-white">
                      <CommandList>
                        <CommandGroup>
                          {PROJECT_CATEGORIES.map((category) => (
                            <CommandItem
                              key={category}
                              value={category}
                              onSelect={() => handleCategoryChange(category)}
                              className="dark:hover:bg-slate-800"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.category?.includes(category)
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {category}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              {formErrors.category && (
                <p className="text-xs text-red-500 mt-1">
                  {formErrors.category}
                </p>
              )}
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
                Upload a logo for your project to enhance its visibility.
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
                            {SOCIAL_PLATFORMS.map((platform) => (
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
                  disabled={formSubmitting}
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

export default ProjectBasicDetails;