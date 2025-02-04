import { spawn, ChildProcess } from 'child_process';
import * as fs from 'fs';

let messageId = 1;

// Spawn clangd with stdio pipes
const clangd: ChildProcess = spawn('/home/vscode/.vscode-server/data/User/globalStorage/llvm-vs-code-extensions.vscode-clangd/install/19.1.2/clangd_19.1.2/bin/clangd', [], {
    cwd: '/workspaces/gen-ai/cpp-app-example',
    stdio: [process.stdin, process.stdout, fs.openSync('/workspaces/gen-ai/mcp-server-example/out/err.log', 'w')]
});

export function initializeServer(): Promise<void> {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();

        setTimeout(() => {
            if ((Date.now() - startTime) > 3000) {
                fs.appendFileSync('/workspaces/gen-ai/mcp-server-example/out/err.log', '[Clangd connector] Server initialized');
                resolve();
            } else {
                reject(new Error('Server failed to initialize'));
            }
        }, 3000);
    });
}

function sendMessageToClangd(method: string, params: any): Promise<any> {
    return new Promise((resolve, reject) => {
        const id = messageId++;
        const message = {
            jsonrpc: '2.0',
            id,
            method,
            params,
        };
        const json = JSON.stringify(message);
        const header = `Content-Length: ${Buffer.byteLength(json, 'utf8')}\r\n\r\n`;
        const fullMessage = header + json;
        clangd.stdin?.write(fullMessage);

        let dataBuffer = '';
        const onData = (data: Buffer) => {
            dataBuffer += data.toString();
            const headerMatch = dataBuffer.match(/Content-Length: (\d+)\r\n\r\n/);
            if (headerMatch) {
                const length = parseInt(headerMatch[1], 10);
                const headerEnd = dataBuffer.indexOf('\r\n\r\n');
                if (headerEnd !== -1 && dataBuffer.length >= headerEnd + 4 + length) {
                    const jsonResponse = dataBuffer.substr(headerEnd + 4, length);
                    try {
                        const response = JSON.parse(jsonResponse);
                        if (response.id === id) {
                            clangd.stdout?.removeListener('data', onData);
                            resolve(response);
                        }
                    } catch (err) {
                        clangd.stdout?.removeListener('data', onData);
                        reject(err);
                    }
                }
            }
        };

        clangd.stdout?.on('data', onData);
    });
}

// TODO fix type
export async function getReferences(name: string | string[]): Promise<string> {
    try {
        // console.log(`getting data for name: ${name}`);
        const method = "textDocument/references";
        const parameters = '{"context":{"includeDeclaration":true},"position":{"character":11,"line":2},"textDocument":{"uri":"file:///workspaces/gen-ai/cpp-app-example/src/client_foo.cpp"}}}';
        const response = await sendMessageToClangd(method, parameters);
        return response;
    } catch (err) {
        console.error('Error getting references:', err);
        throw new Error('Failed to get references');
    }
}
