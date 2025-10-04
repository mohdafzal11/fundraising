import { ChevronDown, Sparkles, BookOpen, HelpCircle } from "lucide-react";

export default function FAQItem({
  faq,
  index,
  isOpen,
  onToggle,
}: {
  faq: any;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="group">
      <div
        className={`
            border border-gray-200 dark:border-gray-700 rounded-xl transition-all duration-300 
            hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md
            ${isOpen ? "shadow-lg border-blue-300 dark:border-blue-600" : ""}
        `}
      >
        <button
          onClick={onToggle}
          className={`
                    w-full text-left p-4 transition-all duration-300 flex items-center justify-between
                    ${
                      isOpen
                        ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30"
                        : "hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/30 dark:hover:from-slate-700/50 dark:hover:to-blue-950/20"
                    }
                    ${isOpen ? "rounded-t-xl" : "rounded-xl"}
                `}
        >
          <div className="flex items-center gap-3">
            <div
              className={`
                        p-2 rounded-lg transition-all duration-300
                        ${
                          isOpen
                            ? "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-300"
                        }
                    `}
            >
              <HelpCircle className="w-4 h-4" />
            </div>
            <h3
              className={`
                        text-base font-semibold pr-4 transition-colors duration-300
                        ${
                          isOpen
                            ? "text-blue-900 dark:text-blue-100"
                            : "text-gray-900 dark:text-slate-100 group-hover:text-gray-700 dark:group-hover:text-white"
                        }
                    `}
            >
              {faq.question}
            </h3>
          </div>

          <div
            className={`
                    flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300
                    ${
                      isOpen
                        ? "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-300"
                    }
                `}
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-300 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </button>

        <div
          className={`
                overflow-hidden transition-all duration-300 ease-in-out
                ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}
            `}
        >
          <div className="px-4 pb-4 pt-0">
            <div className="border-t border-gray-100 dark:border-slate-700 pt-4">
              <div
                className="text-gray-600 dark:text-slate-300 leading-relaxed text-sm prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: faq.answer }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
