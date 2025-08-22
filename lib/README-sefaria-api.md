# Sefaria API

This module provides a clean interface to the Sefaria API, following the pattern shown in the sample.

## Installation

The API is already integrated into the project. No additional installation is required.

## Usage

### Basic Usage

```typescript
import { sefaria } from "./sefaria-api";

// Get the Sefaria index
sefaria
  .getIndex()
  .then((data) => console.log(data))
  .catch((err) => console.error(err));
```

### Advanced Usage

```typescript
import { sefaria } from "./sefaria-api";

async function example() {
  try {
    // Get the index
    const indexData = await sefaria.getIndex();
    console.log("Index loaded:", indexData.title);

    // Get text for a specific reference
    const textData = await sefaria.getText("Genesis.1.1");
    console.log("Text:", textData.text);

    // Get text with commentary
    const commentaryData = await sefaria.getTextWithCommentary("Genesis.1.1");
    console.log("Commentary:", commentaryData);

    // Navigate the library structure
    const topCategories = sefaria.getTopLevelCategories(indexData);
    console.log(
      "Top categories:",
      topCategories.map((cat) => cat.title)
    );
  } catch (error) {
    console.error("Error:", error);
  }
}
```

## API Methods

### `sefaria.getIndex()`

Returns the complete Sefaria library index.

**Returns:** `Promise<SefariaContent>`

### `sefaria.getText(ref: string, lang?: string)`

Gets text for a specific reference.

**Parameters:**

- `ref`: The text reference (e.g., 'Genesis.1.1')
- `lang`: Language code (default: 'en')

**Returns:** `Promise<SefariaTextResponse>`

### `sefaria.getTextWithCommentary(ref: string, lang?: string, lang2?: string)`

Gets text with commentary for a specific reference.

**Parameters:**

- `ref`: The text reference
- `lang`: Primary language (default: 'en')
- `lang2`: Secondary language (default: 'en')

**Returns:** `Promise<SefariaTextResponse>`

### `sefaria.getTopLevelCategories(data: SefariaContent)`

Gets all top-level categories from the index data.

**Returns:** `SefariaContent[]`

### `sefaria.getSubcategories(data: SefariaContent, categoryName: string)`

Gets subcategories for a specific category.

**Returns:** `SefariaContent[]`

### `sefaria.getBooks(data: SefariaContent, categoryPath: string[])`

Gets books for a specific category path.

**Returns:** `SefariaContent[]`

## Data Types

### `SefariaContent`

Represents a content item in the Sefaria library.

### `SefariaTextResponse`

Represents a text response from the API.

### `SefariaIndexResponse`

Represents an index response from the API.

## Caching

The API automatically caches the index data to improve performance. The cache is stored in memory and persists for the lifetime of the application.

## Error Handling

All methods throw errors when API calls fail. Wrap calls in try-catch blocks to handle errors gracefully.

```typescript
try {
  const data = await sefaria.getIndex();
  // Handle success
} catch (error) {
  console.error("Failed to load Sefaria data:", error);
  // Handle error
}
```
