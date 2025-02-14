let zammadTabId = null;
let isLoggingEnabled = false;
let currentUrlPattern = null;
let isRestrictedToDomains = false;
let allowedDomains = [];

// Use the appropriate API namespace depending on the browser
const browserAPI = chrome || browser;

// Logger function
function log(...args) {
  if (isLoggingEnabled) {
    console.log('[Zammad Tab Redirector]', ...args);
  }
}

// Check if URL matches current settings
function isZammadTicketUrl(url) {
  try {
    const urlObj = new URL(url);
    
    // Check domain restriction if enabled
    if (isRestrictedToDomains) {
      const hostname = urlObj.hostname;
      if (!allowedDomains.includes(hostname)) {
        log('Domain not in allowed list:', hostname);
        return false;
      }
    }

    // Check URL pattern
    const pattern = new RegExp(currentUrlPattern);
    return pattern.test(url);
  } catch (error) {
    log('Error checking URL:', error);
    return false;
  }
}

// Find existing Zammad tab
async function findExistingZammadTab() {
  try {
    const tabs = await browserAPI.tabs.query({});
    for (const tab of tabs) {
      if (tab.url) {
        try {
          const tabUrl = new URL(tab.url);
          // If domain restriction is enabled, check if the tab's domain is in the allowed list
          if (isRestrictedToDomains) {
            if (allowedDomains.includes(tabUrl.hostname)) {
              log('Found existing tab with allowed domain:', tab.id, tabUrl.hostname);
              zammadTabId = tab.id;
              return;
            }
          } else if (isZammadTicketUrl(tab.url)) {
            // If no domain restriction, fall back to URL pattern check
            log('Found existing Zammad tab:', tab.id);
            zammadTabId = tab.id;
            return;
          }
        } catch (error) {
          log('Error parsing tab URL:', error);
        }
      }
    }
    log('No existing Zammad tab found');
  } catch (error) {
    console.error('Error finding existing Zammad tab:', error);
  }
}

// Initialize settings and find existing tab
async function initialize() {
  const result = await browserAPI.storage.local.get({
    enableLogging: false,
    restrictDomains: false,
    domains: ['support.example.com'],
    urlPattern: '/#ticket/zoom/\\d+'
  });

  isLoggingEnabled = result.enableLogging;
  isRestrictedToDomains = result.restrictDomains;
  allowedDomains = result.domains;
  currentUrlPattern = result.urlPattern;

  log('Extension initialized with settings:', {
    logging: isLoggingEnabled,
    restrictDomains: isRestrictedToDomains,
    domains: allowedDomains,
    urlPattern: currentUrlPattern
  });
  
  await findExistingZammadTab();
}

// Listen for settings changes
browserAPI.storage.onChanged.addListener((changes, area) => {
  if (area === 'local') {
    if (changes.enableLogging) {
      isLoggingEnabled = changes.enableLogging.newValue;
      log('Logging', isLoggingEnabled ? 'enabled' : 'disabled');
    }
    if (changes.restrictDomains) {
      isRestrictedToDomains = changes.restrictDomains.newValue;
      log('Domain restriction', isRestrictedToDomains ? 'enabled' : 'disabled');
    }
    if (changes.domains) {
      allowedDomains = changes.domains.newValue;
      log('Updated allowed domains:', allowedDomains);
    }
    if (changes.urlPattern) {
      currentUrlPattern = changes.urlPattern.newValue;
      log('Updated URL pattern:', currentUrlPattern);
    }
  }
});

// Helper function to handle Zammad URLs
async function handleZammadUrl(newTabId, url) {
  try {
    log('Handling Zammad URL:', url, 'in tab:', newTabId);
    if (zammadTabId === null) {
      zammadTabId = newTabId;
      log('No existing Zammad tab, setting current tab as Zammad tab:', newTabId);
    } else {
      try {
        const existingTab = await browserAPI.tabs.get(zammadTabId);
        log('Existing Zammad tab found:', zammadTabId);
        await browserAPI.tabs.update(zammadTabId, {
          url: url,
          active: true
        });
        log('Updated existing tab with new URL');
        
        if (newTabId !== zammadTabId) {
          await browserAPI.tabs.remove(newTabId);
          log('Removed newly created tab:', newTabId);
        }
      } catch (error) {
        log('Existing tab not found, using new tab as Zammad tab');
        zammadTabId = newTabId;
      }
    }
  } catch (error) {
    console.error('Error handling Zammad tab:', error);
    log('Error handling Zammad tab:', error);
  }
}

// Listen for tab creation
browserAPI.tabs.onCreated.addListener(async (tab) => {
  if (tab.pendingUrl && isZammadTicketUrl(tab.pendingUrl)) {
    log('New tab created with pending Zammad URL:', tab.pendingUrl);
    await handleZammadUrl(tab.id, tab.pendingUrl);
  } else if (tab.url && isZammadTicketUrl(tab.url)) {
    log('New tab created with Zammad URL:', tab.url);
    await handleZammadUrl(tab.id, tab.url);
  }
});

// Listen for navigation events
browserAPI.webNavigation.onBeforeNavigate.addListener(async (details) => {
  if (details.frameId === 0 && isZammadTicketUrl(details.url)) {
    log('Navigation detected to Zammad URL:', details.url);
    await handleZammadUrl(details.tabId, details.url);
  }
});

// Also listen for completed navigation in case we missed the initial events
browserAPI.webNavigation.onCompleted.addListener(async (details) => {
  if (details.frameId === 0 && isZammadTicketUrl(details.url)) {
    log('Completed navigation to Zammad URL:', details.url);
    await handleZammadUrl(details.tabId, details.url);
  }
});

// Listen for tab removal to reset the stored tab ID if needed
browserAPI.tabs.onRemoved.addListener((tabId) => {
  if (tabId === zammadTabId) {
    log('Zammad tab was closed:', tabId);
    zammadTabId = null;
  }
});

// Initialize the extension
initialize();
log('Background script loaded'); 