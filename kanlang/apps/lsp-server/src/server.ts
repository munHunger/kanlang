/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import {
  createConnection,
  TextDocuments,
  Diagnostic,
  DiagnosticSeverity,
  ProposedFeatures,
  InitializeParams,
  DidChangeConfigurationNotification,
  CompletionItem,
  CompletionItemKind,
  TextDocumentPositionParams,
  TextDocumentSyncKind,
  InitializeResult,
  MarkupKind,
} from 'vscode-languageserver/node';

import { TextDocument } from 'vscode-languageserver-textdocument';
import { Token, TokenizerError, compile } from '@kanlang/kanlang';
import { CompileError, CompileErrors } from 'libs/kanlang/src/lib/compileError';
import { ParseTree } from 'libs/kanlang/src/lib/parseTree';

// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager.
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
let hasDiagnosticRelatedInformationCapability = false;

let compiled: { tokens: Token[]; sem: ParseTree; out: string };

export async function validateTextDocument(
  textDocument: TextDocument
): Promise<void> {
  const text = textDocument.getText();

  const diagnostics: Diagnostic[] = [];
  try {
    compiled = compile(text);
  } catch (e) {
    if (e instanceof TokenizerError) {
      const diagnostic: Diagnostic = {
        severity: DiagnosticSeverity.Error,
        range: {
          start: {
            line: e.lineNumber,
            character: e.character,
          },
          end: {
            line: e.lineNumber,
            character: e.character + e.length,
          },
        },
        message: e.message,
        source: 'kanlang tokenizer',
      };
      if (hasDiagnosticRelatedInformationCapability) {
        diagnostic.relatedInformation = [
          {
            location: {
              uri: textDocument.uri,
              range: Object.assign({}, diagnostic.range),
            },
            message: 'Spelling matters',
          },
          {
            location: {
              uri: textDocument.uri,
              range: Object.assign({}, diagnostic.range),
            },
            message: 'Particularly for names',
          },
        ];
      }
      diagnostics.push(diagnostic);
    } else if (e instanceof CompileError) {
      const diagnostic: Diagnostic = {
        severity: DiagnosticSeverity.Error,
        range: {
          start: {
            line: e.lineNumber,
            character: e.charIndex,
          },
          end: {
            line: e.lineNumber,
            character: e.charIndex + e.length,
          },
        },
        message: e.message,
        source: 'kanlang parser',
      };
      diagnostics.push(diagnostic);
    } else if (e instanceof CompileErrors) {
      e.errors.forEach((e) => {
        const diagnostic: Diagnostic = {
          severity: DiagnosticSeverity.Error,
          range: {
            start: {
              line: e.lineNumber,
              character: e.charIndex,
            },
            end: {
              line: e.lineNumber,
              character: e.charIndex + e.length,
            },
          },
          message: e.message,
          source: 'kanlang parser',
        };
        diagnostics.push(diagnostic);
      });
    }
  }
  // Send the computed diagnostics to VSCode.
  connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

connection.onInitialize((params: InitializeParams) => {
  const capabilities = params.capabilities;

  // Does the client support the `workspace/configuration` request?
  // If not, we fall back using global settings.
  hasConfigurationCapability = !!(
    capabilities.workspace && !!capabilities.workspace.configuration
  );
  hasWorkspaceFolderCapability = !!(
    capabilities.workspace && !!capabilities.workspace.workspaceFolders
  );
  hasDiagnosticRelatedInformationCapability = !!(
    capabilities.textDocument &&
    capabilities.textDocument.publishDiagnostics &&
    capabilities.textDocument.publishDiagnostics.relatedInformation
  );

  const result: InitializeResult = {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      // Tell the client that this server supports code completion.
      completionProvider: {
        resolveProvider: true,
      },
      hoverProvider: true,
    },
  };
  if (hasWorkspaceFolderCapability) {
    result.capabilities.workspace = {
      workspaceFolders: {
        supported: true,
      },
    };
  }

  return result;
});

connection.onInitialized(() => {
  if (hasConfigurationCapability) {
    // Register for all configuration changes.
    connection.client.register(
      DidChangeConfigurationNotification.type,
      undefined
    );
  }
  if (hasWorkspaceFolderCapability) {
    connection.workspace.onDidChangeWorkspaceFolders((_event) => {
      connection.console.log('Workspace folder change event received.');
    });
  }
});

// The example settings
interface ExampleSettings {
  maxNumberOfProblems: number;
}

// The global settings, used when the `workspace/configuration` request is not supported by the client.
// Please note that this is not the case when using this server with the client provided in this example
// but could happen with other clients.
const defaultSettings: ExampleSettings = { maxNumberOfProblems: 1000 };
let globalSettings: ExampleSettings = defaultSettings;

