import { formLabelClasses } from "@/lib/constant";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import  ImageUpload  from "./image-upload";
import { Project , Investor } from "@/lib/types/projects";
import { useState } from "react";

function SeoDetails({
  formData,
  setFormData,
  formErrors,
}: {
  formData: any;
  setFormData: (formData: any) => void;
  formErrors: any;
}) {
  const [formIsSubmitting, setFormIsSubmitting] = useState(false);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="bg-muted/50 p-4 rounded-md dark:bg-slate-800/40">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="seoTitle"
                className={`${formLabelClasses} dark:text-white`}
              >
                Title
              </label>
              <Input
                id="seoTitle"
                placeholder="Enter SEO title (defaults to event title if left empty)"
                value={formData.metaTitle || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    metaTitle: e.target.value,
                  })
                }
                className="h-12 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Recommended length: 50-60 characters
              </p>
            </div>
            <div>
              <label
                htmlFor="seoDescription"
                className={`${formLabelClasses} dark:text-white`}
              >
                Description
              </label>
              <Textarea
                id="seoDescription"
                placeholder="Enter SEO description (defaults to event description if left empty)"
                value={formData.metaDescription || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    metaDescription: e.target.value,
                  })
                }
                className="min-h-[100px] dark:bg-slate-900 dark:border-slate-700 dark:text-white"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Recommended length: 120-160 characters
              </p>
            </div>

            <div>
              <label
                htmlFor="seoKeywords"
                className={`${formLabelClasses} dark:text-white`}
              >
                Keywords
              </label>
              <Input
                id="seoKeywords"
                placeholder="Enter SEO keywords separated by commas"
                value={formData.metaKeywords || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    metaKeywords: e.target.value,
                  })
                }
                className="h-12 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Example: conference, tech event, developer meetup
              </p>
            </div>

            <div>
              <label className={`${formLabelClasses} dark:text-white`}>
                Image
              </label>
              <p className="text-sm text-muted-foreground mb-2">
                Upload an image for social media sharing (1200 × 630 pixels
                recommended)
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Defaults to event banner if left empty
              </p>
              <ImageUpload
              value={formData.metaImage || ""}
                onChange={(value) =>
                  setFormData({
                    ...formData,
                    metaImage: value,
                  })
                }
                disabled={formIsSubmitting}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SeoDetails;
