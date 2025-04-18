chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "explainText",
    title: "Explain text",
    contexts: ["selection"],
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "textSelected") {
    console.log("Received textSelected:", message.text);

    chrome.storage.local.set({ selectedText: message.text });

    if (sender.tab?.id) {
      chrome.tabs.sendMessage(sender.tab.id, {
        type: "showFloatingPopup",
        x: message.x || 100,
        y: message.y || 100,
        text: message.text,
      });
    }

    sendResponse({ status: "ok" });
    return true; //keeps the ServiceWorker active
  }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "explainText") {
    chrome.tabs.sendMessage(tab.id, {
      type: "showFloatingPopup",
      x: 100,
      y: 100,
      text: info.selectionText,
    });

    chrome.storage.local.set({ selectedText: info.selectionText });
  }
});
