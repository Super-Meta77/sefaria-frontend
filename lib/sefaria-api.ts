export interface SefariaContent {
  title: string;
  heTitle?: string;
  category: string;
  heCategory?: string;
  enDesc?: string;
  heDesc?: string;
  enShortDesc?: string;
  heShortDesc?: string;
  order?: number;
  enComplete?: boolean;
  heComplete?: boolean;
  searchRoot?: string;
  contents?: SefariaContent[];
  categories?: string[];
  dependence?: string;
  primary_category?: string;
  collectiveTitle?: string;
  heCollectiveTitle?: string;
  commentator?: string;
  heCommentator?: string;
  base_text_titles?: string[];
  base_text_mapping?: string;
  base_text_order?: number;
}

export interface SefariaIndexResponse {
  body: SefariaContent;
  [key: string]: any;
}

export interface SefariaTextResponse {
  text: string[];
  he: string[];
  versions: Array<{
    versionTitle: string;
    versionSource: string;
    language: string;
  }>;
  sectionNames: string[];
  addressTypes: string[];
  sections: number[];
  toSections: number[];
  ref: string;
  heRef: string;
  book: string;
  categories: string[];
  order: number[];
  next?: string;
  prev?: string;
}

class SefariaAPI {
  private baseUrl = "https://www.sefaria.org/api";
  private cache = new Map<string, any>();

