const fs = require('fs');
const path = require('path');
const config = require('../config.json');
const { execSync } = require('child_process');

// Get version from environment, git, or fallback to default
function getVersion() {
    if (process.env.VERSION) {
        return process.env.VERSION;
    }
    
    try {
        // Try to get version from git, but clean it to only use numbers and dots
        const gitVersion = execSync('git describe --tags --always --dirty')
            .toString()
            .trim()
            .replace(/^v/, '');
        
        // Extract only the version numbers (e.g., "1.0.0" from "1.0.0-5-g3d4d75a-dirty")
        const match = gitVersion.match(/^(\d+\.\d+\.\d+)/);
        if (match) {
            return match[1];
        }
        
        // Fallback if no proper version tag exists
        return config.default_version;
    } catch (error) {
        return config.default_version;
    }
}

const version = getVersion();

// Ensure directories exist
const localesDir = path.join(__dirname, '..', '_locales');
Object.keys(config.locales).forEach(locale => {
  const dir = path.join(localesDir, locale);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Generate locale files
Object.entries(config.locales).forEach(([locale, strings]) => {
  const messages = {
    extensionName: { message: strings.name },
    extensionDescription: { message: strings.description },
    // Keep existing messages
    ...require(path.join(localesDir, locale, 'messages.json'))
  };
  fs.writeFileSync(
    path.join(localesDir, locale, 'messages.json'),
    JSON.stringify(messages, null, 2)
  );
});

// Generate icons object for manifest
const icons = {};
config.icon_sizes.forEach(size => {
  if (fs.existsSync(path.join(__dirname, '..', 'icons', `Icon-${size}.png`))) {
    icons[size] = `icons/Icon-${size}.png`;
  }
});

// Generate manifest.json
const manifest = {
  manifest_version: 3,
  name: "__MSG_extensionName__",
  version: version,
  description: "__MSG_extensionDescription__",
  default_locale: Object.keys(config.locales)[0],
  permissions: config.permissions,
  host_permissions: config.host_permissions,
  options_ui: config.options_ui,
  icons: icons
};

// Add browser-specific background configuration
if (process.env.BROWSER === 'chrome') {
  // Chrome uses service_worker
  manifest.background = config.background.chrome;
} else {
  // Firefox uses scripts array
  manifest.background = config.background.firefox;
  // Add Firefox-specific settings
  manifest.browser_specific_settings = {
    gecko: config.gecko
  };
}

// Generate extension package.json (for AMO)
const extensionPkg = {
  name: config.locales[Object.keys(config.locales)[0]].name.toLowerCase().replace(/\s+/g, '-'),
  version: version,
  description: config.locales[Object.keys(config.locales)[0]].description,
  author: config.metadata.author,
  homepage: config.metadata.homepage,
  type: "extension",
  categories: {
    firefox: ["productivity"]
  },
  license: config.license.type,
  webExt: {
    sign: {
      channel: "listed"
    },
    artifactsDir: "web-ext-artifacts",
    build: {
      overwriteDest: true
    }
  },
  amo: {
    defaultLocale: Object.keys(config.locales)[0],
    locales: config.locales,
    homepage: config.metadata.homepage,
    icon: config.metadata.icons,
    contributors: config.metadata.contributors
  }
};

// Write files
fs.writeFileSync('manifest.json', JSON.stringify(manifest, null, 2));
fs.writeFileSync('extension-package.json', JSON.stringify(extensionPkg, null, 2)); 