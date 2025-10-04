import { useState, useEffect } from "react";
import { Sparkles, BookOpen, HelpCircle } from "lucide-react";
import FaqItem from "./faq-item";
import { Page, Content, FAQ } from "@/lib/types/page";
import { Container } from "./ui";

const PageContentAndFaqSkeleton = () => (
  <div className="w-full space-y-12 animate-pulse">
    {/* Hero skeleton */}
    <div className="space-y-6">
      <div className="h-12 rounded-lg w-3/4 max-w-2xl bg-gray-200 dark:bg-gray-700"></div>
      <div className="space-y-3">
        <div className="h-6 rounded-lg w-full bg-gray-200 dark:bg-gray-700"></div>
        <div className="h-6 rounded-lg w-5/6 bg-gray-200 dark:bg-gray-700"></div>
        <div className="h-6 rounded-lg w-4/6 bg-gray-200 dark:bg-gray-700"></div>
      </div>
    </div>

    {/* Content cards skeleton */}
    <div className="grid gap-6 md:gap-8 sm:grid-cols-1 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4 bg-white dark:bg-gray-800"
        >
          <div className="h-8 rounded-lg w-3/4 bg-gray-200 dark:bg-gray-700"></div>
          <div className="space-y-2">
            <div className="h-4 rounded-lg w-full bg-gray-200 dark:bg-gray-700"></div>
            <div className="h-4 rounded-lg w-4/5 bg-gray-200 dark:bg-gray-700"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default function PageContentAndFaq({
  pageContentAndFaq,
  isLoading = false,
}: {
  pageContentAndFaq?: Page;
  isLoading?: boolean;
}) {
  const [contents, setContents] = useState<Content[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  useEffect(() => {
    if (pageContentAndFaq?.contents) {
      const filtered = pageContentAndFaq.contents
        .filter((content: any) => content.isActive)
        .sort((a: any, b: any) => a.order - b.order);
      setContents(filtered);
    }

    if (pageContentAndFaq?.faqs) {
      const filtered = pageContentAndFaq.faqs
        .filter((faq: any) => faq.isActive)
        .sort((a: any, b: any) => a.order - b.order);
      setFaqs(filtered);
    }
  }, [pageContentAndFaq]);

  if (isLoading || !pageContentAndFaq) {
    return (
      <div className="w-full py-12">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <PageContentAndFaqSkeleton />
        </div>
      </div>
    );
  }

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  if (!pageContentAndFaq) {
    return null;
  }

  return (
    <Container>
      {/* Header Section */}
      <div className="space-y-6 mb-5">
        <div className="flex items-start md:items-center gap-y-3.5">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30">
            <Sparkles className="w-4 h-4 md:w-6 md:h-6 text-blue-600 dark:text-blue-300" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold font-sans text-gray-900 dark:text-white">
            {pageContentAndFaq.title}
          </h1>
        </div>
        <div
          className="text-base md:text-lg font-sans text-gray-600 dark:text-gray-300 leading-relaxed prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: pageContentAndFaq.content }}
        />
      </div>

      {/* Features Section */}
      {contents.length > 0 && (
        <div className="space-y-6 mb-5">
          <div className="grid gap-6">
            {contents.map((content, index) => (
              <div
                key={content.id}
                className="group space-y-4 border border-gray-200 dark:border-gray-700 rounded-lg  p-4 md:p-6 
                                     hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 
                                     transition-all duration-300 bg-card"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 
                                              group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-all duration-300"
                  >
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                    {content.title}
                  </h2>
                </div>
                <div
                  className="text-base md:text-lg font-sans text-gray-600 dark:text-gray-300 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: content.content }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAQ Section */}
      {faqs.length > 0 && (
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30">
                <HelpCircle className="w-4 h-4 md:w-6 md:h-6 text-orange-600 dark:text-orange-300" />
              </div>
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                Frequently Asked Questions
              </h2>
            </div>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <FaqItem
                key={faq.id}
                faq={faq}
                index={index}
                isOpen={openFAQ === index}
                onToggle={() => toggleFAQ(index)}
              />
            ))}
          </div>
        </div>
      )}
    </Container>
  );
}
