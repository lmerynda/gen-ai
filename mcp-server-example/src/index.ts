import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { getReferences, initializeServer } from "./clangd-connector";

initializeServer();

// Create an MCP server
const server = new McpServer({
    name: "Demo",
    version: "1.0.0",
});

// Add an addition tool
server.tool("add",
    { a: z.number(), b: z.number() },
    async ({ a, b }) => ({
        content: [{ type: "text", text: String(a + b) }]
    })
);

// Add a dynamic greeting resource
server.resource(
    "greeting",
    new ResourceTemplate("greeting://{name}", { list: undefined }),
    async (uri, { name }) => ({
        contents: [{
            uri: uri.href,
            text: `Hello, ${name}!`
        }]
    })
);

server.resource(
    "clangd-references",
    new ResourceTemplate("references://{name}", { list: undefined }),
    async (uri, { name }) => ({
        contents: [{
            uri: uri.href,
            text: `clangd references response: ${JSON.stringify(await getReferences(name))}`
        }]
    })
);

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
server.connect(transport);
