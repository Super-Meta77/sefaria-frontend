"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SidebarContainer } from "@/components/sidebar-container";
import { PageHeader } from "@/components/page-header";
import { useLanguage } from "@/components/language-context";
import { ContentLanguageProvider, useOptionalContentLanguage } from "@/components/content-language-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BookData {
  title: string;
  heTitle?: string;
  categories?: string[];
  schema?: {
    lengths: number[];
    titles: Array<{
      text: string;
      lang: string;
      primary?: boolean;
    }>;
  };
  alts?: {
    Parasha?: {
      nodes: Array<{
        title: string;
        heTitle: string;
        wholeRef: string;
        refs: string[];
      }>;
    };
  };
  enDesc?: string;
  heDesc?: string;
  enShortDesc?: string;
  heShortDesc?: string;
  authors?: string[];
  compDate?: number[];
  pubDate?: number[];
  contents?: Array<{
    title: string;
    base_text_titles?: string[];
    enShortDesc?: string;
    heShortDesc?: string;
    categories?: string[];
    heTitle?: string;
  }>;
  category?: string;
  order?: number;
  relatedTopics?: Array<{
    slug: string;
    title: {
      en: string;
      he: string;
    };
  }>;
}

export default function BookPage() {
  return (
    <ContentLanguageProvider>
      <BookPageInner />
    </ContentLanguageProvider>
  );
}

