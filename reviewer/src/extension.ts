/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import * as vscode from 'vscode';

export function activate({ subscriptions }: vscode.ExtensionContext) {
    const outputChannel = vscode.window.createOutputChannel('reviewer');

    // register a command that opens a cowsay-document
    subscriptions.push(vscode.commands.registerCommand('foo', async () => {
        outputChannel.show();
        outputChannel.appendLine('foo run');

        // Get chat models from the language model API
        const models = await vscode.lm.selectChatModels();
        if (!models || models.length === 0) {
            outputChannel.appendLine('No available LLM models.');
            return;
        }
        const [model] = models;

        const prompt = "Are you a programming expert";
        outputChannel.appendLine(`Sending prompt: ${prompt}`);

        try {
            // Send the prompt to the LLM and await its response.
            const request = new vscode.LanguageModelChatMessage(vscode.LanguageModelChatMessageRole.User, prompt);
            const response = await model.sendRequest([request]);

            try {
                // consume stream
                const data = [];
                for await (const chunk of response.stream) {
                    if (chunk instanceof vscode.LanguageModelTextPart) {
                        data.push(chunk.value);
                    } else if (chunk instanceof vscode.LanguageModelToolCallPart) {
                        // do nothing for now, TODO
                    }
                }

                outputChannel.appendLine(`LLM response: ${data.join('')}`);

            } catch (e) {
                outputChannel.appendLine(`Error processing stream from LLM: ${e}`);
            }
        } catch (error) {
            outputChannel.appendLine(`Error calling LLM: ${error}`);
        }
    }));

    subscriptions.push(outputChannel);

    // const [model] = await vscode.lm.selectChatModels();

    // subscriptions.push(vscode.languages.registerInlineCompletionItemProvider({ pattern: '**/*' }, {
    //     provideInlineCompletionItems(document, position, context, token) {
    //         const linePrefix = document.lineAt(position).text.substring(0, position.character);
    //         if (!linePrefix.endsWith('trigger')) {
    //             return { items: [] };
    //         }
    //         const completion = ' This is an inline suggestion from the language model API';
    //         const range = new vscode.Range(position, position);
    //         return { items: [new vscode.InlineCompletionItem(completion, range)] };
    //     }
    // }));
}
