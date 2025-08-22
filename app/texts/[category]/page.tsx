"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLibraryData } from "@/components/data-provider";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { SidebarContainer } from "@/components/sidebar-container";
import { PageHeader } from "@/components/page-header";
import { useLocalizedContent } from "@/hooks/use-localized-content";
import { useLanguage } from "@/components/language-context";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function CategoryPage() {
  const params = useParams<{ category: string }>();
  const { data, status, error } = useLibraryData();
  const { language } = useLanguage();

  const categoryItem = useMemo(() => {
    const slug = Array.isArray(params.category)
      ? params.category[0]
      : params.category;
    const lower = (slug || "").toLowerCase();
    return data.find((i) => i.category.toLowerCase() === lower);
  }, [data, params.category]);

  const hasTabs = useMemo(() => {
    if (!categoryItem?.contents) return false;

    // Check for Talmud tabs (Bavli/Yerushalmi)
    const hasTalmudTabs = categoryItem.contents.some(
      (content: any) =>
        content.category &&
        (content.category === "Bavli" || content.category === "Yerushalmi")
    );

    // Check for Tosefta tabs (any contents with category property for Tosefta)
    const hasToseftaTabs =
      categoryItem.category.toLowerCase() === "tosefta" &&
      categoryItem.contents.some((content: any) => content.category);

    return hasTalmudTabs || hasToseftaTabs;
  }, [categoryItem]);

  const [activeTab, setActiveTab] = useState<string>("");

  useMemo(() => {
    if (hasTabs && categoryItem?.contents && activeTab === "") {
      const firstTab = categoryItem.contents.find(
        (content: any) => content.category
      );
      if (firstTab) {
        setActiveTab(firstTab.category);
      }
    }
  }, [hasTabs, categoryItem, activeTab]);

  const activeTabContent = useMemo(() => {
    if (!hasTabs || !categoryItem?.contents) return null;
    return categoryItem.contents.find(
      (content: any) => content.category === activeTab
    );
  }, [hasTabs, categoryItem, activeTab]);

  const loading = status === "loading";

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-[84rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading */}
        {loading && (
          <div
            className="flex flex-col items-center justify-center py-16"
            role="status"
            aria-live="polite"
          >
            <LoadingSpinner size="lg" text="Loading..." />
          </div>
        )}

        {!loading && error && (
          <div className="text-center text-red-600">{error}</div>
        )}

        {!loading && !error && !categoryItem && (
          <div className="text-center text-gray-700">Category not found.</div>
        )}

        {!loading && !error && categoryItem && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div
              className="lg:col-span-2"
              dir={language === "he" ? "rtl" : "ltr"}
            >
              <PageHeader
                title={(categoryItem.category || "").toUpperCase()}
                hebrewTitle={categoryItem.heCategory?.toUpperCase()}
                movable={true}
              />

              {hasTabs && categoryItem.contents && (
                <div className="mt-6">
                  <div className="flex space-x-8 border-b border-gray-200">
                    {categoryItem.contents.map((content: any) => {
                      if (!content.category) return null;
                      const isActive = activeTab === content.category;
                      return (
                        <button
                          key={content.category}
                          onClick={() => setActiveTab(content.category)}
                          className={`pb-3 px-1 text-sm font-medium transition-colors ${
                            isActive
                              ? "text-gray-900 border-b-2 border-gray-900"
                              : "text-gray-500 hover:text-gray-700"
                          }`}
                        >
                          {content.category.toUpperCase()}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mt-8">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-8"
                >
                  {hasTabs && activeTabContent ? (
                    // Display active tab content
                    <>
                      {(activeTabContent.enShortDesc ||
                        activeTabContent.heShortDesc) && (
                        <motion.div variants={itemVariants}>
                          <p className="text-lg italic text-gray-600 mb-8">
                            {language === "he" && activeTabContent.heShortDesc
                              ? activeTabContent.heShortDesc
                              : activeTabContent.enShortDesc}
                          </p>
                        </motion.div>
                      )}

                      {(activeTabContent.contents ?? []).map(
                        (entry: any, idx: number) => {
                          const title =
                            entry.title || entry.category || "Untitled";
                          const desc = entry.enShortDesc || "";
                          const children = Array.isArray(entry.contents)
                            ? (entry.contents as any[])
                            : [];

                          return (
                            <motion.div
                              key={`${title}-${idx}`}
                              variants={itemVariants}
                            >
                              {/* Section header */}
                              <div className="mb-6 border-b border-gray-200 pb-4">
                                <h2 className="text-m font-medium text-gray-600 uppercase tracking-wider mb-4">
                                  {language === "en" ? title : entry.heTitle}
                                </h2>
                                {desc && (
                                  <p className="text-sm text-gray-500 italic mb-6">
                                    {language === "en" ? desc : entry.heShortDesc}
                                  </p>
                                )}
                              </div>

                              {/* Books in two-column grid */}
                              {children.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-8">
                                  {children.map((child, cidx) => {
                                    const childTitle =
                                      child.title ||
                                      child.category ||
                                      "Untitled";
                                    const childDesc = child.enShortDesc || "";
                                    return (
                                      <Card
                                        key={`${childTitle}-${cidx}`}
                                        className="hover:shadow-md transition-shadow cursor-pointer group"
                                      >
                                        <CardHeader className="pb-2">
                                          <CardTitle className="text-lg">
                                            <Link
                                              href={`/texts/${categoryItem.category.toLowerCase()}/${childTitle
                                                .toLowerCase()
                                                .replace(/\s+/g, "-")}`}
                                              className="text-blue-600 hover:text-blue-800 font-medium transition-colors group-hover:text-blue-800"
                                            >
                                              {language === "en"
                                                ? childTitle
                                                : child.heTitle}
                                            </Link>
                                          </CardTitle>
                                        </CardHeader>
                                        {childDesc && (
                                          <CardContent className="pt-0">
                                            <CardDescription className="text-sm text-gray-600 leading-relaxed">
                                              {language === "en"
                                                ? childDesc
                                                : child.heShortDesc}
                                            </CardDescription>
                                          </CardContent>
                                        )}
                                      </Card>
                                    );
                                  })}
                                </div>
                              )}
                            </motion.div>
                          );
                        }
                      )}
                    </>
                  ) : (
                    // Display regular category content (existing logic)
                    (categoryItem.contents ?? []).map(
                      (entry: any, idx: number) => {
                        const title =
                          entry.title || entry.category || "Untitled";
                        const desc = entry.enShortDesc || "";
                        const children = Array.isArray(entry.contents)
                          ? (entry.contents as any[])
                          : [];

                        return (
                          <motion.div
                            key={`${title}-${idx}`}
                            variants={itemVariants}
                          >
                            {/* Section header */}
                            <div className="mb-6 border-b border-gray-200">
                              <h2 className="text-xl font-medium text-gray-600 uppercase tracking-wider mb-2">
                                {title}
                              </h2>
                              {desc && (
                                <p className="text-sm text-gray-500 italic mb-2">
                                  {desc}
                                </p>
                              )}
                            </div>

                            {/* Books in two-column grid */}
                            {children.length > 0 && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-8">
                                {children.map((child, cidx) => {
                                  const childTitle =
                                    child.title || child.category || "Untitled";
                                  const childDesc = child.enShortDesc || "";
                                  return (
                                    <Card
                                      key={`${childTitle}-${cidx}`}
                                      className="hover:shadow-md transition-shadow cursor-pointer group"
                                    >
                                      <Link
                                        href={`/texts/${categoryItem.category.toLowerCase()}/${childTitle
                                          .toLowerCase()
                                          .replace(/\s+/g, "-")}`}
                                        className="text-blue-600 hover:text-blue-800 font-medium transition-colors group-hover:text-blue-800"
                                      >
                                        <CardHeader className="pb-2">
                                          <CardTitle className="text-xl font-medium">
                                            {language === "en"
                                              ? childTitle
                                              : child.heTitle}
                                          </CardTitle>
                                        </CardHeader>
                                        {childDesc && (
                                          <CardContent className="pt-0">
                                            <CardDescription className="text-m text-gray-600 leading-relaxed">
                                              {language === "en"
                                                ? childDesc
                                                : child.heShortDesc}
                                            </CardDescription>
                                          </CardContent>
                                        )}
                                      </Link>
                                    </Card>
                                  );
                                })}
                              </div>
                            )}
                          </motion.div>
                        );
                      }
                    )
                  )}
                </motion.div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <SidebarContainer>
                {/* About section */}
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-3 border-b border-gray-200 pb-2 ">
                    About {categoryItem.category}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {hasTabs && activeTabContent?.enDesc
                      ? activeTabContent.enDesc
                      : categoryItem.enShortDesc ||
                        `Explore the ${categoryItem.category} collection and its various texts.`}
                  </p>
                </div>

                {/* Weekly Torah Portion - only show for Tanakh */}
                {categoryItem.category.toLowerCase() === "tanakh" && (
                  <div>
                    <h3 className="text-xl font-medium text-gray-900 mb-3 border-b border-gray-200 pb-2">
                      Weekly Torah Portion
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-[18px] font-medium text-gray-700 mb-1">
                          Eikev
                        </p>
                        <p className="text-[18px] text-gray-600">
                          {" "}
                          <img
                            src="/icons/book.svg"
                            className="navSidebarIcon size-[20px] inline-block"
                            alt="book icon"
                          />{" "}
                          Deuteronomy 7:12-11:25
                        </p>
                      </div>
                      <div>
                        <p className="text-[18px] font-medium text-gray-700 mb-1">
                          Haftarah
                        </p>
                        <p className="text-[18px] text-gray-600">
                          {" "}
                          <img
                            src="/icons/book.svg"
                            className="navSidebarIcon size-[20px] inline-block"
                            alt="book icon"
                          />{" "}
                          Isaiah 49:14-51:3
                        </p>
                      </div>
                      <Link
                        href="#"
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        All Portions ›
                      </Link>
                    </div>
                  </div>
                )}

                {/* Visualizations - only show for Tanakh */}
                {categoryItem.category.toLowerCase() === "tanakh" && (
                  <div>
                    <h3 className="text-xl font-medium text-gray-900 mb-3 border-b border-gray-200 pb-2">
                      Visualizations
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Explore interconnections among texts with our interactive
                      visualizations.
                    </p>
                    <div className="space-y-2">
                      <Link
                        href="#"
                        className="block text-sm text-blue-600 hover:text-blue-800"
                      >
                        <span className="inline-flex items-center text-[16px]">
                          <img
                            src="/icons/visualization.svg"
                            className="navSidebarIcon size-[16px]"
                            alt="book icon"
                          />
                          &nbsp; Tanakh & Talmud
                        </span>
                      </Link>
                      <Link
                        href="#"
                        className="block text-sm text-blue-600 hover:text-blue-800"
                      >
                        <span className="inline-flex items-center text-[16px]">
                          <img
                            src="/icons/visualization.svg"
                            className="navSidebarIcon size-[16px]"
                            alt="book icon"
                          />
                          &nbsp; Tanakh & Midrash Rabbah
                        </span>
                      </Link>
                      <Link
                        href="#"
                        className="block text-sm text-blue-600 hover:text-blue-800"
                      >
                        <span className="inline-flex items-center text-[16px]">
                          <img
                            src="/icons/visualization.svg"
                            className="navSidebarIcon size-[16px]"
                            alt="book icon"
                          />
                          &nbsp; Tanakh & Mishneh Torah
                        </span>
                      </Link>
                      <Link
                        href="#"
                        className="block text-sm text-blue-600 hover:text-blue-800"
                      >
                        <span className="inline-flex items-center text-[16px]">
                          <img
                            src="/icons/visualization.svg"
                            className="navSidebarIcon size-[16px]"
                            alt="book icon"
                          />
                          &nbsp; Tanakh & Shulchan Arukh
                        </span>
                      </Link>
                      <Link
                        href="#"
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        All Visualizations ›
                      </Link>
                    </div>
                  </div>
                )}

                {/* Support Sefaria */}
                <div>
                  <h3 className="text-xl font-medium text-gray-900 mb-3 border-b border-gray-200 pb-2">
                    Support Sefaria
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                    Sefaria is an open source, nonprofit project. Support us by
                    making a tax-deductible donation.
                  </p>
                  {/* Button preserved from original page styling/content */}
                  <a
                    href="#"
                    className="inline-flex items-center justify-center w-full bg-blue-900 hover:bg-blue-800 text-white h-10 rounded-md text-sm"
                  >
                    ♡ Make a Donation
                  </a>
                </div>
              </SidebarContainer>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
