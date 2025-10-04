"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { Container, Flex } from "./ui";
import { FadeIn } from "./ui/animation";
import MarqueeScroll from "./marquee-scroll";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";

interface MenuItem {
  text: string;
  url: string;
  type: "link";
}

interface Menu {
  text: string;
  url?: string;
  type: "link" | "dropdown";
  items?: MenuItem[];
}

interface Token {
  id: string;
  name: string;
  ticker: string;
  price: number;
  priceChange24h: number;
  imageUrl: string;
}

export default function Header({
  menus,
  tokens,
}: {
  menus: Menu[];
  tokens: Token[];
}) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>(
    {}
  );
  const dropdownTimeoutRefs = useRef<Record<string, NodeJS.Timeout>>({});
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const navbarContentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  useEffect(() => {
    return () => {
      Object.values(dropdownTimeoutRefs.current).forEach((timeout) => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, []);

  // Handle click outside for mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      Object.keys(openDropdowns).forEach((menuText) => {
        if (
          openDropdowns[menuText] &&
          triggerRefs.current[menuText] &&
          dropdownRefs.current[menuText] &&
          !triggerRefs.current[menuText]?.contains(event.target as Node) &&
          !dropdownRefs.current[menuText]?.contains(event.target as Node)
        ) {
          setOpenDropdowns((prev) => ({ ...prev, [menuText]: false }));
        }
      });
    };

    const hasOpenDropdowns = Object.values(openDropdowns).some(Boolean);
    if (
      hasOpenDropdowns &&
      typeof window !== "undefined" &&
      window.innerWidth <= 768
    ) {
      const timer = setTimeout(() => {
        document.addEventListener("click", handleClickOutside);
      }, 100);
      return () => {
        clearTimeout(timer);
        document.removeEventListener("click", handleClickOutside);
      };
    }
  }, [openDropdowns]);

  // Position dropdowns
  useEffect(() => {
    if (typeof window === "undefined") return;

    Object.keys(openDropdowns).forEach((menuText) => {
      if (
        openDropdowns[menuText] &&
        triggerRefs.current[menuText] &&
        dropdownRefs.current[menuText]
      ) {
        const triggerRect =
          triggerRefs.current[menuText]!.getBoundingClientRect();
        const dropdown = dropdownRefs.current[menuText]!;
        const scrollY = window.scrollY || window.pageYOffset;

        // Always use fixed positioning for consistent behavior
        const topPosition = triggerRect.bottom + scrollY + 8;
        const leftPosition = triggerRect.left + triggerRect.width / 2;

        dropdown.style.position = "fixed";
        dropdown.style.top = `${topPosition}px`;
        dropdown.style.left = `${leftPosition}px`;
        dropdown.style.transform = "translateX(-50%)";
        dropdown.style.zIndex = "2001";
      }
    });
  }, [openDropdowns]);

  const handleThemeToggle = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleDropdownToggle = useCallback((menuText: string) => {
    if (dropdownTimeoutRefs.current[menuText]) {
      clearTimeout(dropdownTimeoutRefs.current[menuText]);
      delete dropdownTimeoutRefs.current[menuText];
    }
    setOpenDropdowns((prev) => ({ ...prev, [menuText]: !prev[menuText] }));
  }, []);

  const handleDropdownEnter = (menuText: string) => {
    if (typeof window !== "undefined" && window.innerWidth > 768) {
      if (dropdownTimeoutRefs.current[menuText]) {
        clearTimeout(dropdownTimeoutRefs.current[menuText]);
        delete dropdownTimeoutRefs.current[menuText];
      }
      setOpenDropdowns((prev) => ({ ...prev, [menuText]: true }));
    }
  };

  const handleDropdownLeave = (menuText: string) => {
    if (typeof window !== "undefined" && window.innerWidth > 768) {
      dropdownTimeoutRefs.current[menuText] = setTimeout(() => {
        setOpenDropdowns((prev) => ({ ...prev, [menuText]: false }));
      }, 300);
    }
  };

  const handleDropdownContentEnter = (menuText: string) => {
    if (typeof window !== "undefined" && window.innerWidth > 768) {
      if (dropdownTimeoutRefs.current[menuText]) {
        clearTimeout(dropdownTimeoutRefs.current[menuText]);
        delete dropdownTimeoutRefs.current[menuText];
      }
    }
  };

  const handleDropdownContentLeave = (menuText: string) => {
    if (typeof window !== "undefined" && window.innerWidth > 768) {
      dropdownTimeoutRefs.current[menuText] = setTimeout(() => {
        setOpenDropdowns((prev) => ({ ...prev, [menuText]: false }));
      }, 150);
    }
  };

  const handleNavClick = (path: string) => {
    const url = `https://droomdroom.com${path}`;
    window.open(url, "_blank");
  };

  if (!mounted) {
    return null;
  }

  // Debug: Log the menu structure (can be removed in production)
  // console.log('Menu data:', menus);

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-background">
        <div className="bg-background border-b border-border px-10">
          <Flex justify="center" align="center" className="py-3 md:py-4">
            <div
              className="absolute left-10
                         cursor-pointer"
              onClick={handleThemeToggle}
            >
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                           w-[40px] h-[12px]
                           bg-secondary/50 dark:bg-secondary/50
                           transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)]
                           rounded-full
                           cursor-pointer"
              />
              <div
                className={`
                           absolute
                           w-[24px] h-[24px]
                           rounded-full
                           flex items-center justify-center
                           transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)]
                          shadow-md
                          ${isAnimating ? "scale-90" : "scale-100"}
                          ${
                            resolvedTheme === "dark"
                              ? "left-full -translate-x-[22px] -translate-y-1/2 top-1/2 bg-primary"
                              : "left-0 translate-x-[-2px] -translate-y-1/2 top-1/2 bg-background"
                          }
                           cursor-pointer
                          hover:scale-105
                           `}
              >
                {resolvedTheme === "dark" ? (
                  <span className="text-sm text-white transform transition-transform duration-300">
                    🌙
                  </span>
                ) : (
                  <span className="text-sm transform transition-transform duration-300 text-primary">
                    ☀️
                  </span>
                )}
              </div>
            </div>

            <a href="/" className="flex items-center">
              <FadeIn>
                <Image
                  className="h-[22px] md:h-[26px] w-auto transform transition-transform duration-300 hover:scale-105"
                  src={`https://droomdroom.com/price/DroomDroom_${
                    resolvedTheme === "light" ? "Black" : "White"
                  }.svg`}
                  alt="DroomDroom Logo"
                  width={180}
                  height={30}
                  priority
                />
              </FadeIn>
            </a>
          </Flex>
        </div>

        <div className="w-full bg-background border-b border-border">
          <Container>
            <nav
              className="flex justify-evenly items-center py-1 overflow-auto thin-scrollbar"
              ref={navbarContentRef}
            >
              <ul className="flex items-center justify-center space-x-2 md:space-x-4 lg:space-x-5">
                {menus.length > 0 &&
                  menus.map((item, index) => (
                    <li
                      key={`${item.text}-${index}`}
                      className="flex-shrink-0 relative"
                      style={{
                        zIndex: item.type === "dropdown" ? 2000 : "auto",
                      }}
                    >
                      {item.type === "link" ? (
                        <button
                          onClick={() => handleNavClick(item.url!)}
                          className={cn(
                            "relative font-bold text-sm sm:text-base md:text-lg whitespace-nowrap p-1 group",
                            "text-foreground hover:text-primary dark:hover:text-primary transition-colors duration-300 ease-in-out",
                            "rounded-lg overflow-hidden"
                          )}
                        >
                          <span className="relative z-10 transition-transform duration-300 ease-in-out group-hover:scale-105">
                            {item.text}
                          </span>
                        </button>
                      ) : item.type === "dropdown" &&
                        item.items &&
                        item.items.length > 0 ? (
                        <div
                          onMouseEnter={() => handleDropdownEnter(item.text)}
                          onMouseLeave={() => handleDropdownLeave(item.text)}
                          className="relative"
                          style={{ zIndex: 2000 }}
                        >
                          <button
                            ref={(el) => {
                              triggerRefs.current[item.text] = el;
                            }}
                            onClick={() => handleDropdownToggle(item.text)}
                            className={cn(
                              "flex items-center px-3 py-2 text-lg font-semibold text-foreground bg-transparent border-none cursor-pointer whitespace-nowrap relative",
                              "hover:text-primary transition-colors duration-300 ease-in-out",
                              "md:text-lg sm:text-base text-sm md:px-3 md:py-2 sm:px-2.5 sm:py-1.5 px-2 py-1"
                            )}
                            aria-expanded={openDropdowns[item.text] || false}
                            aria-label={`Toggle ${item.text} menu`}
                          >
                            <span className="inline-block transition-transform duration-300 ease-in-out hover:scale-105">
                              {item.text}
                            </span>
                            <div className="ml-1 transition-transform duration-200 ease-in-out">
                              {openDropdowns[item.text] ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </div>
                          </button>
                        </div>
                      ) : null}
                    </li>
                  ))}
              </ul>
            </nav>
          </Container>
        </div>

        {/* Render dropdowns outside of navigation */}
        {menus.map(
          (item, index) =>
            item.type === "dropdown" &&
            item.items &&
            item.items.length > 0 &&
            openDropdowns[item.text] && (
              <div
                key={`dropdown-${item.text}`}
                ref={(el) => {
                  dropdownRefs.current[item.text] = el;
                }}
                className={cn(
                  "fixed bg-background border shadow-md rounded-md w-auto",
                  resolvedTheme === "dark"
                    ? "border-border/50 text-foreground"
                    : "border-gray-200 text-gray-900"
                )}
                style={{ zIndex: 2001 }}
                onMouseEnter={() => handleDropdownContentEnter(item.text)}
                onMouseLeave={() => handleDropdownContentLeave(item.text)}
              >
                {item.items.map((subItem, subIndex) => (
                  <button
                    key={subIndex}
                    onClick={() => {
                      handleNavClick(subItem.url);
                      setOpenDropdowns((prev) => ({
                        ...prev,
                        [item.text]: false,
                      }));
                    }}
                    className={cn(
                      "block w-full text-left text-sm px-4 py-2 whitespace-nowrap",
                      resolvedTheme === "dark"
                        ? "text-foreground hover:bg-primary/20 hover:text-primary"
                        : "text-gray-700 hover:bg-gray-100 hover:text-primary",
                      "first:rounded-t-md last:rounded-b-md"
                    )}
                    aria-label={`Go to ${subItem.text}`}
                  >
                    {subItem.text}
                  </button>
                ))}
              </div>
            )
        )}

        {tokens && tokens.length > 0 && (
          <MarqueeScroll
            tokens={tokens.length < 8 ? [...tokens, ...tokens] : tokens}
          />
        )}
      </div>
    </header>
  );
}