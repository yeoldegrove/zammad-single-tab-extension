# Zammad Single Tab Extension

This browser extension ensures that Zammad ticket links always open in a single dedicated tab instead of creating new tabs. When clicking a Zammad ticket link, it will either:
- Use the existing Zammad tab if one exists, updating its URL and focusing it
- Create a new Zammad tab if none exists yet

## Features

- Redirects Zammad ticket links to a single tab
- Configurable domain restrictions
- Customizable URL pattern matching
- Debug logging option
- Available in English and German
- Works in both Firefox and Chrome

## Configuration

After installation, you can configure the extension through its options page:

1. **Debug Logging**: Enable to see detailed logs in the browser console
2. **Domain Restriction**: 
   - Disabled: Works on all domains
   - Enabled: Only works on specified domains
3. **URL Pattern**: Customize the pattern that identifies Zammad ticket URLs
   - Default pattern: `/#ticket/zoom/\d+`

## Building the Extension

```
web-ext build
```