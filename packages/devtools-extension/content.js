// AgentLayerWeb DevTools - Content Script
// Scans the page and builds the agent manifest, highlights annotated elements

const AGENT_ATTRS = [
	"data-agent-role",
	"data-agent-id",
	"data-agent-intent",
	"data-agent-purpose",
	"toolname",
	"tooldescription",
	"toolautosubmit",
];

let overlaysEnabled = false;
let overlayElements = [];
let overlayMapping = [];
let overlayObserver = null;

function updateOverlayPositions() {
	const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
	const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
	overlayMapping.forEach(({ el, overlay }) => {
		const rect = el.getBoundingClientRect();
		if (rect.width === 0 && rect.height === 0) {
			overlay.style.display = "none";
			return;
		}
		overlay.style.display = "block";
		overlay.style.top = `${rect.top + scrollTop}px`;
		overlay.style.left = `${rect.left + scrollLeft}px`;
		overlay.style.width = `${rect.width}px`;
		overlay.style.height = `${rect.height}px`;
	});
}

/**
 * Scans the DOM and returns a structured manifest of all AgentLayerWeb elements
 */
function buildAgentManifest() {
	const selector = AGENT_ATTRS.map((a) => `[${a}]`).join(",");
	const elements = document.querySelectorAll(selector);
	const manifest = [];

	elements.forEach((el, index) => {
		const entry = {
			index,
			tag: el.tagName.toLowerCase(),
			role: el.getAttribute("data-agent-role") || null,
			id: el.getAttribute("data-agent-id") || el.id || null,
			intent: el.getAttribute("data-agent-intent") || null,
			purpose: el.getAttribute("data-agent-purpose") || null,
			toolname: el.getAttribute("toolname") || null,
			tooldescription: el.getAttribute("tooldescription") || null,
			toolautosubmit: el.getAttribute("toolautosubmit") || null,
			text: el.textContent?.trim().slice(0, 80) || null,
			rect: el.getBoundingClientRect(),
		};
		manifest.push(entry);
	});

	return {
		url: window.location.href,
		title: document.title,
		timestamp: Date.now(),
		totalElements: manifest.length,
		elements: manifest,
	};
}

/**
 * Draws colored overlay boxes on annotated elements
 */
function enableOverlays() {
	removeOverlays();
	overlaysEnabled = true;

	const selector = AGENT_ATTRS.map((a) => `[${a}]`).join(",");
	const elements = document.querySelectorAll(selector);

	const roleColors = {
		action: "#0036fe",
		form: "#42c366",
		field: "#ecb730",
		navigation: "#9061ff",
		dialog: "#eb3424",
		default: "#0036fe",
	};

	elements.forEach((el) => {
		const role = el.getAttribute("data-agent-role") || "default";
		const color = roleColors[role] || roleColors.default;

		const overlay = document.createElement("div");
		overlay.className = "__agentlayerweb_overlay__";
		overlay.style.cssText = `
      position: absolute;
      border: 2px solid ${color};
      background: ${color}18;
      pointer-events: none;
      z-index: 999999;
      box-sizing: border-box;
    `;

		// Label
		const label = document.createElement("div");
		label.style.cssText = `
      position: absolute;
      top: -20px;
      left: 0;
      background: ${color};
      color: white;
      font-family: monospace;
      font-size: 10px;
      padding: 2px 6px;
      white-space: nowrap;
      pointer-events: none;
    `;
		label.textContent = `${role}: ${el.getAttribute("data-agent-id") || el.getAttribute("toolname") || el.tagName.toLowerCase()}`;
		overlay.appendChild(label);

		document.documentElement.appendChild(overlay);
		overlayElements.push(overlay);
		overlayMapping.push({ el, overlay });
	});

	updateOverlayPositions();

	window.addEventListener("scroll", updateOverlayPositions, {
		capture: true,
		passive: true,
	});
	window.addEventListener("resize", updateOverlayPositions, { passive: true });

	overlayObserver = new MutationObserver(updateOverlayPositions);
	overlayObserver.observe(document.body, {
		attributes: true,
		childList: true,
		subtree: true,
	});
}

function removeOverlays() {
	overlayElements.forEach((el) => {
		el.remove();
	});
	overlayElements = [];
	overlayMapping = [];
	overlaysEnabled = false;

	window.removeEventListener("scroll", updateOverlayPositions, {
		capture: true,
	});
	window.removeEventListener("resize", updateOverlayPositions);

	if (overlayObserver) {
		overlayObserver.disconnect();
		overlayObserver = null;
	}
}

// Listen for messages from devtools panel
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
	if (message.type === "GET_MANIFEST") {
		sendResponse(buildAgentManifest());
	}
	if (message.type === "TOGGLE_OVERLAYS") {
		if (overlaysEnabled) {
			removeOverlays();
			sendResponse({ active: false });
		} else {
			enableOverlays();
			sendResponse({ active: true });
		}
	}
	return true;
});
