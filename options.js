// Default settings
const DEFAULT_URL_PATTERN = '/#ticket/zoom/\\d+';

// Translate the page
function translatePage() {
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    element.textContent = browser.i18n.getMessage(key);
  });
}

// Save options to browser.storage
function saveOptions() {
  const domains = Array.from(document.querySelectorAll('.domain-entry input[type="text"]'))
    .map(input => input.value.trim())
    .filter(domain => domain !== '');

  browser.storage.local.set({
    enableLogging: document.querySelector("#enableLogging").checked,
    restrictDomains: document.querySelector("#restrictDomains").checked,
    domains: domains,
    urlPattern: document.querySelector("#urlPattern").value || DEFAULT_URL_PATTERN
  });
}

// Create a new domain input field
function createDomainEntry(domain = '') {
  const container = document.createElement('div');
  container.className = 'domain-entry';

  const input = document.createElement('input');
  input.type = 'text';
  input.value = domain;
  input.placeholder = browser.i18n.getMessage('domainPlaceholder');
  input.addEventListener('change', saveOptions);

  const removeButton = document.createElement('button');
  removeButton.textContent = browser.i18n.getMessage('removeDomain');
  removeButton.onclick = () => {
    container.remove();
    saveOptions();
  };

  container.appendChild(input);
  container.appendChild(removeButton);
  return container;
}

// Restore options from browser.storage
async function restoreOptions() {
  const result = await browser.storage.local.get({
    enableLogging: false,
    restrictDomains: false,
    domains: ['support.example.com'],
    urlPattern: DEFAULT_URL_PATTERN
  });

  document.querySelector("#enableLogging").checked = result.enableLogging;
  document.querySelector("#restrictDomains").checked = result.restrictDomains;
  document.querySelector("#urlPattern").value = result.urlPattern;

  const domainList = document.querySelector("#domainList");
  domainList.innerHTML = '';
  result.domains.forEach(domain => {
    domainList.appendChild(createDomainEntry(domain));
  });

  updateDomainListVisibility();
}

// Update domain list visibility based on restriction checkbox
function updateDomainListVisibility() {
  const restricted = document.querySelector("#restrictDomains").checked;
  document.querySelector("#domainListContainer").style.display = restricted ? 'block' : 'none';
}

// Initialize the options page
document.addEventListener('DOMContentLoaded', () => {
  translatePage();
  restoreOptions();
});
document.querySelector("#enableLogging").addEventListener("change", saveOptions);
document.querySelector("#restrictDomains").addEventListener("change", () => {
  saveOptions();
  updateDomainListVisibility();
});
document.querySelector("#urlPattern").addEventListener("change", saveOptions);
document.querySelector("#addDomain").addEventListener("click", () => {
  document.querySelector("#domainList").appendChild(createDomainEntry());
}); 