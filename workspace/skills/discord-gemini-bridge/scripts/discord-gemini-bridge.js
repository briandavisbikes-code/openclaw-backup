// Discord Gemini Bridge Skill
// Intercepts Discord messages and routes through Gemini bridge

const http = require('http');
const https = require('https');
const { URL } = require('url');

const BRIDGE_URL = 'http://localhost:3001/process';
const LOG_FILE = '/Users/bro/.openclaw/workspace/discord-gemini-usage.log';

// Simple logging function
function logUsage(source, promptLength, responseLength, responseSource) {
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} | ${source} | prompt:${promptLength} | response:${responseLength} | source:${responseSource}\n`;
    
    require('fs').appendFileSync(LOG_FILE, logEntry, 'utf8');
}

// Estimate tokens (rough approximation)
function estimateTokens(text) {
    // Rough estimate: 1 token ≈ 4 characters for English
    return Math.ceil(text.length / 4);
}

// Call Gemini bridge
async function callGeminiBridge(prompt) {
    return new Promise((resolve, reject) => {
        const url = new URL(BRIDGE_URL);
        const options = {
            hostname: url.hostname,
            port: url.port || 3001,
            path: url.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    resolve(response);
                } catch (error) {
                    reject(new Error(`Failed to parse response: ${error.message}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(new Error(`Request failed: ${error.message}`));
        });

        req.write(JSON.stringify({ prompt }));
        req.end();
    });
}

// Main skill module
module.exports = {
    name: 'discord_gemini_bridge',
    description: 'Routes Discord messages through Gemini bridge for cost savings',
    
    // This skill intercepts Discord messages
    intercepts: ['discord'],
    
    async beforeMessageSend(context) {
        // Only intercept Discord messages
        if (context.channel !== 'discord') {
            return null; // Don't intercept
        }

        const { message, agent } = context;
        
        // Don't intercept system messages or commands
        if (!message || message.startsWith('/') || message.startsWith('!')) {
            return null;
        }

        try {
            console.log(`[Gemini Bridge] Intercepting Discord message: ${message.substring(0, 100)}...`);
            
            // Call Gemini bridge
            const response = await callGeminiBridge(message);
            
            if (response.success) {
                const promptTokens = estimateTokens(message);
                const responseTokens = estimateTokens(response.text);
                
                // Log usage
                logUsage('discord', promptTokens, responseTokens, response.source);
                
                console.log(`[Gemini Bridge] Response from ${response.source} (${responseTokens} tokens)`);
                
                // Return intercepted response
                return {
                    intercepted: true,
                    response: response.text,
                    source: 'gemini-bridge',
                    metadata: {
                        promptTokens,
                        responseTokens,
                        bridgeSource: response.source
                    }
                };
            } else {
                console.log(`[Gemini Bridge] Bridge failed: ${response.error}`);
                // Let message continue to DeepSeek (fallback)
                return null;
            }
            
        } catch (error) {
            console.error(`[Gemini Bridge] Error: ${error.message}`);
            // Fall back to DeepSeek
            return null;
        }
    },
    
    // Optional: Provide a tool for manual testing
    tools: [
        {
            name: 'test_gemini_bridge',
            description: 'Test the Gemini bridge with a message',
            parameters: {
                type: 'object',
                properties: {
                    message: {
                        type: 'string',
                        description: 'Message to test'
                    }
                },
                required: ['message']
            },
            async execute(args) {
                const { message } = args;
                
                try {
                    const response = await callGeminiBridge(message);
                    
                    if (response.success) {
                        const promptTokens = estimateTokens(message);
                        const responseTokens = estimateTokens(response.text);
                        
                        logUsage('test', promptTokens, responseTokens, response.source);
                        
                        return {
                            success: true,
                            text: response.text,
                            source: response.source,
                            tokens: {
                                prompt: promptTokens,
                                response: responseTokens
                            }
                        };
                    } else {
                        return {
                            success: false,
                            error: response.error
                        };
                    }
                } catch (error) {
                    return {
                        success: false,
                        error: error.message
                    };
                }
            }
        },
        {
            name: 'bridge_status',
            description: 'Check Gemini bridge status',
            parameters: {
                type: 'object',
                properties: {}
            },
            async execute() {
                return new Promise((resolve) => {
                    const req = http.request('http://localhost:3001/status', (res) => {
                        let data = '';
                        res.on('data', (chunk) => data += chunk);
                        res.on('end', () => {
                            try {
                                const status = JSON.parse(data);
                                resolve({
                                    success: true,
                                    status: status.status,
                                    bridge: status.bridge,
                                    fallback: status.fallback
                                });
                            } catch (error) {
                                resolve({
                                    success: false,
                                    error: `Failed to parse status: ${error.message}`
                                });
                            }
                        });
                    });
                    
                    req.on('error', (error) => {
                        resolve({
                            success: false,
                            error: `Bridge unreachable: ${error.message}`
                        });
                    });
                    
                    req.end();
                });
            }
        }
    ]
};