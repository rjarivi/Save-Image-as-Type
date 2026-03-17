// Initialize Context Menus
chrome.runtime.onInstalled.addListener(() => {
  // 1. Save Image as Type (Top-level Parent)
  chrome.contextMenus.create({
    id: "save-as-type",
    title: "Save Image as Type...",
    contexts: ["image"]
  });

  chrome.contextMenus.create({
    id: "save-png",
    parentId: "save-as-type",
    title: "PNG",
    contexts: ["image"]
  });

  chrome.contextMenus.create({
    id: "save-jpg",
    parentId: "save-as-type",
    title: "JPG",
    contexts: ["image"]
  });

  chrome.contextMenus.create({
    id: "save-webp",
    parentId: "save-as-type",
    title: "WebP",
    contexts: ["image"]
  });
});

// Handle Clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const imageUrl = info.srcUrl;

  // Handle Save As formats
  if (info.menuItemId === "save-png" || info.menuItemId === "save-jpg" || info.menuItemId === "save-webp") {
    const format = info.menuItemId.split("-")[1]; // png, jpg, webp
    handleImageDownload(imageUrl, format);
  }
});

async function handleImageDownload(url, format) {
  // Ensure offscreen document exists
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT']
  });

  if (existingContexts.length === 0) {
    await chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: ['DOM_PARSER'],
      justification: 'Process image conversion using Canvas API'
    });
  }

  chrome.runtime.sendMessage({
    type: 'convert-image',
    url: url,
    format: format
  });
}

// Listen for the processed data from offscreen
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'download-ready') {
    chrome.downloads.download({
      url: message.dataUrl,
      filename: `image-${Date.now()}.${message.format}`,
      saveAs: true
    });
  }
});