// Cache the settings of all open documents
const documentSettings: Map<string, Thenable<ExampleSettings>> = new Map();

connection.onDidChangeConfiguration((change) => {
  if (hasConfigurationCapability) {
    // Reset all cached document settings
    documentSettings.clear();
  } else {
    globalSettings = <ExampleSettings>(
      (change.settings.languageServerExample || defaultSettings)
    );
  }

  // Revalidate all open text documents
  documents.all().forEach(validateTextDocument);
});

function getDocumentSettings(resource: string): Thenable<ExampleSettings> {
  if (!hasConfigurationCapability) {
    return Promise.resolve(globalSettings);
  }
  let result = documentSettings.get(resource);
  if (!result) {
    result = connection.workspace.getConfiguration({
      scopeUri: resource,
      section: 'languageServerExample',
    });
    documentSettings.set(resource, result);
  }
  return result;
}

// Only keep settings for open documents
documents.onDidClose((e) => {
  documentSettings.delete(e.document.uri);
});

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent((change) => {
  validateTextDocument(change.document);
});

// connection.onCodeLens((_lens): HandlerResult<CodeLens[], void> => {
//   return [
//     new CodeLens(new Range(new Position(0, 0), new Position(0, 1)), {
//       title: 'save',
//       command: 'command',
//       tooltip: 'tooltip',
//     }),
//   ];
// });

connection.onHover((hover) => {
  const text = documents.get(hover.textDocument.uri).getText();

  try {
    const state = compile(text);
    const hoveredToken = state.tokens.find(
      (token) =>
        token.position.line == hover.position.line &&
        hover.position.character >= token.position.character &&
        hover.position.character < token.position.character + token.value.length
    );
    if (!hoveredToken) {
      connection.console.log(
        `could compile code but could not find token at (${hover.position.line}: ${hover.position.character})`
      );
    }
    if (hoveredToken && hoveredToken.type == 'identifier') {
      const tree = state.sem.getChildStartingOnToken(hoveredToken);
      const declaration = tree.getDeclaration(hoveredToken.value);
      connection.console.log(
        `got a declaration ${JSON.stringify(declaration, null, 2)}`
      );
      if (declaration) {
        if (declaration.variable) {
          return {
            contents: {
              kind: MarkupKind.Markdown,
              value:
                '```typescript\nlet ' +
                hoveredToken.value +
                ': ' +
                declaration.variable.type +
                '\n```',
            },
          };
        } else {
          return {
            contents: {
              kind: MarkupKind.Markdown,
              value:
                '```\n ' +
                hoveredToken.value +
                ': ' +
                declaration.type.alias + //alias is the only thing supported at the moment
                '\n```',
            },
          };
        }
      } else {
        connection.console.log('could not find any declaration');
      }
    }
  } catch (e) {
    //shit the bed
  }
});

connection.onDidChangeWatchedFiles((_change) => {
  // Monitored files have change in VSCode
  connection.console.log('We received an file change event');
});

// This handler provides the initial list of the completion items.
connection.onCompletion(
  (cursor: TextDocumentPositionParams): CompletionItem[] => {
    // const cursorToken = compiled.tokens.find(
    //   (token) =>
    //     token.position.line == cursor.position.line &&
    //     cursor.position.character >= token.position.character &&
    //     cursor.position.character <
    //       token.position.character + token.value.length
    // );
    // if (cursorToken && cursorToken.type == 'identifier') {
    //   connection.console.log(
    //     `searching for tree at ${cursorToken.start}: ${cursorToken.value}`
    //   );
    //   const tree = compiled.sem.getChildStartingOnToken(cursorToken);
    //   if (tree) {
    //     const declarations = tree.getAllDeclarationsInScope(); //TODO: this is brutally slow
    //     return declarations.map((d) => ({
    //       label: d.name,
    //       kind: d.type ? CompletionItemKind.Function : CompletionItemKind.Field,
    //     }));
    //   } else {
    //     connection.console.log(
    //       `could not find tree at ${cursorToken.start}: ${
    //         cursorToken.value
    //       }. ${compiled.sem.printScope()}`
    //     );
    //   }
    // }
    return [];
  }
);

// This handler resolves additional information for the item selected in
// the completion list.
connection.onCompletionResolve((item: CompletionItem): CompletionItem => {
  if (item.data === 1) {
    item.detail = 'TypeScript details';
    item.documentation = 'TypeScript documentation';
  } else if (item.data === 2) {
    item.detail = 'JavaScript details';
    item.documentation = 'JavaScript documentation';
  }
  return item;
});

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();
connection.console.log('Kanlang LSP up and running');
