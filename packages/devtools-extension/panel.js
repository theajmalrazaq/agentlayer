// AgentLayerWeb DevTools - Panel Script

const ROLE_COLORS = {
	action: "#0036fe",
	form: "#42c366",
	field: "#ecb730",
	navigation: "#9061ff",
	dialog: "#eb3424",
	section: "#2a6dfb",
	default: "#666",
};

let currentManifest = null;
let overlayActive = false;

function _getTabId(cb) {
	chrome.devtools.inspectedWindow.eval("0", (_, _info) => {
		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			if (tabs[0]) cb(tabs[0].id);
		});
	});
}

function _sendToContent(type, _cb) {
	chrome.devtools.inspectedWindow.eval(
		`chrome.runtime.sendMessage({type: '${type}'})`,
		() => {},
	);
}

function scanPage() {
	chrome.devtools.inspectedWindow.eval(
		`(function() {
      const AGENT_ATTRS = ['data-agent-role','data-agent-id','data-agent-intent','data-agent-purpose','toolname','tooldescription'];
      const selector = AGENT_ATTRS.map(a => '[' + a + ']').join(',');
      const elements = document.querySelectorAll(selector);
      const manifest = [];
      elements.forEach((el, index) => {
        manifest.push({
          index,
          tag: el.tagName.toLowerCase(),
          role: el.getAttribute('data-agent-role'),
          id: el.getAttribute('data-agent-id') || el.id || null,
          intent: el.getAttribute('data-agent-intent'),
          purpose: el.getAttribute('data-agent-purpose'),
          toolname: el.getAttribute('toolname'),
          tooldescription: el.getAttribute('tooldescription'),
          text: (el.textContent || '').trim().slice(0, 80),
        });
      });
      return JSON.stringify({
        url: window.location.href,
        title: document.title,
        totalElements: manifest.length,
        elements: manifest,
      });
    })()`,
		(result) => {
			if (result) {
				currentManifest = JSON.parse(result);
				renderManifest(currentManifest);
			}
		},
	);
}

function renderManifest(manifest) {
	const list = document.getElementById("elements-list");
	const statsBar = document.getElementById("stats-bar");

	if (!manifest || manifest.totalElements === 0) {
		list.innerHTML = `<div class="empty"><strong>No AgentLayerWeb annotations found</strong><span>Add data-agent-* attributes or use @agentlayerweb/core to annotate your app.</span></div>`;
		statsBar.style.display = "none";
		return;
	}

	// Stats
	statsBar.style.display = "flex";
	document.getElementById("stat-total").textContent = manifest.totalElements;
	document.getElementById("stat-actions").textContent =
		manifest.elements.filter((e) => e.role === "action").length;
	document.getElementById("stat-forms").textContent = manifest.elements.filter(
		(e) => e.role === "form",
	).length;
	document.getElementById("stat-fields").textContent = manifest.elements.filter(
		(e) => e.role === "field",
	).length;

	// Elements
	list.innerHTML = manifest.elements
		.map((el) => {
			const color = ROLE_COLORS[el.role] || ROLE_COLORS.default;
			const label = el.id || el.toolname || el.intent || el.tag;
			return `
      <div class="element-card">
        <div class="element-header">
          <span class="role-badge" style="background:${color}22;color:${color};border:1px solid ${color}44">${el.role || "unknown"}</span>
          <span class="element-id">${label}</span>
          <span style="color:#444;font-family:monospace;font-size:10px">&lt;${el.tag}&gt;</span>
        </div>
        ${el.purpose ? `<div style="color:#888;font-size:11px">purpose: ${el.purpose}</div>` : ""}
        ${el.tooldescription ? `<div style="color:#888;font-size:11px">desc: ${el.tooldescription}</div>` : ""}
        ${el.text ? `<div class="element-text">"${el.text}"</div>` : ""}
      </div>
    `;
		})
		.join("");
}

