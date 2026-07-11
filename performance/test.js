import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { ListToolsRequestSchema, CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const humanUrl = "https://theajmalrazaq.github.io/agentlayerweb/example/human";
const agentUrl =
	"https://theajmalrazaq.github.io/agentlayerweb/example/agentlayerweb";

async function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

// Estimate tokens (1 token ≈ 4 characters)
function estimateTokens(text) {
	return Math.ceil(text.length / 4);
}

// Pricing constants (Gemini 1.5 Flash comparable: $0.075/M input, $0.30/M output)
const COST_PER_INPUT_TOKEN = 0.075 / 1000000;
const COST_PER_OUTPUT_TOKEN = 0.3 / 1000000;

// Fetch helper for calling official APIs directly
async function callDirectAPI(model, system, messages, tools) {
	if (model.startsWith("claude")) {
		const apiKey = process.env.ANTHROPIC_API_KEY;
		if (!apiKey) {
			throw new Error("ANTHROPIC_API_KEY is not defined in the environment.");
		}

		const anthropicTools = tools && tools.length > 0 ? tools : undefined;

		const response = await fetch("https://api.anthropic.com/v1/messages", {
			method: "POST",
			headers: {
				"content-type": "application/json",
				"x-api-key": apiKey,
				"anthropic-version": "2023-06-01",
			},
			body: JSON.stringify({
				model: model,
				system: system || undefined,
				messages: messages,
				tools: anthropicTools,
				max_tokens: 4096,
			}),
		});

		if (!response.ok) {
			const errText = await response.text();
			throw new Error(`Anthropic API error (${response.status}): ${errText}`);
		}

		const data = await response.json();
		return {
			message: { content: data.content },
			promptTokens: data.usage?.input_tokens || 0,
			completionTokens: data.usage?.output_tokens || 0,
		};
	} else if (model.startsWith("gpt")) {
		const apiKey = process.env.OPENAI_API_KEY;
		if (!apiKey) {
			throw new Error("OPENAI_API_KEY is not defined in the environment.");
		}

		const openaiTools = (tools || []).map((t) => ({
			type: "function",
			function: {
				name: t.name,
				description: t.description,
				parameters: t.input_schema || t.inputSchema,
			},
		}));

		const openaiMessages = [];
		if (system) {
			openaiMessages.push({ role: "system", content: system });
		}

		for (const msg of messages) {
			if (msg.role === "assistant") {
				const toolUse = msg.content.find((c) => c.type === "tool_use");
				if (toolUse) {
					openaiMessages.push({
						role: "assistant",
						tool_calls: [
							{
								id: toolUse.id,
								type: "function",
								function: {
									name: toolUse.name,
									arguments: JSON.stringify(toolUse.input),
								},
							},
						],
					});
				} else {
					const text = msg.content.find((c) => c.type === "text")?.text || "";
					openaiMessages.push({ role: "assistant", content: text });
				}
			} else if (msg.role === "user") {
				if (Array.isArray(msg.content) && msg.content[0]?.type === "tool_result") {
					const toolResult = msg.content[0];
					openaiMessages.push({
						role: "tool",
						tool_call_id: toolResult.tool_use_id,
						content: toolResult.content,
					});
				} else {
					openaiMessages.push({
						role: "user",
						content: typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content),
					});
				}
			}
		}

		const body = {
			model: model,
			messages: openaiMessages,
		};
		if (openaiTools.length > 0) {
			body.tools = openaiTools;
		}

		const response = await fetch("https://api.openai.com/v1/chat/completions", {
			method: "POST",
			headers: {
				"content-type": "application/json",
				Authorization: `Bearer ${apiKey}`,
			},
			body: JSON.stringify(body),
		});

		if (!response.ok) {
			const errText = await response.text();
			throw new Error(`OpenAI API error (${response.status}): ${errText}`);
		}

		const data = await response.json();
		const choice = data.choices[0];

		const content = [];
		if (choice.message.content) {
			content.push({ type: "text", text: choice.message.content });
		}
		if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
			const call = choice.message.tool_calls[0];
			let inputArgs = {};
			try {
				inputArgs =
					typeof call.function.arguments === "string"
						? JSON.parse(call.function.arguments)
						: call.function.arguments;
			} catch (err) {
				// ignore
			}
			content.push({
				type: "tool_use",
				id: call.id,
				name: call.function.name,
				input: inputArgs,
			});
		}

		return {
			message: { content },
			promptTokens: data.usage?.prompt_tokens || 0,
			completionTokens: data.usage?.completion_tokens || 0,
		};
	} else {
		throw new Error(`Unsupported model: ${model}`);
	}
}

