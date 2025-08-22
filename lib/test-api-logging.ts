import { sefaria } from "./sefaria-api";

// Test script to demonstrate API data structure logging
async function testAPILogging() {
  console.log("🚀 [Test] Starting Sefaria API data structure logging test...");

  try {
    // Test 1: Get index data
    console.log("\n📚 [Test] Testing getIndex() data structure...");
    const indexData = await sefaria.getIndex();
    console.log("✅ [Test] Index data retrieved successfully");

    // Test 2: Get text data
    console.log("\n📖 [Test] Testing getText() data structure...");
    const textData = await sefaria.getText("Genesis.1.1");
    console.log("✅ [Test] Text data retrieved successfully");

    // Test 3: Get text with commentary
    console.log(
      "\n📖 [Test] Testing getTextWithCommentary() data structure..."
    );
    const commentaryData = await sefaria.getTextWithCommentary("Genesis.1.1");
    console.log("✅ [Test] Commentary data retrieved successfully");

    console.log("\n🎉 [Test] All API tests completed successfully!");
  } catch (error) {
    console.error("❌ [Test] Error during API testing:", error);
  }
}

// Export the test function
export { testAPILogging };

// You can run this test by calling:
// testAPILogging();