function toggleOverlays() {
	const btn = document.getElementById("btn-overlay");
	chrome.devtools.inspectedWindow.eval(
		`(function() {
      const existing = document.querySelectorAll('.__agentlayerweb_overlay__');
      if (existing.length) {
        existing.forEach(e => e.remove());
        if (window.__agentlayerweb_cleanup__) {
          window.__agentlayerweb_cleanup__();
        }
        return false;
      }
      const AGENT_ATTRS = ['data-agent-role','data-agent-id','data-agent-intent','data-agent-purpose','toolname','tooldescription'];
      const ROLE_COLORS = { action:'#0036fe', form:'#42c366', field:'#ecb730', navigation:'#9061ff', dialog:'#eb3424', default:'#666' };
      const selector = AGENT_ATTRS.map(a => '[' + a + ']').join(',');
      const targets = Array.from(document.querySelectorAll(selector));
      const overlays = [];
      
      targets.forEach(el => {
        const role = el.getAttribute('data-agent-role') || 'default';
        const color = ROLE_COLORS[role] || ROLE_COLORS.default;
        const ov = document.createElement('div');
        ov.className = '__agentlayerweb_overlay__';
        ov.style.cssText = 'position:absolute;pointer-events:none;z-index:999999;box-sizing:border-box;border:2px solid '+color+';background:'+color+'18;';
        const lbl = document.createElement('div');
        lbl.style.cssText = 'position:absolute;top:-18px;left:0;background:'+color+';color:white;font-family:monospace;font-size:10px;padding:1px 5px;white-space:nowrap;';
        lbl.textContent = (el.getAttribute('data-agent-role')||'?') + ': ' + (el.getAttribute('data-agent-id')||el.getAttribute('toolname')||el.tagName.toLowerCase());
        ov.appendChild(lbl);
        document.documentElement.appendChild(ov);
        overlays.push({ el, ov });
      });
      
      function updatePositions() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        overlays.forEach(({ el, ov }) => {
          const rect = el.getBoundingClientRect();
          if (rect.width === 0 && rect.height === 0) {
            ov.style.display = 'none';
            return;
          }
          ov.style.display = 'block';
          ov.style.top = (rect.top + scrollTop) + 'px';
          ov.style.left = (rect.left + scrollLeft) + 'px';
          ov.style.width = rect.width + 'px';
          ov.style.height = rect.height + 'px';
        });
      }
      
      updatePositions();
      
      window.addEventListener('scroll', updatePositions, { capture: true, passive: true });
      window.addEventListener('resize', updatePositions, { passive: true });
      
      const observer = new MutationObserver(updatePositions);
      observer.observe(document.body, { attributes: true, childList: true, subtree: true });
      
      window.__agentlayerweb_cleanup__ = function() {
        window.removeEventListener('scroll', updatePositions, { capture: true });
        window.removeEventListener('resize', updatePositions);
        observer.disconnect();
        delete window.__agentlayerweb_cleanup__;
      };
      
      return true;
    })()`,
		(active) => {
			overlayActive = !!active;
			btn.classList.toggle("active", overlayActive);
			btn.textContent = overlayActive ? "⬡ Hide" : "⬡ Highlight";
		},
	);
}

function copyJSON() {
	if (!currentManifest) return;
	const btn = document.getElementById("btn-copy");
	navigator.clipboard
		.writeText(JSON.stringify(currentManifest, null, 2))
		.then(() => {
			btn.textContent = "✓ Copied!";
			setTimeout(() => (btn.textContent = "⎘ Copy JSON"), 1500);
		})
		.catch((err) => {
			console.error("Failed to copy JSON:", err);
		});
}

document.getElementById("btn-refresh").addEventListener("click", scanPage);
document
	.getElementById("btn-overlay")
	.addEventListener("click", toggleOverlays);
document.getElementById("btn-copy").addEventListener("click", copyJSON);

// Auto-scan on load
scanPage();