// ============================================================================
// SCENARIO 1: ACTUAL PLAYWRIGHT MCP SERVER (HUMAN PAGE)
// ============================================================================
async function runScenario1Human(modelName) {
	console.log(
		`\n🎬 SCENARIO 1: PLAYWRIGHT MCP SERVER (Human Page - No Annotations) | Model: ${modelName}`,
	);

	// Start the actual playwright-mcp server using StdioClientTransport
	const transport = new StdioClientTransport({
		command: "npx",
		args: ["playwright-mcp", "--executable-path", chromium.executablePath()],
	});

	const client = new Client(
		{ name: "playwright-benchmark-client", version: "1.0.0" },
		{ capabilities: {} }
	);

	try {
		await client.connect(transport);
	} catch (err) {
		console.error(`   ❌ Failed to connect to Playwright MCP server: ${err.message}`);
		throw err;
	}

	// Fetch available tools from the Playwright MCP server
	let mcpTools = [];
	try {
		const toolsResponse = await client.listTools();
		mcpTools = toolsResponse.tools || [];
	} catch (err) {
		console.error(`   ❌ Failed to list tools from Playwright MCP server: ${err.message}`);
		await client.close();
		throw err;
	}

	// Map to Anthropic tool format
	const tools = mcpTools.map((t) => ({
		name: t.name,
		description: t.description,
		input_schema: t.inputSchema,
	}));

	const systemPrompt =
		`You are an AI web automation assistant using the Playwright MCP server. Your goal is to add a new client entity. First, navigate to the target page using 'browser_navigate' with the URL: ${humanUrl}. Then take a snapshot using 'browser_snapshot' or use selectors to inspect the page. Fill the Company Legal Name with 'error', fill the Billing Email with 'test@example.com', select 'Enterprise Tier' as the Billing Tier, check the 'Enable Auto-Charge billing sweeps' checkbox, and click the 'Create client profile' button. If there is a validation error, clear/change the Company Legal Name to 'Acme Corp' and submit again. Once the confirmation modal appears, click Confirm. Verify success.`;

	const messages = [
		{
			role: "user",
			content: `Start the task by navigating to ${humanUrl}`,
		},
	];

	let success = false;
	let steps = 0;
	let inputTokens = 0;
	let outputTokens = 0;
	const startTime = Date.now();
	const traces = [];

	while (steps < 15) {
		steps++;
		const stepStart = Date.now();

		let result;
		try {
			result = await callDirectAPI(
				modelName,
				systemPrompt,
				messages,
				tools,
			);
		} catch (err) {
			console.error(`   ❌ API call failed: ${err.message}`);
			break;
		}

		const responseMessage = result.message;
		messages.push({
			role: "assistant",
			content: responseMessage.content,
		});
		inputTokens += result.promptTokens;
		outputTokens += result.completionTokens;

		const toolUseBlock = responseMessage.content.find(
			(c) => c.type === "tool_use",
		);
		if (toolUseBlock) {
			const name = toolUseBlock.name;
			const args = toolUseBlock.input;
			console.log(`[Human Step ${steps}] LLM called tool: ${name}`);

			let toolResultText = "";
			try {
				const mcpResult = await client.callTool({
					name,
					arguments: args,
				});
				toolResultText = (mcpResult.content || [])
					.map((c) => c.text || JSON.stringify(c))
					.join("\n");
			} catch (err) {
				toolResultText = `Error executing tool ${name}: ${err.message}`;
			}

			messages.push({
				role: "user",
				content: [
					{
						type: "tool_result",
						tool_use_id: toolUseBlock.id,
						content: toolResultText,
					},
				],
			});

			traces.push({
				step: steps,
				tool: name,
				arguments: args,
				result: toolResultText.substring(0, 150),
				durationMs: Date.now() - stepStart,
			});
		} else {
			const textResponse =
				responseMessage.content.find((c) => c.type === "text")?.text || "";
			if (
				textResponse.toLowerCase().includes("success") ||
				textResponse.toLowerCase().includes("complete")
			) {
				break;
			}
			break;
		}

		// Success check using browser_evaluate on the MCP server browser instance
		let successText = "";
		try {
			const evalResult = await client.callTool({
				name: "browser_evaluate",
				arguments: {
					function: "() => document.querySelector('#toast-notify-status')?.textContent || ''",
				},
			});
			successText = evalResult.content?.[0]?.text || "";
		} catch (err) {
			// ignore eval errors
		}

		if (successText.includes("created successfully!")) {
			success = true;
			break;
		}
	}

	const duration = (Date.now() - startTime) / 1000;

	try {
		await client.close();
	} catch (err) {
		// ignore
	}

	return {
		success,
		duration,
		steps,
		inputTokens,
		outputTokens,
		traces,
	};
}