function BookPageInner() {
  const params = useParams<{ category: string; book: string }>();
  const { effectiveLanguage } = useOptionalContentLanguage();
  const [bookData, setBookData] = useState<BookData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("contents");

  useEffect(() => {
    const fetchBookData = async () => {
      if (!params.book) return;

      try {
        setLoading(true);
        setError(null);

        const storedData = sessionStorage.getItem(
          `book-${params.category}-${params.book}`
        );
        if (storedData) {
          const contentData = JSON.parse(storedData);
          console.log("Book data from sessionStorage:", contentData);
          console.log("Contents property:", contentData.contents);
          setBookData(contentData);
          setLoading(false);
          return;
        }

        // Convert URL-friendly book name back to title
        const bookTitle = params.book
          .replace(/-/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase());

        const response = await fetch(
          `https://www.sefaria.org/api/v2/index/${encodeURIComponent(
            bookTitle
          )}?with_content_counts=1&with_related_topics=1`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch book data: ${response.status}`);
        }

        const data = await response.json();
        console.log("Book data from API:", data);
        console.log("Contents property from API:", data.contents);
        setBookData(data);
      } catch (err) {
        console.error("Error fetching book data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load book data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBookData();
  }, [params.book, params.category]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-[84rem] mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading book...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !bookData) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-[84rem] mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Book Not Found
            </h1>
            <p className="text-gray-600 mb-4">
              {error || "The requested book could not be found."}
            </p>
            <Link href="/texts" className="text-blue-600 hover:text-blue-800">
              ← Back to Library
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isContentList = bookData?.contents && bookData.contents.length > 0;
  console.log("Is content list:", isContentList);
  console.log("Contents array length:", bookData?.contents?.length);
  const chapterCount = bookData?.schema?.lengths?.[0] || 0;
  const chapters = Array.from({ length: chapterCount }, (_, i) => i + 1);
  const torahPortions = bookData?.alts?.Parasha?.nodes || [];
  const bookTitle =
    bookData?.title ||
    params.book
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[84rem] mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2" dir={effectiveLanguage === "he" ? "rtl" : "ltr"}>
            {/* Header */}
            <div className="mb-6">

              <PageHeader 
                title={effectiveLanguage === "he" ? (bookData?.heTitle || bookData?.title) : (bookData?.title ||
                  params.book
                    .replace(/-/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase()))}
                hebrewTitle={bookData?.heTitle}
                movable={true}
              />
              {!isContentList && (
                <Button className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-2">
                  Start Reading
                </Button>
              )}
            </div>

            {isContentList ? (
              // Content List View (like Aramaic Targum)
              <div className="space-y-6">
                <div className="text-sm text-gray-600 uppercase tracking-wide mb-4">
                  {bookData?.category || "WRITINGS"}
                </div>
                <div className="grid grid-cols-2 gap-8">
                  {bookData?.contents?.map((item, index) => {
                    console.log(`Content item ${index}:`, item);
                    return (
                      <div key={index} className="space-y-2">
                        <Link
                          href={`/texts/${params.category}/${item.title.replace(/\s+/g, "-")}`}
                          className="text-blue-600 hover:text-blue-800 font-medium text-lg transition-colors block"
                        >
                          {item.base_text_titles?.[0] || item.title}
                        </Link>
                        {item.enShortDesc && (
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {item.enShortDesc}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              // Individual Book View (like Genesis)
              <>
                {/* Tabs */}
                <div className="border-b border-gray-200 mb-6">
                  <div className="flex space-x-8">
                    <button
                      onClick={() => setActiveTab("contents")}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === "contents"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                    >
                      Contents
                    </button>
                    <button
                      onClick={() => setActiveTab("versions")}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === "versions"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                    >
                      Versions
                    </button>
                  </div>
                </div>

                {/* Tab Content */}
                {activeTab === "contents" && (
                  <div className="space-y-8">
                    {/* Chapters */}
                    {chapterCount > 0 && (
                      <div>
                        <h3 className="text-2xl font-medium text-gray-900 mb-4">
                          Chapters
                        </h3>
                        <div className="-mx-1 overflow-x-auto">
                          <div
                            className="grid gap-2 min-w-max px-1"
                            style={{ gridTemplateColumns: "repeat(11, minmax(0, 1fr))" }}
                            role="list"
                          >
                            {chapters.map((chapter) => (
                              <Link
                                key={chapter}
                                href={`/${params.book}.${chapter}`}
                                className="w-12 h-12 border border-gray-300 rounded flex items-center justify-center text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                                aria-label={`${bookTitle} chapter ${chapter}`}
                                role="listitem"
                              >
                                {chapter}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Torah Portions */}
                    {torahPortions.length > 0 && (
                      <div>
                        <h3 className="text-2xl font-medium text-gray-900 mb-4">
                          Torah Portions
                        </h3>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                          {torahPortions.map((portion, index) => {
                            // Extract chapter numbers from refs
                            const chapterNumbers = portion.refs.map(ref => {
                              const match = ref.match(/(\d+):/);
                              return match ? parseInt(match[1]) : null;
                            }).filter(num => num !== null);
                            
                            return (
                              <div key={index} className="space-y-1">
                                <h3 className="text-xl font-medium text-gray-900 font-times">
                                  {effectiveLanguage === "he" ? portion.heTitle : portion.title}
                                </h3>
                                <div className="flex flex-wrap gap-1">
                                  <Link
                                      href={`/texts/${params.category}/${params.book}/1`}
                                      className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                                    >
                                      1
                                  </Link>
                                  <Link
                                      href={`/texts/${params.category}/${params.book}/2`}
                                      className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                                    >
                                      2
                                  </Link>
                                  <Link
                                      href={`/texts/${params.category}/${params.book}/3`}
                                      className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                                    >
                                      3
                                  </Link>
                                  <Link
                                      href={`/texts/${params.category}/${params.book}/4`}
                                      className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                                    >
                                      4
                                  </Link>
                                  <Link
                                      href={`/texts/${params.category}/${params.book}/5`}
                                      className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                                    >
                                      5
                                  </Link>
                                  <Link
                                      href={`/texts/${params.category}/${params.book}/6`}
                                      className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                                    >
                                      6
                                  </Link>
                                  <Link
                                      href={`/texts/${params.category}/${params.book}/7`}
                                      className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                                    >
                                      7
                                  </Link>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "versions" && (
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      Version information would be displayed here.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar: keep original book page sidebar content, wrapped in standardized container */}
          <div className="lg:col-span-1">
            <SidebarContainer>
              {/* About This Text */}
              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-3 border-b border-gray-200 pb-2">About This Text</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {bookData?.enDesc || "No description available."}
                </p>
              </div>

              {/* Related Topics */}
              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-3 border-b border-gray-200 pb-2">Related Topics</h3>
                <div className="space-y-2">
                  {bookData?.relatedTopics && bookData.relatedTopics.length > 0 ? (
                    bookData.relatedTopics.map((topic, index) => (
                      <Link
                        key={index}
                        href={`/texts/${topic.slug}`}
                        className="block text-sm text-blue-600 hover:text-blue-800"
                      >
                        {topic.title.en}
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm text-gray-600">No related topics available.</p>
                  )}
                </div>
              </div>

              {/* Download Text */}
              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-3 border-b border-gray-200 pb-2">Download Text</h3>
                <div className="space-y-3">
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Version" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hebrew">Hebrew Masoretic</SelectItem>
                      <SelectItem value="english">English Translation</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="txt">Plain Text</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" className="w-full bg-transparent">Download</Button>
                </div>
              </div>
            </SidebarContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
