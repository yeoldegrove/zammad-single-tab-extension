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

### Prerequisites

- Node.js (v20 or newer)
- npm

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yeoldegrove/zammad-single-tab-extension.git
   cd zammad-single-tab-extension
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Building

Build for both browsers:
```bash
npm run build
```

This will create:
- `web-ext-artifacts/firefox/zammad-links-in-single-tab-{version}-firefox.zip`
- `web-ext-artifacts/chrome/zammad-links-in-single-tab-{version}-chrome.zip`

Build for specific browser:
```bash
# Firefox only
npm run build:firefox

# Chrome only
npm run build:chrome
```

### Development

Start a development instance:
```bash
# Firefox
npm run start:firefox

# Chrome
npm run start:chrome
```

### Validation

Validate the extension:
```bash
# Validate Firefox version
npm run validate:firefox

# Validate Chrome version
npm run validate:chrome
```

## License

This project is licensed under the GPL-3.0-or-later License - see the [LICENSE](LICENSE) file for details.
