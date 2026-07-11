// AgentLayerWeb DevTools - Background Service Worker

chrome.runtime.onInstalled.addListener(() => {
	console.log("AgentLayerWeb DevTools extension initialized.");
});

// A placeholder listener to support message passing if needed in the future
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	console.log("Background received message:", message, "from:", sender);
	sendResponse({ status: "received" });
	return true;
});
