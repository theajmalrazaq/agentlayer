"use client";
import { ArrowRight, BookOpen, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const codeData = {
	python: `import { AgentAction, AgentForm, AgentField } from '@agentlayerweb/react';

<AgentForm purpose="Book briefing" submitAction="submit_briefing">
  <AgentField name="email" type="email" required>
    <input type="email" />
  </AgentField>
</AgentForm>`,
	node: `<!-- Vue custom directive bindings -->
<form v-agent="agent.form({ purpose: 'Book Demo', submitAction: 'book_demo' })">
  <input 
    type="email" 
    v-agent="agent.field({ name: 'email', type: 'email', required: true })" 
  />
</form>`,
	curl: `<!-- Standard HTML WebMCP form discovery -->
<form toolname="book-demo" tooldescription="Submit demo request">
  <input name="email" required />
</form>`,
	cli: `bun add @agentlayerweb/react @agentlayerweb/core
bun run build`,
};

const useCaseData = {
	forms: {
		title: "Agent Integration in progress...",
		desc: "Exposing scheduling forms directly to browser agents using AgentLayerWeb's custom annotation standard.",
		stats: [
			{ label: "Fields discovered", val: "2 registered" },
			{ label: "Actions mapped", val: "1 verified" },
			{ label: "Validation check", val: "Passed" },
			{ label: "MCP connection", val: "Connected" },
		],
	},
	workflows: {
		title: "Executing Autonomous Workflows...",
		desc: "Browser agents execute multi-step form workflows with native page state monitoring.",
		stats: [
			{ label: "Sequence steps", val: "12 validated" },
			{ label: "Form submissions", val: "4 complete" },
			{ label: "Error rate", val: "0%" },
			{ label: "Agent latency", val: "140ms" },
		],
	},
	crm: {
		title: "CRM Data Sync status...",
		desc: "Synchronizing customer contact fields and support forms securely directly with AgentLayerWeb metadata.",
		stats: [
			{ label: "Mapped endpoints", val: "8 active" },
			{ label: "Data mutations", val: "450 synced" },
			{ label: "Schema checks", val: "All sound" },
			{ label: "MCP status", val: "Active" },
		],
	},
};

type TabType = "python" | "node" | "curl" | "cli";
type UseCaseType = "forms" | "workflows" | "crm";

export default function Home() {
	const [activeTab, setActiveTab] = useState<TabType>("python");
	const [activeUseCase, setActiveUseCase] = useState<UseCaseType>("forms");
	const [copiedCode, setCopiedCode] = useState(false);
	const [copiedInstall, setCopiedInstall] = useState(false);
	const [installPkg, setInstallPkg] = useState<"bun" | "npm" | "pnpm">("bun");
	const [copiedInstallPkg, setCopiedInstallPkg] = useState(false);
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const [examplesOpen, setExamplesOpen] = useState(false);

	const getCoreInstallCommand = (pm: "bun" | "npm" | "pnpm") => {
		if (pm === "bun") return "bun add @agentlayerweb/core";
		if (pm === "pnpm") return "pnpm add @agentlayerweb/core";
		return "npm i @agentlayerweb/core";
	};

	const getFullInstallCommand = (pm: "bun" | "npm" | "pnpm") => {
		if (pm === "bun") return "bun add @agentlayerweb/react @agentlayerweb/core";
		if (pm === "pnpm")
			return "pnpm add @agentlayerweb/react @agentlayerweb/core";
		return "npm i @agentlayerweb/react @agentlayerweb/core";
	};

	const handleCopyCode = () => {
		navigator.clipboard.writeText(codeData[activeTab]);
		setCopiedCode(true);
		setTimeout(() => setCopiedCode(false), 2000);
	};

	const handleCopyInstall = () => {
		navigator.clipboard.writeText(getCoreInstallCommand(installPkg));
		setCopiedInstall(true);
		setTimeout(() => setCopiedInstall(false), 2000);
	};

	return (
		<div className="bg-background-base min-h-screen text-accent-black selection:bg-heat-100 selection:text-accent-white animate-fade-in pb-96">
			{/* Navbar / Header */}
			<header
				className="fixed top-36 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-1200 z-50 border border-border-muted px-24 py-16"
				style={{
					background: "rgba(255, 255, 255, 0.85)",
					backdropFilter: "blur(12px)",
				}}
			>
				<div className="max-w-1200 mx-auto flex items-center justify-between">
					<div className="flex items-center gap-12">
						{/* Logo Symbol */}
						<svg
							viewBox="0 0 61 67"
							fill="none"
							className="animate-pulse"
							style={{ width: "26px", height: "28px" }}
						>
							<title>AgentLayerWeb logo</title>
							<path
								d="M20 22H12V55H55V67H0V10H20V22ZM32 37H43V49H20V22H32V37ZM43.5 0C43.9203 8.94373 51.1001 16.0862 60.0459 16.46L61 16.5L60.0459 16.54C51.1001 16.9138 43.9203 24.0563 43.5 33C43.0797 24.0563 35.8999 16.9138 26.9541 16.54L26 16.5L26.9541 16.46C35.8999 16.0862 43.0797 8.94373 43.5 0Z"
								fill="url(#logo_gradient)"
							/>
							<defs>
								<linearGradient
									id="logo_gradient"
									x1="43.5"
									y1="0"
									x2="43.5"
									y2="33"
									gradientUnits="userSpaceOnUse"
								>
									<stop stopColor="#0036FE" />
									<stop offset="1" stopOpacity={0.81} />
								</linearGradient>
							</defs>
						</svg>
						<span className="text-title-h5 font-bold tracking-tight text-accent-black">
							Agent<span className="text-heat-100">LayerWeb</span>
						</span>
					</div>

					<div className="flex items-center gap-12">
						<a
							href="/agentlayerweb/docs"
							className="sm:inline-flex text-body-small border border-border-muted px-12 h-36 flex items-center justify-center rounded-6 hover:bg-background-lighter transition-colors duration-4 gap-8 text-accent-black decoration-none font-semibold"
						>
							<BookOpen size={16} />
							Docs
						</a>

						<div className="relative sm:inline-flex">
							<button
								type="button"
								onClick={() => setExamplesOpen(!examplesOpen)}
								className="text-body-small border border-border-muted px-12 h-36 flex items-center justify-center rounded-6 hover:bg-background-lighter transition-colors duration-4 gap-8 text-accent-black font-semibold cursor-pointer bg-transparent"
							>
								<span>Examples</span>
								<ChevronDown
									size={12}
									style={{
										transform: examplesOpen ? "rotate(180deg)" : "none",
										transition: "transform 0.15s ease",
									}}
								/>
							</button>

							{examplesOpen && (
								<div className="absolute left-0 top-40 bg-white border border-[#262626]/12 py-1 min-w-180px z-50 flex flex-col rounded-6">
									<a
										href="/agentlayerweb/example/human"
										className="px-16 py-8 text-body-small text-accent-black hover:bg-background-lighter decoration-none font-medium transition-colors text-left"
									>
										Human Mode DOM
									</a>
									<a
										href="/agentlayerweb/example/agentlayerweb"
										className="px-16 py-8 text-body-small text-accent-black hover:bg-background-lighter decoration-none font-medium transition-colors text-left"
									>
										AgentLayerWeb DOM
									</a>
								</div>
							)}
						</div>
						<div
							className="flex items-center border border-border-loud bg-background-base h-36 relative"
							style={{ borderRadius: "0px" }}
						>
							<button
								type="button"
								onClick={() => setDropdownOpen(!dropdownOpen)}
								className="flex items-center gap-4 px-12 h-full border-0 border-r border-border-loud bg-transparent text-accent-black text-body-small font-semibold cursor-pointer hover:bg-background-lighter transition-colors"
								style={{ borderRadius: "0px" }}
							>
								<span>{installPkg}</span>
								<ChevronDown
									size={12}
									style={{
										transform: dropdownOpen ? "rotate(180deg)" : "none",
										transition: "transform 0.15s ease",
									}}
								/>
							</button>

							<button
								type="button"
								onClick={handleCopyInstall}
								className="flex items-center justify-between px-16 h-full border-0 bg-transparent text-accent-black/80 hover:text-accent-black text-body-small font-mono font-medium cursor-pointer grow transition-colors gap-12"
								style={{ borderRadius: "0px" }}
							>
								<span>{getCoreInstallCommand(installPkg)}</span>
								<span className="text-[10px] uppercase font-bold text-heat-100 bg-heat-10 px-6 py-2 rounded-4">
									{copiedInstall ? "Copied!" : "Copy"}
								</span>
							</button>

							{dropdownOpen && (
								<div
									className="absolute left-0 top-36 w-80 bg-background-base border border-border-loud z-50 flex flex-col"
									style={{
										borderRadius: "0px",
										boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
									}}
								>
									{(["bun", "npm", "pnpm"] as const).map((pm) => (
										<button
											key={pm}
											type="button"
											onClick={() => {
												setInstallPkg(pm);
												setDropdownOpen(false);
											}}
											className={`w-full text-left px-12 py-8 text-body-small border-0 cursor-pointer transition-colors ${
												installPkg === pm
													? "bg-heat-100 text-accent-white"
													: "bg-transparent text-accent-black/70 hover:bg-background-lighter"
											}`}
											style={{ borderRadius: "0px" }}
										>
											{pm}
										</button>
									))}
								</div>
							)}
						</div>
					</div>
				</div>
			</header>

			{/* Hero Section */}
			<section className="relative pt-180 pb-80 px-24 overflow-hidden text-center">
				<div className="max-w-800 mx-auto relative z-10 animate-fade-up">
					{/* Badge */}
					<div className="inline-flex items-center gap-8 bg-heat-10 border border-heat-100/20 px-12 py-4 rounded-6 text-heat-100 text-body-small font-semibold mb-24">
						<span
							className="bg-heat-100"
							style={{ width: "6px", height: "6px", borderRadius: "0px" }}
						></span>
						MIT Licensed — Free Forever, No Strings Attached
					</div>

					<h1 className="text-title-h1 tracking-tight font-extrabold mb-24 leading-none text-accent-black font-pixel-grid">
						Expose your UI <br /> to
						<span className="text-gradient"> AI browser agents</span>
					</h1>

					<p className="text-body-x-large text-accent-black/70 max-w-640 mx-auto mb-32">
						An Agent Experience (AX) framework for dual human-agent web
						applications. Build interfaces optimized for both human visual usage
						and AI agent interaction.
					</p>

					{/* Search Bar Mockup */}
					<div className="max-w-600 mx-auto bg-background-base border border-border-loud rounded-6 p-8 flex items-center gap-8 mb-24">
						<input
							type="text"
							placeholder="http://localhost:3000"
							defaultValue="http://localhost:3000"
							disabled
							className="grow bg-transparent border-0 outline-none text-body-medium text-accent-black/70 px-12"
						/>
						<div className="flex items-center gap-4">
							<button
								type="button"
								className="bg-background-lighter hover:bg-background-lighter/80 text-accent-black/70 font-semibold px-12 h-32 rounded-6 border-0 text-body-small cursor-pointer"
							>
								Annotate
							</button>
							<button
								type="button"
								className="bg-background-lighter hover:bg-background-lighter/80 text-accent-black/70 font-semibold px-12 h-32 rounded-6 border-0 text-body-small cursor-pointer"
							>
								Validate
							</button>
						</div>
						<button
							type="button"
							className="bg-heat-100 text-accent-white rounded-6 h-32 w-32 flex items-center justify-center border-0 cursor-pointer hover:bg-heat-100/90 transition-colors"
						>
							<ArrowRight size={16} />
						</button>
					</div>

					<div className="text-body-small text-accent-black/40 mb-48 flex justify-center items-center gap-8">
						<span>
							Trusted by developers building agent-first software of all sizes
						</span>
					</div>

					{/* Dashboard Mockup Window */}
					<div className="bg-background-lighter border border-border-loud rounded-6 p-16 max-w-720 mx-auto text-left">
						<div className="flex items-center justify-between border-b border-border-muted pb-12 mb-16">
							<div className="flex items-center gap-8">
								<span
									className="bg-accent-crimson"
									style={{ width: "10px", height: "10px", borderRadius: "0px" }}
								></span>
								<span
									className="bg-accent-honey"
									style={{ width: "10px", height: "10px", borderRadius: "0px" }}
								></span>
								<span
									className="bg-accent-forest"
									style={{ width: "10px", height: "10px", borderRadius: "0px" }}
								></span>
							</div>
							<span className="text-body-small text-accent-black/40 font-mono">
								demo_preview.js
							</span>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-16 font-mono text-xs text-accent-black/80">
							<div>
								<p className="text-accent-forest font-bold mb-8">
									{"// Annotated UI Element"}
								</p>
								<pre className="bg-background-base p-12 rounded-6 border border-border-muted overflow-x-auto whitespace-pre">
									{`<button
  id="checkout"
  toolname="checkout-item"
  tooldescription="Submit order"
  data-agent-role="action"
>n
  Place Order
</button>`}
								</pre>
							</div>
							<div>
								<p className="text-accent-bluetron font-bold mb-8">
									{"// Browser Tool Manifest"}
								</p>
								<pre className="bg-background-base p-12 rounded-6 border border-border-muted overflow-x-auto whitespace-pre">
									{`{
  "name": "checkout-item",
  "description": "Submit order",
  "parameters": {
    "type": "object",
    "properties": {}
  }
}`}
								</pre>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Benchmark Results Section */}
			<section className="py-80 bg-background-base px-24 border-t border-border-muted text-left">
				<div className="max-w-960 mx-auto">
					<div className="text-center mb-48">
						<div className="inline-block bg-[#0036FE]/10 border border-[#0036FE]/20 px-12 py-4 rounded-6 text-[#0036FE] text-body-small font-semibold mb-16 uppercase tracking-wider">
							Performance Metrics
						</div>
						<h2 className="text-title-h2 font-extrabold mb-16 text-accent-black font-pixel-grid">
							Playwright MCP Benchmarks
						</h2>
						<p className="text-body-large text-accent-black/60 max-w-640 mx-auto">
							Measuring browser agent efficiency running multi-step validation
							and modal workflows. Exposing dynamic semantic MCP tools yields
							massive latency and token reductions.
						</p>
					</div>

					<div className="bg-white border border-[#262626]/12 rounded-8 overflow-hidden">
						<div className="overflow-x-auto">
							<table className="w-full border-collapse text-left text-body-medium">
								<thead>
									<tr className="bg-[#262626]/4 border-b border-[#262626]/12 font-mono text-xs uppercase tracking-wider text-accent-black/60">
										<th className="p-16">Model</th>
										<th className="p-16">Scenario</th>
										<th className="p-16">Duration</th>
										<th className="p-16">Steps</th>
										<th className="p-16">Total Tokens</th>
										<th className="p-16">API Cost</th>
										<th className="p-16 text-right">Savings / Speedup</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-[#262626]/8">
									{/* Model 1: claude-haiku-4-5 */}
									<tr className="hover:bg-[#262626]/2">
										<td className="p-16 font-semibold align-top" rowSpan={2}>
											claude-haiku-4-5
										</td>
										<td className="p-16 text-accent-black/60">
											Human Page (Raw DOM)
										</td>
										<td className="p-16">76.11s</td>
										<td className="p-16">12 steps</td>
										<td className="p-16 font-mono text-xs">135,110</td>
										<td className="p-16 font-mono text-xs">$0.010633</td>
										<td
											className="p-16 text-right font-semibold text-heat-100 align-top"
											rowSpan={2}
										>
											<span className="block text-body-medium">
												2.19x speedup
											</span>
											<span className="block text-xs text-[#0036FE] font-medium">
												90.1% token savings
											</span>
											<span className="block text-xs text-[#0036FE] font-medium">
												87.7% cost reduction
											</span>
										</td>
									</tr>
									<tr className="bg-[#0036FE]/2 hover:bg-[#0036FE]/4">
										<td className="p-16 font-semibold text-[#0036FE]">
											Agent Page (MCP)
										</td>
										<td className="p-16 font-semibold text-[#0036FE]">
											34.71s
										</td>
										<td className="p-16 font-semibold text-[#0036FE]">
											8 steps
										</td>
										<td className="p-16 font-mono text-xs font-semibold text-[#0036FE]">
											13,346
										</td>
										<td className="p-16 font-mono text-xs font-semibold text-[#0036FE]">
											$0.001309
										</td>
									</tr>

									{/* Model 2: gpt-4o-mini */}
									<tr className="hover:bg-[#262626]/2">
										<td className="p-16 font-semibold align-top" rowSpan={2}>
											gpt-4o-mini
										</td>
										<td className="p-16 text-accent-black/60">
											Human Page (Raw DOM)
										</td>
										<td className="p-16">52.33s</td>
										<td className="p-16">11 steps</td>
										<td className="p-16 font-mono text-xs">65,468</td>
										<td className="p-16 font-mono text-xs">$0.005087</td>
										<td
											className="p-16 text-right font-semibold text-heat-100 align-top"
											rowSpan={2}
										>
											<span className="block text-body-medium">
												3.38x speedup
											</span>
											<span className="block text-xs text-[#0036FE] font-medium">
												95.7% token savings
											</span>
											<span className="block text-xs text-[#0036FE] font-medium">
												94.9% cost reduction
											</span>
										</td>
									</tr>
									<tr className="bg-[#0036FE]/2 hover:bg-[#0036FE]/4">
										<td className="p-16 font-semibold text-[#0036FE]">
											Agent Page (MCP)
										</td>
										<td className="p-16 font-semibold text-[#0036FE]">
											15.49s
										</td>
										<td className="p-16 font-semibold text-[#0036FE]">
											6 steps
										</td>
										<td className="p-16 font-mono text-xs font-semibold text-[#0036FE]">
											2,807
										</td>
										<td className="p-16 font-mono text-xs font-semibold text-[#0036FE]">
											$0.000260
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
					<div className="mt-16 text-body-small text-accent-black/40">
						*Note: LLM planning noise is common on lower-tier models (like
						flash-low) where reasoning loop variations occur, which can result
						in step slowdowns. However, context savings remain extremely high.
					</div>
				</div>
			</section>

			{/* Start Annotating Today Section */}
			<section
				id="features"
				className="py-80 bg-background-lighter px-24 border-t border-b border-border-muted"
			>
				<div className="max-w-1200 mx-auto">
					<div className="text-center mb-64">
						<div className="inline-block bg-heat-10 border border-heat-100/30 px-12 py-4 rounded-6 text-heat-100 text-body-small font-semibold mb-16">
							Developer First
						</div>
						<h2 className="text-title-h2 font-extrabold mb-16 text-accent-black font-pixel-grid">
							Start annotating today
						</h2>
						<p className="text-body-large text-accent-black/60 max-w-600 mx-auto">
							The infrastructure layer that helps AI find, read, and act on web
							elements.
						</p>
					</div>

					{/* 3 Cards Layout */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-24 mb-64">
						{/* Card 1 */}
						<div className="bg-background-base border border-border-muted p-32 rounded-6 hover:border-heat-100/30 transition-all duration-4 flex flex-col justify-between">
							<div>
								<h3 className="text-title-h5 font-bold mb-12 text-accent-black font-pixel-grid">
									Annotate Forms & Actions
								</h3>
								<p className="text-body-medium text-accent-black/60 mb-24">
									Wrap components or attach data-agent-* attributes. Specify
									fields, descriptions, and verification rules.
								</p>
							</div>
							<Link
								href="/docs"
								className="text-body-small font-bold text-heat-100 hover:underline decoration-none"
							>
								Learn more →
							</Link>
						</div>

						{/* Card 2 */}
						<div className="bg-background-base border border-border-muted p-32 rounded-6 hover:border-heat-100/30 transition-all duration-4 flex flex-col justify-between">
							<div>
								<h3 className="text-title-h5 font-bold mb-12 text-accent-black font-pixel-grid">
									Verify Schema Soundness
								</h3>
								<p className="text-body-medium text-accent-black/60 mb-24">
									Instantly validate your page&apos;s semantic schema during
									testing suites or inside your browser console.
								</p>
							</div>
							<Link
								href="/docs"
								className="text-body-small font-bold text-heat-100 hover:underline decoration-none"
							>
								Learn more →
							</Link>
						</div>

						{/* Card 3 */}
						<div className="bg-background-base border border-border-muted p-32 rounded-6 hover:border-heat-100/30 transition-all duration-4 flex flex-col justify-between">
							<div>
								<div className="flex items-center gap-8 mb-12">
									<h3 className="text-title-h5 font-bold text-accent-black m-0 font-pixel-grid">
										Native WebMCP
									</h3>
									<span className="bg-accent-amethyst/10 text-accent-amethyst text-[10px] font-bold uppercase px-8 py-2 rounded-4">
										New
									</span>
								</div>
								<p className="text-body-medium text-accent-black/60 mb-24">
									Complies with browser-level Model Context Protocols,
									registering page elements directly as LLM tools.
								</p>
							</div>
							<Link
								href="/docs"
								className="text-body-small font-bold text-heat-100 hover:underline decoration-none"
							>
								Learn more →
							</Link>
						</div>
					</div>

					{/* Switcher Code Block layout */}
					<div className="bg-background-base border border-border-muted rounded-6 overflow-hidden grid grid-cols-1 md:grid-cols-2">
						{/* Code Side */}
						<div className="border-r border-border-muted p-24">
							<div className="flex items-center justify-between border-b border-border-muted pb-12 mb-16">
								<div className="flex gap-12">
									{(["python", "node", "curl", "cli"] as TabType[]).map(
										(tab) => (
											<button
												key={tab}
												type="button"
												onClick={() => setActiveTab(tab)}
												className={`code-tab-btn text-body-small font-bold bg-transparent border-0 cursor-pointer ${
													activeTab === tab
														? "text-heat-100"
														: "text-accent-black/55 hover:text-accent-black"
												}`}
											>
												{tab === "python"
													? "React"
													: tab === "node"
														? "Vue"
														: tab === "curl"
															? "HTML"
															: "CLI"}
											</button>
										),
									)}
								</div>
								<button
									type="button"
									onClick={handleCopyCode}
									className="bg-background-lighter hover:bg-background-lighter/80 text-accent-black/70 text-body-small font-bold px-12 py-4 rounded-6 border-0 cursor-pointer"
								>
									{copiedCode ? "Copied!" : "Copy code"}
								</button>
							</div>
							<pre className="text-xs font-mono text-accent-black/90 whitespace-pre overflow-x-auto">
								<code id="code-block-content">{codeData[activeTab]}</code>
							</pre>
						</div>

						{/* Description/Features list Side */}
						<div className="p-32 flex flex-col justify-center bg-[#fafafa]">
							<h4 className="text-title-h4 font-bold text-accent-black mb-12 font-pixel-grid">
								# AgentLayerWeb
							</h4>
							<p className="text-body-medium text-accent-black/70 mb-24 leading-relaxed">
								AgentLayerWeb maps web page elements directly to AI browser
								agent tools.
							</p>
							<ul className="space-y-12 text-body-medium text-accent-black/60">
								<li className="flex items-center gap-8">
									<span className="text-heat-100 font-bold">•</span>
									<span>
										<strong className="font-pixel-grid">Annotate:</strong>{" "}
										Expose forms and fields to LLMs
									</span>
								</li>
								<li className="flex items-center gap-8">
									<span className="text-heat-100 font-bold">•</span>
									<span>
										<strong className="font-pixel-grid">Validate:</strong> Test
										WebMCP tool declarations
									</span>
								</li>
								<li className="flex items-center gap-8">
									<span className="text-heat-100 font-bold">•</span>
									<span>
										<strong className="font-pixel-grid">Interact:</strong> Let
										browser agents click and submit forms safely
									</span>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</section>

			{/* Connect AI Agents Section */}
			<section id="why-agentlayerweb" className="py-80 px-24">
				<div className="max-w-1200 mx-auto">
					<div className="text-center mb-64">
						<div className="inline-block bg-heat-10 border border-heat-100/30 px-12 py-4 rounded-6 text-heat-100 text-body-small font-semibold mb-16">
							Agent Ready
						</div>
						<h2 className="text-title-h2 font-extrabold mb-16 text-accent-black font-pixel-grid">
							Easily connect with your <br />
							<span className="text-heat-100 font-pixel-grid">AI agents</span>
						</h2>
						<p className="text-body-large text-accent-black/60 max-w-600 mx-auto">
							Connect AgentLayerWeb annotations to any browser client in
							minutes.
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-32">
						{/* Column 1 */}
						<div className="bg-background-lighter border border-border-muted p-32 rounded-6 flex flex-col justify-between">
							<div>
								<p className="text-body-large font-bold text-accent-black mb-12 font-pixel-grid">
									One dependency. <br /> Annotate your application using our
									headless SDK.
								</p>

								<div className="flex gap-8 mb-8">
									{(["bun", "npm", "pnpm"] as const).map((pm) => (
										<button
											key={pm}
											type="button"
											onClick={() => setInstallPkg(pm)}
											className={`px-8 py-2 text-[10px] font-bold border-0 rounded-4 cursor-pointer transition-colors ${
												installPkg === pm
													? "bg-heat-100 text-accent-white"
													: "bg-transparent text-accent-black/50 hover:text-accent-black"
											}`}
										>
											{pm}
										</button>
									))}
								</div>
								<div className="bg-background-base p-16 rounded-6 border border-border-muted font-mono text-xs text-accent-black/85 mb-24 overflow-x-auto flex items-center justify-between gap-16">
									<code>{getFullInstallCommand(installPkg)}</code>
									<button
										type="button"
										onClick={() => {
											navigator.clipboard.writeText(
												getFullInstallCommand(installPkg),
											);
											setCopiedInstallPkg(true);
											setTimeout(() => setCopiedInstallPkg(false), 2000);
										}}
										className="bg-background-lighter hover:bg-background-lighter/80 text-accent-black/60 text-[10px] font-bold px-8 py-2 rounded-4 border-0 cursor-pointer transition-colors whitespace-nowrap"
									>
										{copiedInstallPkg ? "Copied!" : "Copy"}
									</button>
								</div>
							</div>
							<Link
								href="/docs"
								className="text-body-small font-bold text-heat-100 hover:underline decoration-none"
							>
								View the docs →
							</Link>
						</div>

						{/* Column 2 */}
						<div className="bg-background-lighter border border-border-muted p-32 rounded-6 flex flex-col justify-between">
							<div>
								<p className="text-body-large font-bold text-accent-black mb-12 font-pixel-grid">
									Local Schema testing. <br /> Test your page&apos;s WebMCP
									schema via our validator CLI.
								</p>

								<div className="bg-background-base p-16 rounded-6 border border-border-muted font-mono text-xs text-accent-black/85 mb-24 overflow-x-auto flex items-center justify-between">
									<code>
										bunx @agentlayerweb/cli validate http://localhost:3000
									</code>
									<span className="bg-background-lighter text-[10px] text-accent-black/40 px-8 py-2 rounded-4">
										CLI
									</span>
								</div>
							</div>
							<Link
								href="/docs"
								className="text-body-small font-bold text-heat-100 hover:underline decoration-none"
							>
								View the validation guide →
							</Link>
						</div>
					</div>
				</div>
			</section>

			{/* Fast, Reliable, Token-Efficient benchmarks section */}
			<section
				id="comparison"
				className="py-80 bg-background-lighter px-24 border-t border-b border-border-muted"
			>
				<div className="max-w-1200 mx-auto">
					<div className="text-center mb-64">
						<div className="inline-block bg-heat-10 border border-heat-100/30 px-12 py-4 rounded-6 text-heat-100 text-body-small font-semibold mb-16">
							Built for Performance
						</div>
						<h2 className="text-title-h2 font-extrabold mb-16 text-accent-black font-pixel-grid">
							Fast, reliable, and token-efficient. <br />
							And it&apos;s{" "}
							<span className="text-heat-100 font-pixel-grid">open source</span>
						</h2>
						<p className="text-body-large text-accent-black/60 max-w-600 mx-auto">
							Web interaction infrastructure built from the ground up.
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-32 mb-48">
						{/* Box 1: Reliable on any page --> */}
						<div className="bg-background-base border border-border-muted p-32 rounded-6">
							<span className="text-body-small text-accent-black/40 uppercase font-bold block mb-12">
								100% Action Accuracy
							</span>
							<h3 className="text-title-h4 font-bold text-accent-black mb-12 font-pixel-grid">
								Guaranteed interaction.
							</h3>
							<p className="text-body-medium text-accent-black/60 mb-24">
								AI agents successfully identify and execute page actions without
								coordinate-guessing or layout shifts.
							</p>

							<div className="space-y-16">
								<div>
									<div className="flex justify-between text-body-small font-bold mb-4">
										<span>AgentLayerWeb (Semantic)</span>
										<span className="text-heat-100">98%</span>
									</div>
									<div className="w-full bg-background-lighter h-8 overflow-hidden rounded-4">
										<div
											className="bg-heat-100 h-full rounded-4"
											style={{ width: "98%" }}
										></div>
									</div>
								</div>
								<div>
									<div className="flex justify-between text-body-small font-bold mb-4">
										<span>Computer Use (Vision)</span>
										<span>45%</span>
									</div>
									<div className="w-full bg-background-lighter h-8 overflow-hidden rounded-4">
										<div
											className="bg-accent-black/35 h-full rounded-4"
											style={{ width: "45%" }}
										></div>
									</div>
								</div>
								<div>
									<div className="flex justify-between text-body-small font-bold mb-4">
										<span>Raw DOM (Scraping)</span>
										<span>30%</span>
									</div>
									<div className="w-full bg-background-lighter h-8 overflow-hidden rounded-4">
										<div
											className="bg-accent-black/20 h-full rounded-4"
											style={{ width: "30%" }}
										></div>
									</div>
								</div>
							</div>
						</div>

						{/* Box 2: Speed that feels invisible --> */}
						<div className="bg-background-base border border-border-muted p-32 rounded-6 flex flex-col justify-between">
							<div>
								<span className="text-body-small text-accent-black/40 uppercase font-bold block mb-12">
									Instant Tool Discovery
								</span>
								<h3 className="text-title-h4 font-bold text-accent-black mb-12 font-pixel-grid">
									Blazingly fast.
								</h3>
								<p className="text-body-medium text-accent-black/60 mb-24">
									Schema registry parses page manifests in milliseconds. Built
									for fast agentic validation loops.
								</p>
							</div>

							<div className="overflow-x-auto border border-border-muted rounded-6 bg-background-lighter text-xs">
								<table className="w-full text-left border-collapse">
									<thead>
										<tr className="border-b border-border-muted bg-background-base">
											<th className="p-8 font-bold">Form Name</th>
											<th className="p-8 font-bold">DOM Parse</th>
											<th className="p-8 font-bold">Manifest Query</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-border-muted text-accent-black/70">
										<tr>
											<td className="p-8">Login Form</td>
											<td className="p-8">520 ms</td>
											<td className="p-8">2 ms</td>
										</tr>
										<tr>
											<td className="p-8">Checkout Form</td>
											<td className="p-8">640 ms</td>
											<td className="p-8">3 ms</td>
										</tr>
										<tr>
											<td className="p-8">Strategy Booking</td>
											<td className="p-8">480 ms</td>
											<td className="p-8">2 ms</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-32">
						{/* Box 3: Token-efficient */}
						<div className="bg-background-base border border-border-muted p-32 rounded-6 flex flex-col justify-between">
							<div>
								<span className="text-body-small text-accent-black/40 uppercase font-bold block mb-12">
									Token-efficient
								</span>
								<h3 className="text-title-h4 font-bold text-accent-black mb-12 font-pixel-grid">
									Only the metadata that matters.
								</h3>
								<p className="text-body-medium text-accent-black/60 mb-24">
									No raw HTML page source or image arrays. Just clean tool
									schemas, reducing token consumption by 93%.
								</p>
							</div>
							<div className="bg-background-lighter p-16 rounded-6 border border-border-muted text-xs flex justify-between items-center">
								<div>
									<span className="text-accent-black/50 block">
										Before (Raw HTML/Screenshot)
									</span>
									<span className="text-title-h5 font-bold text-accent-crimson block">
										38,391 tokens
									</span>
								</div>
								<div className="text-title-h3 text-accent-black/30 font-light">
									→
								</div>
								<div className="text-right">
									<span className="text-accent-black/50 block">
										After (AgentLayerWeb)
									</span>
									<span className="text-title-h5 font-bold text-accent-forest block">
										2,500 tokens
									</span>
								</div>
							</div>
						</div>

						{/* Box 4: Open Source */}
						<div className="bg-background-base border border-border-muted p-32 rounded-6 flex flex-col justify-between">
							<div>
								<span className="text-body-small text-accent-black/40 uppercase font-bold block mb-12">
									Open Source
								</span>
								<h3 className="text-title-h4 font-bold text-accent-black mb-12 font-pixel-grid">
									Open standard for AI web interaction.
								</h3>
								<p className="text-body-medium text-accent-black/60 mb-24">
									Developed transparently and collaboratively. Join our
									community building the future of agentic web browsing.
								</p>
							</div>

							<a
								href="https://github.com/theajmalrazaq/agentlayerweb"
								target="_blank"
								rel="noopener noreferrer"
								className="bg-background-lighter p-16 rounded-6 border border-border-muted text-xs flex items-center justify-between hover:border-heat-100/30 transition-colors no-underline text-accent-black"
							>
								<div className="flex items-center gap-12">
									<svg
										fill="currentColor"
										viewBox="0 0 24 24"
										style={{ width: "24px", height: "24px" }}
									>
										<title>GitHub logo</title>
										<path
											fillRule="evenodd"
											clipRule="evenodd"
											d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z"
										/>
									</svg>
									<div>
										<span className="font-bold block text-body-medium">
											theajmalrazaq/agentlayerweb
										</span>
										<span className="text-accent-black/55 block">
											Open repository on GitHub
										</span>
									</div>
								</div>
								<span className="bg-heat-10 border border-heat-100/30 text-heat-100 font-bold px-12 py-6 rounded-6">
									Open →
								</span>
							</a>
						</div>
					</div>
				</div>
			</section>

			{/* We Handle the Hard Stuff Section */}
			<section className="py-80 px-24">
				<div className="max-w-1200 mx-auto">
					<div className="text-center mb-64">
						<div className="inline-block bg-heat-10 border border-heat-100/30 px-12 py-4 rounded-6 text-heat-100 text-body-small font-semibold mb-16">
							Zero configuration
						</div>
						<h2 className="text-title-h2 font-extrabold mb-16 text-accent-black font-pixel-grid">
							We handle the{" "}
							<span className="text-gradient font-pixel-grid">hard stuff</span>
						</h2>
						<p className="text-body-large text-accent-black/60 max-w-600 mx-auto">
							Javascript rendering, smart wait, schema parsing, validation
							mapping, and more.
						</p>
					</div>

					{/* Cards row */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-24 mb-48">
						{/* Card 1 */}
						<div className="bg-background-lighter border border-border-muted p-24 rounded-6">
							<span className="text-xs text-heat-100 font-bold uppercase block mb-8">
								✔ Docs to schema
							</span>
							<h4 className="text-title-h5 font-bold text-accent-black mb-8 font-pixel-grid">
								Tool Synthesis.
							</h4>
							<p className="text-body-medium text-accent-black/60">
								Automatically build JSON Schema declarations from your annotated
								forms.
							</p>
						</div>

						{/* Card 2 */}
						<div className="bg-background-lighter border border-border-muted p-24 rounded-6">
							<span className="text-xs text-accent-amethyst font-bold uppercase block mb-8">
								✔ Knows the intent
							</span>
							<h4 className="text-title-h5 font-bold text-accent-black mb-8 font-pixel-grid">
								Intent Parsing.
							</h4>
							<p className="text-body-medium text-accent-black/60">
								Map buttons, links, and inputs to semantic tools with standard
								execution weights.
							</p>
						</div>

						{/* Card 3 */}
						<div className="bg-background-lighter border border-border-muted p-24 rounded-6">
							<span className="text-xs text-accent-bluetron font-bold uppercase block mb-8">
								✔ Synchronized UI
							</span>
							<h4 className="text-title-h5 font-bold text-accent-black mb-8 font-pixel-grid">
								State Synchronization.
							</h4>
							<p className="text-body-medium text-accent-black/60">
								Intelligently notify browser agents of dynamic loading,
								completion, or form validation states.
							</p>
						</div>
					</div>

					{/* Interactive diagram card mockup */}
					<div className="bg-background-lighter border border-border-muted p-32 rounded-6 text-center max-w-720 mx-auto mb-48">
						<div className="flex items-center justify-between gap-16 text-xs">
							<div className="bg-background-base p-16 rounded-6 border border-border-muted w-1/3">
								<span className="font-bold block mb-4 text-accent-black">
									USER
								</span>
								<span className="text-accent-black/50 block">Search Query</span>
							</div>
							<div className="w-24 text-title-h4 text-accent-black/35 animate-pulse">
								➔
							</div>
							<div className="bg-heat-10 border border-heat-100/30 p-16 rounded-6 w-1/3">
								<span className="font-bold block mb-4 text-heat-100">
									AGENTLAYERWEB
								</span>
								<span className="text-heat-100/70 block">Annotate & Map</span>
							</div>
							<div className="w-24 text-title-h4 text-accent-black/35 animate-pulse">
								➔
							</div>
							<div className="bg-background-base p-16 rounded-6 border border-border-muted w-1/3">
								<span className="font-bold block mb-4 text-accent-black">
									INDEX & WEB
								</span>
								<span className="text-accent-black/50 block">
									AI Browser Tool
								</span>
							</div>
						</div>
					</div>

					{/* Custom grid cards below */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-24 text-body-medium">
						<div className="bg-background-base border border-border-muted p-24 rounded-6">
							<span className="text-xs text-heat-100 font-bold block mb-8 uppercase">
								Advanced web coverage
							</span>
							<h4 className="text-title-h5 font-bold mb-8 text-accent-black font-pixel-grid">
								Enhanced schema validation.
							</h4>
							<p className="text-accent-black/60">
								Validate input parameters before submission to avoid form
								validations errors.
							</p>
						</div>
						<div className="bg-background-base border border-border-muted p-24 rounded-6">
							<span className="text-xs text-accent-amethyst font-bold block mb-8 uppercase">
								Interact with pages
							</span>
							<h4 className="text-title-h5 font-bold mb-8 text-accent-black font-pixel-grid">
								Dynamic elements support.
							</h4>
							<p className="text-accent-black/60">
								Handle asynchronous forms, modals, and multi-step dialog flows
								natively.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Deep Research Dashboard mockup section */}
			<section className="py-80 bg-background-lighter px-24 border-t border-b border-border-muted">
				<div className="max-w-1200 mx-auto">
					<div className="text-center mb-64">
						<div className="inline-block bg-heat-10 border border-heat-100/30 px-12 py-4 rounded-6 text-heat-100 text-body-small font-semibold mb-16">
							Use cases
						</div>
						<h2 className="text-title-h2 font-extrabold mb-16 text-accent-black font-pixel-grid">
							Transform web interfaces into <br />
							<span className="text-heat-100 font-pixel-grid">AI-native</span>{" "}
							solutions
						</h2>
						<p className="text-body-large text-accent-black/60 max-w-600 mx-auto">
							See how you can give your AI better access to web forms with
							AgentLayerWeb.
						</p>
					</div>

					<div className="bg-background-base border border-border-loud rounded-6 overflow-hidden max-w-960 mx-auto grid grid-cols-1 md:grid-cols-3">
						{/* Sidebar */}
						<div className="border-r border-border-muted p-24 bg-[#fbfbfb]">
							<p className="text-body-small font-bold uppercase text-accent-black/45 mb-16">
								Agent Integration
							</p>
							<ul className="space-y-12 list-none p-0 m-0">
								{(["forms", "workflows", "crm"] as UseCaseType[]).map((tab) => (
									<li key={tab}>
										<button
											type="button"
											onClick={() => setActiveUseCase(tab)}
											className={`tab-item-btn p-12 rounded-6 flex items-center gap-8 cursor-pointer transition-colors w-full text-left ${
												activeUseCase === tab
													? "bg-background-base border border-border-muted text-accent-black font-bold"
													: "hover:bg-background-lighter text-accent-black/60"
											}`}
										>
											<span
												className={`w-8 h-8 rounded-0 ${
													activeUseCase === tab
														? "bg-heat-100"
														: "bg-accent-black/30"
												}`}
											/>
											<span className="text-body-small">
												{tab === "forms"
													? "Smarter AI Forms"
													: tab === "workflows"
														? "Autonomous Workflows"
														: "CRM Syncing"}
											</span>
										</button>
									</li>
								))}
							</ul>
						</div>

						{/* Content View */}
						<div className="col-span-2 p-32">
							<h4 className="text-title-h5 font-pixel-grid font-bold mb-16 text-accent-black">
								{useCaseData[activeUseCase].title}
							</h4>

							<div className="grid grid-cols-2 gap-16 text-body-small text-accent-black/60 mb-24">
								{useCaseData[activeUseCase].stats.map((stat) => (
									<div
										key={stat.label}
										className="border-b border-border-muted pb-8 flex justify-between"
									>
										<span>{stat.label}</span>
										<strong className="text-accent-black">{stat.val}</strong>
									</div>
								))}
							</div>

							<p className="text-body-medium text-accent-black/50 leading-relaxed mb-16">
								{useCaseData[activeUseCase].desc}
							</p>
							<Link
								href="/docs"
								className="text-body-small font-bold text-heat-100 hover:underline decoration-none"
							>
								Visit docs →
							</Link>
						</div>
					</div>
				</div>
			</section>

			{/* Testimonials grid section */}
			<section className="py-80 px-24">
				<div className="max-w-1200 mx-auto">
					<div className="text-center mb-64">
						<div className="inline-block bg-heat-10 border border-heat-100/30 px-12 py-4 rounded-6 text-heat-100 text-body-small font-semibold mb-16">
							Community
						</div>
						<h2 className="text-title-h2 font-extrabold mb-16 text-accent-black font-pixel-grid">
							People love <br />
							building with{" "}
							<span className="text-heat-100 font-pixel-grid">
								AgentLayerWeb
							</span>
						</h2>
						<p className="text-body-large text-accent-black/60 max-w-600 mx-auto">
							Discover why developers choose AgentLayerWeb every day.
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-24 text-body-medium">
						{/* Testimonial 1 */}
						<div className="bg-background-lighter border border-border-muted p-24 rounded-6 flex flex-col justify-between">
							<p className="italic text-accent-black/80 leading-relaxed mb-24">
								&ldquo;Annotating our dashboard took 10 minutes and now AI web
								agents can execute checkouts with 100% accuracy. Absolute game
								changer.&rdquo;
							</p>
							<div>
								<strong className="block text-accent-black">
									Morgan Linton
								</strong>
								<span className="text-xs text-accent-black/45">
									@morganlinton
								</span>
							</div>
						</div>

						{/* Testimonial 2 */}
						<div className="bg-background-lighter border border-border-muted p-24 rounded-6 flex flex-col justify-between">
							<p className="italic text-accent-black/80 leading-relaxed mb-24">
								&ldquo;WebMCP + AgentLayerWeb is the missing bridge between LLMs
								and UI. No more coordinate-guessing or brittle selector
								scripts.&rdquo;
							</p>
							<div>
								<strong className="block text-accent-black">
									Chris DeReese
								</strong>
								<span className="text-xs text-accent-black/45">
									@chrisdereese
								</span>
							</div>
						</div>

						{/* Testimonial 3 */}
						<div className="bg-background-lighter border border-border-muted p-24 rounded-6 flex flex-col justify-between">
							<p className="italic text-accent-black/80 leading-relaxed mb-24">
								&ldquo;Our agentic workflows went from 40% success rate (visual
								computer use) to 98% using AgentLayerWeb. Incredible.&rdquo;
							</p>
							<div>
								<strong className="block text-accent-black">
									Alex Reibman
								</strong>
								<span className="text-xs text-accent-black/45">
									@AlexReibman
								</span>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Frequently Asked Questions section */}
			<section className="py-80 bg-background-lighter px-24 border-t border-b border-border-muted">
				<div className="max-w-720 mx-auto">
					<div className="text-center mb-64">
						<div className="inline-block bg-heat-10 border border-heat-100/30 px-12 py-4 rounded-6 text-heat-100 text-body-small font-semibold mb-16">
							FAQ
						</div>
						<h2 className="text-title-h2 font-extrabold mb-16 text-accent-black font-pixel-grid">
							Frequently asked{" "}
							<span className="text-heat-100 font-pixel-grid">questions</span>
						</h2>
						<p className="text-body-large text-accent-black/60 max-w-600 mx-auto">
							Everything you need to know about AgentLayerWeb.
						</p>
					</div>

					<div className="space-y-16">
						<div className="bg-background-base border border-border-muted rounded-6 p-16">
							<strong className="block text-body-large text-accent-black mb-8 font-pixel-grid">
								What is AgentLayerWeb?
							</strong>
							<p className="text-body-medium text-accent-black/60 m-0">
								AgentLayerWeb is an Agent Experience (AX) framework that makes
								web applications natively optimized and usable by both humans
								and AI agents.
							</p>
						</div>

						<div className="bg-background-base border border-border-muted rounded-6 p-16">
							<strong className="block text-body-large text-accent-black mb-8 font-pixel-grid">
								How does it compare to visual scraping?
							</strong>
							<p className="text-body-medium text-accent-black/60 m-0">
								Instead of guessing element coordinates or parsing messy raw
								HTML, AgentLayerWeb provides clean tool schemas (WebMCP) that
								the browser serves directly to the agent.
							</p>
						</div>

						<div className="bg-background-base border border-border-muted rounded-6 p-16">
							<strong className="block text-body-large text-accent-black mb-8 font-pixel-grid">
								Do I need to rewrite my application?
							</strong>
							<p className="text-body-medium text-accent-black/60 m-0">
								No. You simply add simple data attributes or wrap components in
								React/Vue. It has zero runtime performance impact on human
								users.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Open Source Section */}
			<section id="pricing" className="py-96 px-24 bg-background-base">
				<div className="max-w-1200 mx-auto">
					{/* Header */}
					<div className="text-center mb-64">
						<div className="inline-flex items-center gap-8 bg-heat-10 border border-heat-100/20 px-12 py-4 rounded-6 text-heat-100 text-body-small font-semibold mb-24">
							<span
								className="bg-heat-100"
								style={{ width: "6px", height: "6px", borderRadius: "0px" }}
							></span>
							100% Free & Open Source
						</div>
						<h2 className="text-title-h2 font-extrabold tracking-tight text-accent-black mb-16 font-pixel-grid">
							Free forever No catch.
						</h2>
						<p className="text-body-large text-accent-black/60 max-w-560 mx-auto">
							AgentLayerWeb is MIT licensed. Use it in personal projects,
							startups, and enterprise products — no license fees, no usage
							limits, no expiry.
						</p>
					</div>

					{/* Single Big Free Card + 3 Community Cards */}
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-24 mb-48">
						{/* Big Free Card */}
						<div
							className="lg:col-span-2 border-2 border-heat-100 rounded-12 p-48 flex flex-col gap-32 relative"
							style={{
								background: "linear-gradient(135deg, #f0f4ff 0%, #ffffff 60%)",
							}}
						>
							<div>
								<div className="text-body-small font-bold uppercase tracking-wider text-heat-100/70 mb-8">
									MIT License
								</div>
								<div className="text-title-h1 font-extrabold text-accent-black">
									$0
								</div>
								<div className="text-body-large text-accent-black/50 mt-4">
									forever. seriously.
								</div>
							</div>
							<ul className="grid grid-cols-1 md:grid-cols-2 gap-12 list-none p-0 m-0 flex-1">
								{[
									"Full access to all 28 primitives",
									"React, Vue, Svelte & vanilla JS",
									"WebMCP standard alignment",
									"Local DOM validation built-in",
									"Commercial use included",
									"No registration required",
									"Works with Browser Use & Playwright",
									"Community support on GitHub",
								].map((f) => (
									<li
										key={f}
										className="flex items-start gap-8 text-body-medium text-accent-black/70"
									>
										<span
											className="text-heat-100 font-bold mt-1"
											style={{ flexShrink: 0 }}
										>
											✓
										</span>
										{f}
									</li>
								))}
							</ul>
							<a
								href="https://github.com/theajmalrazaq/agentlayerweb"
								target="_blank"
								rel="noopener noreferrer"
								className="pricing-btn bg-heat-100 hover:bg-heat-100/90 text-accent-white text-body-small font-semibold rounded-6 transition-colors duration-200 no-underline"
								style={{ maxWidth: "240px" }}
							>
								Get Started Free on GitHub
							</a>
						</div>

						{/* Right Column: 3 small cards */}
						<div className="flex flex-col gap-24">
							<div className="border border-border-muted rounded-12 p-24 flex flex-col gap-12 bg-background-base hover:border-heat-100/30 transition-colors duration-200">
								<div className="text-body-small font-bold uppercase tracking-wider text-accent-black/40">
									Chrome Extension
								</div>
								<div className="text-body-medium text-accent-black/70">
									See exactly what AI agents see on your page in real-time.
									Ships soon.
								</div>
								<a
									href="https://github.com/theajmalrazaq/agentlayerweb"
									target="_blank"
									rel="noopener noreferrer"
									className="pricing-btn border border-border-muted text-accent-black text-body-small font-semibold rounded-6 hover:bg-background-lighter transition-colors duration-200 no-underline"
								>
									Watch Repo
								</a>
							</div>
							<div className="border border-border-muted rounded-12 p-24 flex flex-col gap-12 bg-background-base hover:border-heat-100/30 transition-colors duration-200">
								<div className="text-body-small font-bold uppercase tracking-wider text-accent-black/40">
									Vite / Next.js Plugin
								</div>
								<div className="text-body-medium text-accent-black/70">
									Auto-annotate your app at build time. Zero manual markup
									needed.
								</div>
								<a
									href="https://github.com/theajmalrazaq/agentlayerweb"
									target="_blank"
									rel="noopener noreferrer"
									className="pricing-btn border border-border-muted text-accent-black text-body-small font-semibold rounded-6 hover:bg-background-lighter transition-colors duration-200 no-underline"
								>
									Watch Repo
								</a>
							</div>
							<div className="border border-border-muted rounded-12 p-24 flex flex-col gap-12 bg-accent-black">
								<div className="text-body-small font-bold uppercase tracking-wider text-accent-white/40">
									Enterprise Support
								</div>
								<div className="text-body-medium text-accent-white/70">
									Need a dedicated integration, custom primitives, or SLA
									support? Lets talk.
								</div>
								<a
									href="mailto:license@agentlayerweb.dev"
									className="pricing-btn border border-accent-white/20 text-accent-white text-body-small font-semibold rounded-6 hover:bg-accent-white/10 transition-colors duration-200 no-underline"
								>
									Contact Us
								</a>
							</div>
						</div>
					</div>

					{/* MIT note */}
					<p className="text-center text-body-small text-accent-black/40 mt-32">
						AgentLayerWeb is licensed under the{" "}
						<a
							href="https://github.com/theajmalrazaq/agentlayerweb/blob/main/LICENSE"
							target="_blank"
							rel="noopener noreferrer"
							className="text-heat-100 hover:underline"
						>
							MIT License
						</a>
						. Questions? Email{" "}
						<a
							href="mailto:hi@agentlayerweb.dev"
							className="text-heat-100 hover:underline"
						>
							hi@agentlayerweb.dev
						</a>
					</p>
				</div>
			</section>

			{/* Footer */}
			<footer className="bg-background-base pt-96 pb-48 px-24 relative overflow-hidden border-t border-border-muted">
				{/* Giant low-opacity Watermark Text (positioned where the footer starts) --> */}
				<div className="absolute -top-20 left-0 right-0 text-center pointer-events-none select-none z-0 leading-none">
					<span className="font-pixel-grid text-[12vw] opacity-5 tracking-tighter text-accent-black inline-block whitespace-nowrap uppercase">
						AgentLayerWeb
					</span>
				</div>

				<div className="max-w-1200 mx-auto relative z-10">
					{/* Main Footer Links Grid --> */}
					<div className="grid grid-cols-1 md:grid-cols-4 gap-48 mb-64 text-left">
						<div className="md:col-span-2">
							<div className="flex items-center gap-12 mb-16">
								{/* Logo Symbol */}
								<svg
									viewBox="0 0 61 67"
									fill="none"
									style={{ width: "24px", height: "26px" }}
								>
									<title>AgentLayerWeb logo</title>
									<path
										d="M20 22H12V55H55V67H0V10H20V22ZM32 37H43V49H20V22H32V37ZM43.5 0C43.9203 8.94373 51.1001 16.0862 60.0459 16.46L61 16.5L60.0459 16.54C51.1001 16.9138 43.9203 24.0563 43.5 33C43.0797 24.0563 35.8999 16.9138 26.9541 16.54L26 16.5L26.9541 16.46C35.8999 16.0862 43.0797 8.94373 43.5 0Z"
										fill="#0036FE"
									/>
								</svg>
								<span className="text-body-large font-bold tracking-tight text-accent-black">
									AgentLayerWeb
								</span>
							</div>
							<p className="text-body-medium text-accent-black/50 max-w-7xl">
								The Agent Experience (AX) framework for dual human-agent web
								applications. Build interfaces optimized for both human visual
								usage and AI agent interaction.
							</p>
						</div>
						<div>
							<h5 className="text-body-small font-bold uppercase tracking-wider text-accent-black/40 mb-16 font-pixel-grid">
								Community
							</h5>
							<ul className="space-y-12 list-none p-0 m-0 text-body-medium text-accent-black/60">
								<li>
									<a
										href="https://github.com/theajmalrazaq/agentlayerweb"
										target="_blank"
										rel="noopener noreferrer"
										className="hover:text-heat-100 transition-colors"
									>
										GitHub Repository
									</a>
								</li>
								<li>
									<a
										href="https://skills.sh/"
										target="_blank"
										rel="noopener noreferrer"
										className="hover:text-heat-100 transition-colors"
									>
										Skill Registry
									</a>
								</li>
							</ul>
						</div>
						<div>
							<h5 className="text-body-small font-bold uppercase tracking-wider text-accent-black/40 mb-16 font-pixel-grid">
								Specification
							</h5>
							<ul className="space-y-12 list-none p-0 m-0 text-body-medium text-accent-black/60">
								<li>
									<a
										href="https://webmachinelearning.github.io/webmcp/"
										target="_blank"
										rel="noopener noreferrer"
										className="hover:text-heat-100 transition-colors"
									>
										W3C WebMCP Spec
									</a>
								</li>
								<li>
									<Link
										href="/docs"
										className="hover:text-heat-100 transition-colors"
									>
										Documentation
									</Link>
								</li>
							</ul>
						</div>
					</div>

					{/* Bottom Copyright / Info --> */}
					<div className="border-t border-border-muted pt-24 flex flex-col md:flex-row items-center justify-between gap-16 text-body-small text-accent-black/40">
						<span>
							© 2026 AgentLayerWeb, Inc. Licensed under the{" "}
							<a
								href="https://github.com/theajmalrazaq/agentlayerweb/blob/main/LICENSE"
								target="_blank"
								rel="noopener noreferrer"
								className="hover:text-heat-100 transition-colors"
							>
								MIT License
							</a>
							.
						</span>
						<span>Free forever. No Catch.</span>
					</div>
				</div>
			</footer>
		</div>
	);
}