// ============================================================================
// SCENARIO 2: SEMANTIC MCP TOOLS (AGENTLAYERWEB PAGE)
// ============================================================================
async function runScenario2Agent(modelName, browser) {
	console.log(
		`\n🎬 SCENARIO 2: AGENTLAYERWEB SEMANTIC MCP (Agent Page) | Model: ${modelName}`,
	);

	const page = await browser.newPage();
	await page.goto(agentUrl);
	await page.waitForLoadState("domcontentloaded");

	// Define AgentLayerWeb dynamic semantic tools in Anthropic format (with strict input schemas)
	const semanticTools = [
		{
			name: "get_page_state",
			description:
				"Retrieve the current semantic status of the page, including form errors, success messages, loaders, and active modals.",
			input_schema: {
				type: "object",
				properties: {
					reason: { type: "string", description: "Why check page state." },
				},
				required: ["reason"],
			},
		},
		{
			name: "create_client_profile",
			description:
				"Submit the client creation profile form using semantic parameters mapped to the AgentLayerWeb fields.",
			input_schema: {
				type: "object",
				properties: {
					companyName: {
						type: "string",
						description: "The Company Legal Name.",
					},
					billingEmail: {
						type: "string",
						description: "The Billing Email address.",
					},
					billingTier: {
						type: "string",
						enum: ["enterprise", "pro"],
						description: "The subscription tier.",
					},
					enableAutoCharge: {
						type: "boolean",
						description: "Enable auto-charge sweeps.",
					},
				},
				required: [
					"companyName",
					"billingEmail",
					"billingTier",
					"enableAutoCharge",
				],
			},
		},
		{
			name: "confirm_modal_action",
			description: "Click confirm inside the active confirm setup dialog.",
			input_schema: {
				type: "object",
				properties: {
					reason: { type: "string", description: "Reason for confirming." },
				},
				required: ["reason"],
			},
		},
		{
			name: "wait_for_loader",
			description:
				"Wait for the active provisioning loader spinner to complete.",
			input_schema: {
				type: "object",
				properties: {
					reason: { type: "string", description: "Reason for waiting." },
				},
				required: ["reason"],
			},
		},
	];

	// Create real MCP Server for Scenario 2 semantic tools
	const server = new Server(
		{ name: "agentlayerweb-semantic-mcp", version: "1.0.0" },
		{ capabilities: { tools: {} } }
	);

	server.setRequestHandler(ListToolsRequestSchema, async () => {
		return {
			tools: semanticTools.map((t) => ({
				name: t.name,
				description: t.description,
				inputSchema: t.input_schema,
			})),
		};
	});

	server.setRequestHandler(CallToolRequestSchema, async (request) => {
		const { name, arguments: args } = request.params;
		let toolResult = "";

		try {
			if (name === "get_page_state") {
				const state = await page.evaluate(() => {
					const errEl = document.querySelector("[data-agent-error]");
					const successEl = document.querySelector("[data-agent-success]");
					const loaderEl = document.querySelector("[data-agent-loading]");
					const dialogEl = document.querySelector("[data-agent-dialog]");
					const stepEl = document.querySelector("[data-agent-step-current]");

					return {
						activeError: errEl
							? errEl.getAttribute("data-agent-error") || errEl.textContent
							: null,
						activeSuccess: successEl
							? successEl.getAttribute("data-agent-success") ||
								successEl.textContent
							: null,
						activeLoader: loaderEl
							? loaderEl.getAttribute("data-agent-loading") ||
								loaderEl.textContent
							: null,
						activeDialog: dialogEl
							? dialogEl.getAttribute("data-agent-purpose")
							: null,
						currentStep: stepEl
							? stepEl.getAttribute("data-agent-step-current")
							: null,
					};
				});
				toolResult = JSON.stringify(state);
			} else if (name === "create_client_profile") {
				await page.fill(
					"[data-agent-field='company_name']",
					args.companyName,
				);
				await page.fill(
					"[data-agent-field='billing_email']",
					args.billingEmail,
				);
				await page.selectOption(
					"[data-agent-field='billing_tier']",
					args.billingTier,
				);
				await page.setChecked(
					"[data-agent-toggle='auto_charge']",
					args.enableAutoCharge,
				);
				await page.click("[data-agent-id='submit_client']");
				toolResult = "Form inputs set and submitted via semantic endpoints.";
			} else if (name === "confirm_modal_action") {
				await page.click("[data-agent-confirmation='confirm_submit']");
				toolResult = "Confirmed client setup inside the modal dialog.";
			} else if (name === "wait_for_loader") {
				await page.waitForSelector("[data-agent-loading]", {
					state: "detached",
					timeout: 6000,
				});
				toolResult = "Loader complete, provisioning finalized.";
			} else {
				throw new Error(`Tool ${name} not found`);
			}
		} catch (err) {
			toolResult = `Error executing tool ${name}: ${err.message}`;
		}

		return {
			content: [{ type: "text", text: toolResult }],
		};
	});

	// Create linked pair of transports and connect client/server in-memory
	const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
	const client = new Client(
		{ name: "semantic-mcp-client", version: "1.0.0" },
		{ capabilities: {} }
	);

	await Promise.all([
		client.connect(clientTransport),
		server.connect(serverTransport),
	]);

	// Fetch tools from the MCP server to expose to the LLM
	let mcpTools = [];
	try {
		const toolsResponse = await client.listTools();
		mcpTools = toolsResponse.tools || [];
	} catch (err) {
		console.error(`   ❌ Failed to list tools from semantic MCP server: ${err.message}`);
		await client.close();
		await page.close();
		throw err;
	}

	const tools = mcpTools.map((t) => ({
		name: t.name,
		description: t.description,
		input_schema: t.inputSchema,
	}));

	const systemPrompt =
		"You are an AI web automation assistant using high-level semantic tools. Your goal is to add a new client entity. First check the page state using 'get_page_state'. If there is a form, use 'create_client_profile' to submit: Company Legal Name = 'error', Billing Email = 'test@example.com', Billing Tier = 'enterprise', Enable Auto-Charge = true. Check the page state again. If there is a validation error, change the Company Legal Name to 'Acme Corp' and submit again. Confirm the modal action, wait for the loader, and verify success.";

	const messages = [
		{
			role: "user",
			content: "Start the task and check the page state first.",
		},
	];

	let success = false;
	let steps = 0;
	let inputTokens = 0;
	let outputTokens = 0;
	const startTime = Date.now();
	const traces = [];

	while (steps < 15) {
		steps++;
		const stepStart = Date.now();

		let result;
		try {
			result = await callDirectAPI(
				modelName,
				systemPrompt,
				messages,
				tools,
			);
		} catch (err) {
			console.error(`   ❌ API call failed: ${err.message}`);
			break;
		}

		const responseMessage = result.message;
		messages.push({
			role: "assistant",
			content: responseMessage.content,
		});
		inputTokens += result.promptTokens;
		outputTokens += result.completionTokens;

		const toolUseBlock = responseMessage.content.find(
			(c) => c.type === "tool_use",
		);
		if (toolUseBlock) {
			const name = toolUseBlock.name;
			const args = toolUseBlock.input;
			console.log(`[Agent Step ${steps}] LLM called tool: ${name}`);

			let toolResultText = "";
			try {
				const mcpResult = await client.callTool({
					name,
					arguments: args,
				});
				toolResultText = (mcpResult.content || [])
					.map((c) => c.text || JSON.stringify(c))
					.join("\n");
			} catch (err) {
				toolResultText = `Error executing tool ${name}: ${err.message}`;
			}

			messages.push({
				role: "user",
				content: [
					{
						type: "tool_result",
						tool_use_id: toolUseBlock.id,
						content: toolResultText,
					},
				],
			});

			traces.push({
				step: steps,
				tool: name,
				arguments: args,
				result: toolResultText,
				durationMs: Date.now() - stepStart,
			});
		} else {
			const textResponse =
				responseMessage.content.find((c) => c.type === "text")?.text || "";
			if (
				textResponse.toLowerCase().includes("success") ||
				textResponse.toLowerCase().includes("complete")
			) {
				break;
			}
			break;
		}

		// Success check
		const successText = await page.evaluate(() => {
			const el = document.querySelector("[data-agent-success]");
			return el ? el.textContent : null;
		});
		if (successText?.includes("created successfully!")) {
			success = true;
			break;
		}
	}

	const duration = (Date.now() - startTime) / 1000;

	try {
		await client.close();
	} catch (err) {
		// ignore
	}
	await page.close();

	return {
		success,
		duration,
		steps,
		inputTokens,
		outputTokens,
		traces,
	};
}

