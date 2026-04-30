# Browser Power Quick Start Guide

## What You Just Learned

The browser power successfully:
1. ✅ Navigated to example.com
2. ✅ Captured an accessibility snapshot showing page structure
3. ✅ Took a screenshot (saved as `example-page.png`)
4. ✅ Clicked the "Learn more" link and navigated to the IANA page

## Key Concepts

### 1. Navigation
```javascript
// Navigate to any URL
browser_navigate → url: "https://example.com"
```

### 2. Page Snapshots (Preferred for Interaction)
```javascript
// Get structured page content with element references
browser_snapshot → Returns YAML with [ref=e1], [ref=e2], etc.
```

**Why snapshots?** They provide element references (like `e6`) that you use for clicking, typing, etc.

### 3. Screenshots (For Visual Inspection)
```javascript
// Capture what the page looks like
browser_take_screenshot → filename: "my-screenshot.png", type: "png"
```

### 4. Clicking Elements
```javascript
// Use the ref from snapshot
browser_click → element: "Learn more link", ref: "e6"
```

### 5. Typing Text
```javascript
// Type into input fields
browser_type → ref: "e10", text: "Hello World", submit: false
```

### 6. Filling Forms
```javascript
// Fill multiple fields at once
browser_fill_form → fields: [
  {ref: "e5", text: "username"},
  {ref: "e7", text: "password"}
]
```

## Common Workflows

### Workflow 1: Search on a Website
1. `browser_navigate` → Go to the site
2. `browser_snapshot` → Find the search input ref
3. `browser_type` → Type search query with submit: true
4. `browser_snapshot` → See results

### Workflow 2: Monitor Network Requests
1. `browser_navigate` → Go to the page
2. `browser_network_requests` → See all API calls
   - Use `filter: "/api/.*"` to see only API requests
   - Set `requestBody: true` to see POST data

### Workflow 3: Check Console Errors
1. `browser_navigate` → Go to the page
2. `browser_console_messages` → See console logs
   - Use `level: "error"` for errors only

### Workflow 4: Test Form Submission
1. `browser_navigate` → Go to form page
2. `browser_snapshot` → Get field refs
3. `browser_fill_form` → Fill all fields
4. `browser_click` → Click submit button
5. `browser_wait_for` → Wait for success message

## Advanced Features

### Tab Management
```javascript
// List all tabs
browser_tabs → action: "list"

// Create new tab
browser_tabs → action: "create"

// Switch to tab
browser_tabs → action: "select", index: 1
```

### JavaScript Execution
```javascript
// Run custom code on the page
browser_evaluate → function: "() => document.title"
```

### Waiting for Content
```javascript
// Wait for text to appear
browser_wait_for → text: "Success!", time: 5

// Wait for text to disappear
browser_wait_for → textGone: "Loading..."
```

## CDP Fallback (When Playwright Fails)

If you see "Opening in existing browser session" error:

1. Switch to the `alternative` server
2. Use CDP tools:
   - `cdp_list_tabs` → See open tabs
   - `cdp_navigate` → Navigate a tab
   - `cdp_evaluate` → Run JavaScript
   - `cdp_screenshot` → Capture viewport

## Best Practices

✅ **Do:**
- Use `browser_snapshot` before interacting with elements
- Keep browser open between tasks (faster)
- Reuse existing tabs when possible
- Wait for page loads before clicking

❌ **Don't:**
- Use screenshots for element interaction (use snapshots)
- Close browser unnecessarily
- Guess at element selectors
- Click before page is ready

## Your Example Session

```
1. browser_navigate → https://example.com
   Result: Page loaded, title "Example Domain"

2. browser_snapshot
   Result: Found heading, paragraphs, and link [ref=e6]

3. browser_take_screenshot → example-page.png
   Result: Screenshot saved

4. browser_click → ref: "e6"
   Result: Navigated to IANA domains page
```

## Next Steps

Try these exercises:
1. Navigate to a news site and capture headlines
2. Search for something on Google
3. Fill out a contact form
4. Monitor network requests on a web app
5. Take screenshots of different viewport sizes

## Useful Resources

- Playwright docs: https://playwright.dev
- Element references come from accessibility tree
- Screenshots are saved to workspace root by default
- Browser session persists in `.playwright-data/` folder
