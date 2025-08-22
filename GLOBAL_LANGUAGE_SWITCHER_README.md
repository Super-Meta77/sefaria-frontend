# Global Language Switcher Implementation

## Overview

This implementation adds a **global language switcher** to the Sefaria site header that allows users to change the language for the entire site. Unlike the existing language switch buttons that only affect specific page content, this switcher updates all UI elements including header, footer, navigation, and other static content.

## Features

✅ **Header "Change Language" Button**
- Located in the site header next to Help & Language icons
- Globe icon button that opens a dropdown menu
- Dropdown is properly aligned below the button

✅ **Functionality**
- Changes language for the entire site (header, footer, sidebar, navigation)
- User preference persists via localStorage/cookies
- Language selection stays consistent across page reloads and navigation

✅ **UI/UX Details**
- Dropdown menu with language options including flags and native names
- Currently active language is highlighted with a checkmark
- Smooth fade-in/out animations for the dropdown
- Responsive design that works on both desktop and mobile

✅ **Acceptance Criteria Met**
- "Change Language" button visible in header on all pages
- Clicking opens dropdown with available languages
- Selecting a language updates all UI elements
- User preference is saved and applied globally
- Consistent UX across devices

## Implementation Details

### Components Created/Modified

1. **`components/language-context.tsx`** - Enhanced language context
   - Added localStorage persistence
   - Added language options with flags and native names
   - Added helper methods for language management

2. **`components/global-language-switcher.tsx`** - New global switcher component
   - Uses Radix UI dropdown menu
   - Shows language options with flags and names
   - Highlights active language with checkmark

3. **`components/site-header.tsx`** - Updated header
   - Replaced old toggle button with new global switcher
   - Applied translations to all navigation items
   - Applied translations to search placeholder and buttons

4. **`components/footer.tsx`** - Updated footer
   - Applied translations to language section
   - Removed old language links (replaced by global switcher)

5. **`lib/translations.ts`** - New translations file
   - Contains all UI text in English and Hebrew
   - Provides helper functions for getting translations

6. **`components/dynamic-lang-attribute.tsx`** - New component
   - Dynamically updates HTML lang attribute
   - Ensures proper accessibility and SEO

### Language Options

Currently supports:
- **English** 🇺🇸 - Default language
- **Hebrew** 🇮🇱 - Full RTL support with Hebrew font

### How to Add More Languages

1. Add new language to `SUPPORTED_LANGUAGES` array in `language-context.tsx`:
```typescript
{
  code: "es",
  name: "Spanish",
  nativeName: "Español",
  flag: "🇪🇸"
}
```

2. Add translations to `lib/translations.ts`:
```typescript
es: {
  texts: "Textos",
  explore: "Explorar",
  // ... other translations
}
```

3. Update the `Language` type in `language-context.tsx`:
```typescript
export type Language = "en" | "he" | "es";
```

## Usage

### For Users
1. Click the globe icon in the site header
2. Select desired language from the dropdown
3. All site content will immediately update to the selected language
4. Language preference is saved and will persist across sessions

### For Developers
1. Use the `useLanguage()` hook to access current language
2. Use `getTranslation(language, key)` to get translated text
3. Language changes automatically trigger re-renders of components using the context

## Technical Notes

- **Persistence**: Uses localStorage with fallback handling
- **Hydration**: Prevents hydration mismatches by waiting for language initialization
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Performance**: Minimal re-renders, efficient context updates
- **SEO**: Dynamic HTML lang attribute updates

## Browser Support

- Modern browsers with localStorage support
- Graceful fallback for older browsers
- No JavaScript required for basic functionality

## Future Enhancements

- Add more languages (Arabic, French, etc.)
- Server-side language detection
- Language-specific content routing
- Advanced translation management system
- Language learning preferences