  async getIndex(): Promise<SefariaContent> {
    const cacheKey = "sefaria-index";

    if (this.cache.has(cacheKey)) {
      console.log("✅ [SefariaAPI] Cache hit! Returning cached data");
      return this.cache.get(cacheKey);
    }

    try {
      console.log("🌐 [SefariaAPI] Fetching index from API...");
      const response = await fetch(`${this.baseUrl}/index`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const rawData = await response.json();

      // ===== COMPREHENSIVE DATA STRUCTURE LOGGING =====
      console.log("🔍 [SefariaAPI] ===== RAW API RESPONSE STRUCTURE =====");
      console.log("📊 [SefariaAPI] Raw data type:", typeof rawData);
      console.log("📊 [SefariaAPI] Raw data is array:", Array.isArray(rawData));
      console.log("📊 [SefariaAPI] Raw data keys:", Object.keys(rawData));
      console.log(
        "📊 [SefariaAPI] Raw data length:",
        Array.isArray(rawData) ? rawData.length : "N/A"
      );

      // Show the first 2000 characters of the raw data
      console.log("📊 [SefariaAPI] Raw data preview (first 2000 chars):");
      console.log(JSON.stringify(rawData, null, 2).substring(0, 2000));

      // If there's a body property, analyze it
      if (rawData && typeof rawData === "object" && "body" in rawData) {
        console.log("🎯 [SefariaAPI] ===== BODY PROPERTY ANALYSIS =====");
        const body = rawData.body;
        console.log("📊 [SefariaAPI] Body type:", typeof body);
        console.log("📊 [SefariaAPI] Body is array:", Array.isArray(body));
        console.log("📊 [SefariaAPI] Body keys:", Object.keys(body));

        if (body && typeof body === "object" && !Array.isArray(body)) {
          console.log(
            "📊 [SefariaAPI] Body contents length:",
            body.contents?.length || 0
          );
          console.log("📊 [SefariaAPI] Body title:", body.title);
          console.log("📊 [SefariaAPI] Body category:", body.category);
          console.log(
            "📊 [SefariaAPI] Body description:",
            body.enDesc?.substring(0, 100) + "..."
          );

          // Show first few contents items
          if (body.contents && Array.isArray(body.contents)) {
            console.log("📊 [SefariaAPI] First 3 contents items:");
            body.contents.slice(0, 3).forEach((item: any, index: number) => {
              console.log(
                `  ${index + 1}. ${item.title} (${item.category}) - ${
                  item.contents?.length || 0
                } sub-items`
              );
            });
          }
        }
      }

      // Extract the actual data from the body property or use raw data
      let data: SefariaContent;
      if (Array.isArray(rawData)) {
        // If the raw data is an array, wrap it in a synthetic root SefariaContent object
        data = {
          title: "Sefaria Library Root",
          category: "Root",
          contents: rawData,
          enDesc: "The root of the Sefaria library index.",
        };
        console.log(
          "📊 [SefariaAPI] Wrapped raw array data into synthetic root object"
        );
      } else {
        // Otherwise, use rawData.body if it exists, or rawData itself
        data = rawData.body || rawData;
        console.log("📊 [SefariaAPI] Used rawData.body or rawData directly");
      }

      // ===== FINAL DATA STRUCTURE LOGGING =====
      console.log("🎯 [SefariaAPI] ===== FINAL EXTRACTED DATA STRUCTURE =====");
      console.log("📊 [SefariaAPI] Final data type:", typeof data);
      console.log("📊 [SefariaAPI] Final data keys:", Object.keys(data));
      console.log("📊 [SefariaAPI] Final data title:", data.title);
      console.log("📊 [SefariaAPI] Final data category:", data.category);
      console.log(
        "📊 [SefariaAPI] Final data description:",
        data.enDesc?.substring(0, 100) + "..."
      );
      console.log(
        "📊 [SefariaAPI] Final data contents length:",
        data.contents?.length || 0
      );

      // Show the complete structure if it's not too large
      if (JSON.stringify(data).length < 10000) {
        console.log("📊 [SefariaAPI] Complete final data structure:");
        console.log(JSON.stringify(data, null, 2));
      } else {
        console.log(
          "📊 [SefariaAPI] Final data is large, showing structure only"
        );
        console.log(
          "📊 [SefariaAPI] Data size:",
          JSON.stringify(data).length,
          "characters"
        );
      }

      // Show sample of contents if available
      if (data.contents && Array.isArray(data.contents)) {
        console.log("📊 [SefariaAPI] Sample contents (first 5 items):");
        data.contents.slice(0, 5).forEach((item: any, index: number) => {
          console.log(`  ${index + 1}. ${item.title} (${item.category})`);
          console.log(
            `     - Description: ${
              item.enDesc?.substring(0, 50) || "No description"
            }...`
          );
          console.log(`     - Sub-items: ${item.contents?.length || 0}`);
          console.log(`     - Hebrew title: ${item.heTitle || "None"}`);
          console.log(`     - Order: ${item.order || "None"}`);
        });
      }

      console.log("🔍 [SefariaAPI] ===== END DATA STRUCTURE LOGGING =====");

      // Cache the extracted data
      this.cache.set(cacheKey, data);
      console.log("✅ [SefariaAPI] Index loaded and cached successfully");
      return data;
    } catch (error) {
      console.error("❌ [SefariaAPI] Error fetching Sefaria index:", error);
      throw new Error(
        `Failed to load library data: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async getText(ref: string, lang = "en"): Promise<SefariaTextResponse> {
    console.log("📖 [SefariaAPI] getText called with ref:", ref, "lang:", lang);
    try {
      const url = `${this.baseUrl}/texts/${encodeURIComponent(
        ref
      )}?lang=${lang}&commentary=0&context=1&pad=0&wrapLinks=1`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const rawData = await response.json();

      // ===== TEXT RESPONSE DATA STRUCTURE LOGGING =====
      console.log("🔍 [SefariaAPI] ===== TEXT RESPONSE STRUCTURE =====");
      console.log("📊 [SefariaAPI] Text response type:", typeof rawData);
      console.log("📊 [SefariaAPI] Text response keys:", Object.keys(rawData));

      // Show the first 1000 characters of the text response
      console.log("📊 [SefariaAPI] Text response preview (first 1000 chars):");
      console.log(JSON.stringify(rawData, null, 2).substring(0, 1000));

      const data = rawData.body || rawData;
      console.log("✅ [SefariaAPI] getText successful");
      console.log("🔍 [SefariaAPI] ===== END TEXT RESPONSE LOGGING =====");
      return data;
    } catch (error) {
      console.error("❌ [SefariaAPI] Error fetching Sefaria text:", error);
      throw error;
    }
  }

  async getTextWithCommentary(
    ref: string,
    lang = "en",
    lang2 = "en"
  ): Promise<SefariaTextResponse> {
    console.log("📖 [SefariaAPI] getTextWithCommentary called with ref:", ref);
    try {
      const url = `${this.baseUrl}/texts/${encodeURIComponent(
        ref
      )}?lang=${lang}&lang2=${lang2}&commentary=1&context=1&pad=0&wrapLinks=1&wrapNamedEntities=1`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const rawData = await response.json();

      // ===== COMMENTARY RESPONSE DATA STRUCTURE LOGGING =====
      console.log("🔍 [SefariaAPI] ===== COMMENTARY RESPONSE STRUCTURE =====");
      console.log("📊 [SefariaAPI] Commentary response type:", typeof rawData);
      console.log(
        "📊 [SefariaAPI] Commentary response keys:",
        Object.keys(rawData)
      );

      // Show the first 1000 characters of the commentary response
      console.log(
        "📊 [SefariaAPI] Commentary response preview (first 1000 chars):"
      );
      console.log(JSON.stringify(rawData, null, 2).substring(0, 1000));

      const data = rawData.body || rawData;
      console.log("✅ [SefariaAPI] getTextWithCommentary successful");
      console.log(
        "🔍 [SefariaAPI] ===== END COMMENTARY RESPONSE LOGGING ====="
      );
      return data;
    } catch (error) {
      console.error(
        "❌ [SefariaAPI] Error fetching Sefaria text with commentary:",
        error
      );
      throw error;
    }
  }

  // Helper function to navigate the nested structure
  findCategoryPath(
    data: SefariaContent,
    targetCategory: string
  ): SefariaContent[] {
    console.log("🔍 [SefariaAPI] findCategoryPath called for:", targetCategory);
    const path: SefariaContent[] = [];

    function search(
      content: SefariaContent,
      currentPath: SefariaContent[]
    ): boolean {
      if (
        content.category === targetCategory ||
        content.title === targetCategory
      ) {
        path.push(...currentPath, content);
        return true;
      }

      if (content.contents) {
        for (const item of content.contents) {
          if (search(item, [...currentPath, content])) {
            return true;
          }
        }
      }

      return false;
    }

    search(data, []);
    return path;
  }

  // Get all categories at the top level
  getTopLevelCategories(data: SefariaContent): SefariaContent[] {
    console.log("📚 [SefariaAPI] getTopLevelCategories called");
    const result = data.contents || [];
    console.log(
      "✅ [SefariaAPI] getTopLevelCategories returning",
      result.length,
      "categories"
    );
    return result;
  }

  // Get subcategories for a given category
  getSubcategories(
    data: SefariaContent,
    categoryName: string
  ): SefariaContent[] {
    console.log("🔍 [SefariaAPI] getSubcategories called for:", categoryName);

    const path = this.findCategoryPath(data, categoryName);
    const targetCategory = path[path.length - 1];

    if (!targetCategory || !targetCategory.contents) {
      console.log("❌ [SefariaAPI] No subcategories found for:", categoryName);
      return [];
    }

    // Filter out items that have their own contents (subcategories) vs final books
    const subcategories = targetCategory.contents.filter(
      (item) => item.contents && item.contents.length > 0
    );
    console.log(
      "✅ [SefariaAPI] Found",
      subcategories.length,
      "subcategories for:",
      categoryName
    );
    return subcategories;
  }

  // Get books for a given category/subcategory
  getBooks(data: SefariaContent, categoryPath: string[]): SefariaContent[] {
    console.log("📖 [SefariaAPI] getBooks called for path:", categoryPath);

    let current = data;

    for (const category of categoryPath) {
      console.log("🔍 [SefariaAPI] Looking for category:", category);
      const found = this.findInContents(current, category);
      if (!found) {
        console.log("❌ [SefariaAPI] Category not found:", category);
        return [];
      }
      console.log("✅ [SefariaAPI] Found category:", category);
      current = found;
    }

    if (!current.contents) {
      console.log("❌ [SefariaAPI] No contents in final category");
      return [];
    }

    // Return items that don't have subcategories (final books)
    const books = current.contents.filter(
      (item) => !item.contents || item.contents.length === 0
    );
    console.log("✅ [SefariaAPI] Found", books.length, "books");
    return books;
  }

  private findInContents(
    data: SefariaContent,
    targetName: string
  ): SefariaContent | null {
    console.log("🔍 [SefariaAPI] findInContents looking for:", targetName);

    if (!data.contents) {
      console.log("❌ [SefariaAPI] No contents to search in");
      return null;
    }

    for (const item of data.contents) {
      if (item.category === targetName || item.title === targetName) {
        console.log("✅ [SefariaAPI] Found item:", item.title || item.category);
        return item;
      }
    }

    console.log("❌ [SefariaAPI] Item not found:", targetName);
    return null;
  }
}

// Create and export a singleton instance
export const sefaria = new SefariaAPI();

// Export the class for potential direct instantiation
export { SefariaAPI };
