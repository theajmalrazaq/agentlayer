import { GeistPixelGrid } from "geist/font/pixel";
import type { Metadata } from "next";
import { Google_Sans_Flex } from "next/font/google";
import "./globals.css";

const googleSansFlex = Google_Sans_Flex({
	subsets: ["latin"],
	variable: "--font-google-sans-flex",
	display: "swap",
});

export const metadata: Metadata = {
	title:
		"AgentLayerWeb — The Agent Experience (AX) Framework for Dual Human-Agent Web Applications",
	description:
		"An Agent Experience (AX) framework for dual human-agent web applications. Build interfaces optimized for both human visual usage and AI agent interaction.",
	icons: {
		icon: "/logo.svg",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			className={`${googleSansFlex.variable} ${GeistPixelGrid.variable} h-full antialiased`}
			suppressHydrationWarning
		>
			<head>
				<script>{`
              (function() {
                const origError = console.error;
                console.error = function(...args) {
                  const msg = args.map(arg => {
                    try {
                      return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
                    } catch (e) {
                      return String(arg);
                    }
                  }).join(' ');
                  if (msg.includes('bis_skin_checked')) {
                    return;
                  }
                  origError.apply(console, args);
                };
              })();
            `}</script>
			</head>
			<body
				className="min-h-full flex flex-col bg-background-base text-accent-black antialiased selection:bg-heat-100 selection:text-accent-white font-google"
				data-agent-role="page"
				data-agent-page="landing_page"
				data-agent-title="AgentLayerWeb Landing Page"
				suppressHydrationWarning
			>
				{children}
			</body>
		</html>
	);
}