async function main() {
	console.log("=============================================================");
	console.log("       AGENTLAYERWEB VS PLAYWRIGHT MCP BENCHMARK");
	console.log("=============================================================");

	// Verify environment variables are present
	if (!process.env.OPENAI_API_KEY) {
		console.error("❌ Error: OPENAI_API_KEY environment variable is not defined.");
		process.exit(1);
	}
	if (!process.env.ANTHROPIC_API_KEY) {
		console.error("❌ Error: ANTHROPIC_API_KEY environment variable is not defined.");
		process.exit(1);
	}

	console.log("Detected API Keys for OpenAI and Anthropic.");

	// Models to benchmark
	const targetModels = [
		"claude-haiku-4-5",
		"gpt-4o-mini",
	];

	// Launch Playwright Chromium (used for Scenario 2)
	const browser = await chromium.launch({ headless: false });
	const results = {};
	const allTraces = {
		timestamp: new Date().toISOString(),
	};

	for (const modelName of targetModels) {
		console.log(`\n⏳ Running benchmark for model: ${modelName}...`);
		try {
			const humanRes = await runScenario1Human(modelName);
			const agentRes = await runScenario2Agent(modelName, browser);

			const humanCost =
				humanRes.inputTokens * COST_PER_INPUT_TOKEN +
				humanRes.outputTokens * COST_PER_OUTPUT_TOKEN;
			const agentCost =
				agentRes.inputTokens * COST_PER_INPUT_TOKEN +
				agentRes.outputTokens * COST_PER_OUTPUT_TOKEN;

			const speedup = (humanRes.success && agentRes.success)
				? (humanRes.duration / agentRes.duration).toFixed(2)
				: 0;
			const tokenSavings = (humanRes.success && agentRes.success)
				? (((humanRes.inputTokens - agentRes.inputTokens) / humanRes.inputTokens) * 100).toFixed(1)
				: "0";
			const costSavings = (humanRes.success && agentRes.success)
				? (((humanCost - agentCost) / humanCost) * 100).toFixed(1)
				: "0";

			results[modelName] = {
				human: {
					success: humanRes.success,
					duration: humanRes.duration.toFixed(2),
					steps: humanRes.steps,
					tokens: humanRes.inputTokens,
					cost: humanCost.toFixed(6),
				},
				agent: {
					success: agentRes.success,
					duration: agentRes.duration.toFixed(2),
					steps: agentRes.steps,
					tokens: agentRes.inputTokens,
					cost: agentCost.toFixed(6),
				},
				comparison: {
					speedup: speedup > 0 ? `${speedup}x` : "N/A",
					tokenSavings: tokenSavings !== "0" ? `${tokenSavings}%` : "N/A",
					costSavings: costSavings !== "0" ? `${costSavings}%` : "N/A",
				},
			};

			allTraces[`scenario_${modelName}`] = {
				human: humanRes.traces,
				agent: agentRes.traces,
			};
		} catch (err) {
			console.error(`❌ Failed to benchmark model ${modelName}:`, err.message);
		}
	}

	await browser.close();

	console.log(
		"\n=============================================================================================================",
	);
	console.log("                                        CONSOLIDATED COMPARATIVE RESULTS");
	console.log(
		"=============================================================================================================",
	);
	console.log(
		String.prototype.padEnd.call("Model", 25) +
			" | " +
			String.prototype.padEnd.call("Human Perf (Duration/Steps/Tokens)", 38) +
			" | " +
			String.prototype.padEnd.call("Agent Perf (Duration/Steps/Tokens)", 38) +
			" | " +
			String.prototype.padEnd.call("Speedup", 8) +
			" | " +
			"Tok. Save"
	);
	console.log("-".repeat(122));
	for (const m of Object.keys(results)) {
		const hStr = results[m].human.success
			? `${results[m].human.duration}s / ${results[m].human.steps} steps / ${results[m].human.tokens} tokens`
			: "Failed";
		const aStr = results[m].agent.success
			? `${results[m].agent.duration}s / ${results[m].agent.steps} steps / ${results[m].agent.tokens} tokens`
			: "Failed";
		console.log(
			String.prototype.padEnd.call(m, 25) +
				" | " +
				String.prototype.padEnd.call(hStr, 38) +
				" | " +
				String.prototype.padEnd.call(aStr, 38) +
				" | " +
				String.prototype.padEnd.call(results[m].comparison.speedup, 8) +
				" | " +
				results[m].comparison.tokenSavings,
		);
	}
	console.log(
		"=============================================================================================================",
	);

	// Save consolidated results
	const resultsPath = path.join(__dirname, "../docs/browser-use-results.json");
	fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2), "utf8");
	console.log(`Saved consolidated results to: ${resultsPath}`);

	const tracesPath = path.join(
		__dirname,
		"../docs/browser-use-raw-traces.json",
	);
	fs.writeFileSync(tracesPath, JSON.stringify(allTraces, null, 2), "utf8");
	console.log(`Saved traces to: ${tracesPath}`);
}

main().catch((err) => {
	console.error("Global Error running benchmark:", err.message);
});
