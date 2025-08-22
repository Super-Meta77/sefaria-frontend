import { sefaria } from "./sefaria-api";

// Example usage following the pattern from the sample
async function exampleUsage() {
  try {
    // Get the Sefaria index (equivalent to the sample's getIndex())
    const data = await sefaria.getIndex();
    console.log("Sefaria Index Data:", data);

    // Get text for a specific reference
    const textData = await sefaria.getText("Genesis.1.1");
    console.log("Text Data:", textData);

    // Get text with commentary
    const commentaryData = await sefaria.getTextWithCommentary("Genesis.1.1");
    console.log("Commentary Data:", commentaryData);
  } catch (error) {
    console.error("Error:", error);
  }
}

// Export the example function
export { exampleUsage };

// You can also use it directly like this:
// sefaria.getIndex()
//   .then(({ data }) => console.log(data))
//   .catch(err => console.error(err))
