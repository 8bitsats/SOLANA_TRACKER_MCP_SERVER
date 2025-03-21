#!/usr/bin/env node
import axios from 'axios';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError, } from '@modelcontextprotocol/sdk/types.js';
const API_KEY = process.env.SOLANA_TRACKER_API_KEY;
if (!API_KEY) {
    throw new Error('SOLANA_TRACKER_API_KEY environment variable is required');
}
const axiosInstance = axios.create({
    baseURL: 'https://data.solanatracker.io',
    headers: {
        'x-api-key': API_KEY,
    },
});
class SolanaTrackerServer {
    server;
    constructor() {
        this.server = new Server({
            name: 'solana-tracker-server',
            version: '0.1.0',
        }, {
            capabilities: {
                resources: {},
                tools: {},
            },
        });
        this.setupToolHandlers();
        this.server.onerror = (error) => console.error('[MCP Error]', error);
        process.on('SIGINT', async () => {
            await this.server.close();
            process.exit(0);
        });
    }
    setupToolHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: 'get_token_information',
                    description: 'Retrieve all information for a specific token.',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            tokenAddress: {
                                type: 'string',
                                description: 'The address of the token.',
                            },
                        },
                        required: ['tokenAddress'],
                    },
                },
                {
                    name: 'get_token_information_by_pool',
                    description: 'Retrieve all information for a specific token by searching by pool address.',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            poolAddress: {
                                type: 'string',
                                description: 'The address of the pool.',
                            },
                        },
                        required: ['poolAddress'],
                    },
                },
                {
                    name: 'get_token_holders_top',
                    description: 'Get the top 20 holders for a token.',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            tokenAddress: {
                                type: 'string',
                                description: 'The address of the token.',
                            },
                        },
                        required: ['tokenAddress'],
                    },
                },
                {
                    name: 'get_token_ath',
                    description: 'Retrieve the all time high price of a token.',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            tokenAddress: {
                                type: 'string',
                                description: 'The address of the token.',
                            },
                        },
                        required: ['tokenAddress'],
                    },
                },
                {
                    name: 'get_tokens_created_by_wallet',
                    description: 'Retrieve all tokens created by wallet.',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            wallet: {
                                type: 'string',
                                description: 'The address of the wallet.',
                            },
                        },
                        required: ['wallet'],
                    },
                },
                {
                    name: 'search_tokens',
                    description: 'Search for pools and tokens with support for multiple filtering criteria and pagination.',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            query: {
                                type: 'string',
                                description: 'Search term for token symbol, name, or address',
                            },
                            page: {
                                type: 'integer',
                                description: 'Page number for pagination',
                            },
                            limit: {
                                type: 'integer',
                                description: 'Number of results per page',
                            },
                            sortBy: {
                                type: 'string',
                                description: 'Field to sort by',
                            },
                            sortOrder: {
                                type: 'string',
                                description: 'Sort order: asc (ascending) or desc (descending)',
                            },
                            showAllPools: {
                                type: 'string',
                                description: 'Return all pools for a token in a response if enabled',
                            },
                            minCreatedAt: {
                                type: 'integer',
                                description: 'Minimum creation date in unix time in ms',
                            },
                            maxCreatedAt: {
                                type: 'integer',
                                description: 'Maxiumum creation date in unix time in ms',
                            },
                            minLiquidity: {
                                type: 'number',
                                description: 'Minimum liquidity in USD',
                            },
                            maxLiquidity: {
                                type: 'number',
                                description: 'Maximum liquidity in USD',
                            },
                            minMarketCap: {
                                type: 'integer',
                                description: 'Minimum market cap in USD',
                            },
                            maxMarketCap: {
                                type: 'integer',
                                description: 'Maximum market cap in USD',
                            },
                            minBuys: {
                                type: 'string',
                                description: 'Minimum number of buy transactions',
                            },
                            maxBuys: {
                                type: 'string',
                                description: 'Maximum number of buy transactions',
                            },
                            minSells: {
                                type: 'string',
                                description: 'Minimum number of sell transactions',
                            },
                            maxSells: {
                                type: 'string',
                                description: 'Maximum number of sell transactions',
                            },
                            minTotalTransactions: {
                                type: 'string',
                                description: 'Minimum total number of transactions',
                            },
                            maxTotalTransactions: {
                                type: 'string',
                                description: 'Maximum total number of transactions',
                            },
                            lpBurn: {
                                type: 'integer',
                                description: 'LP token burn percentage',
                            },
                            market: {
                                type: 'string',
                                description: 'Market identifier',
                            },
                            freezeAuthority: {
                                type: 'string',
                                description: 'Freeze authority address',
                            },
                            mintAuthority: {
                                type: 'string',
                                description: 'Mint authority address',
                            },
                            deployer: {
                                type: 'string',
                                description: 'Deployer address',
                            },
                            showPriceChanges: {
                                type: 'boolean',
                                description: 'Include price change data in response',
                            },
                        },
                        required: ['query'],
                    },
                },
                {
                    name: 'get_latest_tokens',
                    description: 'Retrieve the latest 100 tokens.',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            page: {
                                type: 'string',
                                description: 'The page number (1-10)',
                            },
                        },
                    },
                },
                {
                    name: 'get_trending_tokens',
                    description: 'Get the top 100 trending tokens based on transaction volume in the past hour.',
                    inputSchema: {},
                },
                {
                    name: 'get_trending_tokens_timeframe',
                    description: 'Returns trending tokens for a specific time interval.',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            timeframe: {
                                type: 'string',
                                description: 'Time interval (e.g., 5m, 15m, 30m, 1h, 2h, 3h, 4h, 5h, 6h, 12h, 24h)',
                            },
                        },
                        required: ['timeframe'],
                    },
                },
                {
                    name: 'get_tokens_volume',
                    description: 'Retrieve the top 100 tokens sorted by highest volume.',
                    inputSchema: {},
                },
                {
                    name: 'get_tokens_multi_all',
                    description: 'Get an overview of latest, graduating, and graduated tokens.',
                    inputSchema: {},
                },
                {
                    name: 'get_tokens_multi_graduated',
                    description: 'Overview of all graduated pumpfun/moonshot tokens.',
                    inputSchema: {},
                },
                {
                    name: 'get_token_price',
                    description: 'Get price information for a single token.',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            token: {
                                type: 'string',
                                description: 'The token address',
                            },
                            priceChanges: {
                                type: 'boolean',
                                description: 'Returns price change percentages for the token up to 24 hours ago',
                            },
                        },
                        required: ['token'],
                    },
                },
                {
                    name: 'get_token_price_history',
                    description: 'Get historic price information for a single token.',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            token: {
                                type: 'string',
                                description: 'The token address',
                            },
                        },
                        required: ['token'],
                    },
                },
                {
                    name: 'get_token_price_history_timestamp',
                    description: 'Get specific historic price information for a token at a given timestamp.',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            token: {
                                type: 'string',
                                description: 'The token address',
                            },
                            timestamp: {
                                type: 'integer',
                                description: 'The target timestamp (unix timestamp)',
                            },
                        },
                        required: ['token', 'timestamp'],
                    },
                },
                {
                    name: 'get_tokens_price_multi',
                    description: 'Get price information for multiple tokens (up to 100).',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            tokens: {
                                type: 'string',
                                description: 'Comma-separated list of token addresses',
                            },
                            priceChanges: {
                                type: 'boolean',
                                description: 'Returns price change percentages for the tokens up to 24 hours ago',
                            },
                        },
                        required: ['tokens'],
                    },
                },
                {
                    name: 'get_wallet_tokens',
                    description: 'Get all tokens in a wallet with current value in USD.',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            owner: {
                                type: 'string',
                                description: 'The wallet address',
                            },
                        },
                        required: ['owner'],
                    },
                },
                {
                    name: 'get_wallet_tokens_basic',
                    description: 'Get all tokens in a wallet with current value in USD, more lightweight and faster non cached option.',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            owner: {
                                type: 'string',
                                description: 'The wallet address',
                            },
                        },
                        required: ['owner'],
                    },
                },
                {
                    name: 'get_wallet_tokens_page',
                    description: 'Retrieve wallet tokens using pagination with a limit of 250 tokens per request.',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            owner: {
                                type: 'string',
                                description: 'The wallet address',
                            },
                            page: {
                                type: 'integer',
                                description: 'The page number',
                            },
                        },
                        required: ['owner', 'page'],
                    },
                },
                {
                    name: 'get_wallet_trades',
                    description: 'Get the latest trades of a wallet.',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            owner: {
                                type: 'string',
                                description: 'The wallet address',
                            },
                            cursor: {
                                type: 'string',
                                description: 'Cursor for pagination',
                            },
                        },
                        required: ['owner'],
                    },
                },
                {
                    name: 'get_trades_token',
                    description: 'Get the latest trades for a token across all pools.',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            tokenAddress: {
                                type: 'string',
                                description: 'The token address',
                            },
                            cursor: {
                                type: 'string',
                                description: 'Cursor for pagination',
                            },
                            showMeta: {
                                type: 'string',
                                description: "Set to ‘true’ to add metadata for from and to tokens",
                            },
                            parseJupiter: {
                                type: 'string',
                                description: "Set to ‘true’ to combine all transfers within a Jupiter swap into a single transaction. By default, each transfer is shown separately.",
                            },
                            hideArb: {
                                type: 'string',
                                description: "Set to ‘true’ to hide arbitrage or other transactions that don’t have both the ‘from’ and ‘to’ token addresses matching the token parameter.",
                            },
                        },
                        required: ['tokenAddress'],
                    },
                },
                {
                    name: 'get_trades_token_pool',
                    description: 'Get the latest trades for a specific token and pool pair.',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            tokenAddress: {
                                type: 'string',
                                description: 'The token address',
                            },
                            poolAddress: {
                                type: 'string',
                                description: 'The pool address',
                            },
                            cursor: {
                                type: 'string',
                                description: 'Cursor for pagination',
                            },
                            showMeta: {
                                type: 'string',
                                description: "Set to ‘true’ to add metadata for from and to tokens",
                            },
                            parseJupiter: {
                                type: 'string',
                                description: "Set to ‘true’ to combine all transfers within a Jupiter swap into a single transaction. By default, each transfer is shown separately.",
                            },
                            hideArb: {
                                type: 'string',
                                description: "Set to ‘true’ to hide arbitrage or other transactions that don’t have both the ‘from’ and ‘to’ token addresses matching the token parameter.",
                            },
                        },
                        required: ['tokenAddress', 'poolAddress'],
                    },
                },
                {
                    name: 'get_trades_token_pool_owner',
                    description: 'Get the latest trades for a specific token, pool, and wallet address.',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            tokenAddress: {
                                type: 'string',
                                description: 'The token address',
                            },
                            poolAddress: {
                                type: 'string',
                                description: 'The pool address',
                            },
                            owner: {
                                type: 'string',
                                description: 'The wallet address',
                            },
                            cursor: {
                                type: 'string',
                                description: 'Cursor for pagination',
                            },
                            showMeta: {
                                type: 'string',
                                description: "Set to ‘true’ to add metadata for from and to tokens",
                            },
                            parseJupiter: {
                                type: 'string',
                                description: "Set to ‘true’ to combine all transfers within a Jupiter swap into a single transaction. By default, each transfer is shown separately.",
                            },
                            hideArb: {
                                type: 'string',
                                description: "Set to ‘true’ to hide arbitrage or other transactions that don’t have both the ‘from’ and ‘to’ token addresses matching the token parameter.",
                            },
                        },
                        required: ['tokenAddress', 'poolAddress', 'owner'],
                    },
                },
                {
                    name: 'get_trades_token_by_wallet',
                    description: 'Get the latest trades for a specific token and wallet address.',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            tokenAddress: {
                                type: 'string',
                                description: 'The token address',
                            },
                            owner: {
                                type: 'string',
                                description: 'The wallet address',
                            },
                            cursor: {
                                type: 'string',
                                description: 'Cursor for pagination',
                            },
                            showMeta: {
                                type: 'string',
                                description: "Set to ‘true’ to add metadata for from and to tokens",
                            },
                            parseJupiter: {
                                type: 'string',
                                description: "Set to ‘true’ to combine all transfers within a Jupiter swap into a single transaction. By default, each transfer is shown separately.",
                            },
                            hideArb: {
                                type: 'string',
                                description: "Set to ‘true’ to hide arbitrage or other transactions that don’t have both the ‘from’ and ‘to’ token addresses matching the token parameter.",
                            },
                        },
                        required: ['tokenAddress', 'owner'],
                    },
                },
                {
                    name: 'get_chart_token',
                    description: 'Get OLCVH (Open, Low, Close, Volume, High) data for charts for a token.',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            token: {
                                type: 'string',
                                description: 'The token address',
                            },
                            type: {
                                type: 'string',
                                description: 'Time interval (e.g., “1s”, “1m”, “1h”, “1d”)',
                            },
                            time_from: {
                                type: 'integer',
                                description: 'Start time (Unix timestamp in seconds)',
                            },
                            time_to: {
                                type: 'integer',
                                description: 'End time (Unix timestamp in seconds)',
                            },
                            marketCap: {
                                type: 'string',
                                description: 'Return chart for market cap instead of pricing',
                            },
                            removeOutliers: {
                                type: 'string',
                                description: 'Set to false to disable outlier removal, true by default.',
                            },
                        },
                        required: ['token'],
                    },
                },
                {
                    name: 'get_chart_token_pool',
                    description: 'Get OLCVH (Open, Low, Close, Volume, High) data for charts for a token and pool.',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            token: {
                                type: 'string',
                                description: 'The token address',
                            },
                            pool: {
                                type: 'string',
                                description: 'The pool address',
                            },
                            type: {
                                type: 'string',
                                description: 'Time interval (e.g., “1s”, “1m”, “1h”, “1d”)',
                            },
                            time_from: {
                                type: 'integer',
                                description: 'Start time (Unix timestamp in seconds)',
                            },
                            time_to: {
                                type: 'integer',
                                description: 'End time (Unix timestamp in seconds)',
                            },
                            marketCap: {
                                type: 'string',
                                description: 'Return chart for market cap instead of pricing',
                            },
                            removeOutliers: {
                                type: 'string',
                                description: 'Set to false to disable outlier removal, true by default.',
                            },
                        },
                        required: ['token', 'pool'],
                    },
                },
                {
                    name: 'get_pnl_wallet',
                    description: 'Get Profit and Loss data for all positions of a wallet.',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            wallet: {
                                type: 'string',
                                description: 'The wallet address',
                            },
                            showHistoricPnL: {
                                type: 'string',
                                description: 'Adds PnL data for 1d, 7d and 30d intervals (BETA)',
                            },
                            holdingCheck: {
                                type: 'string',
                                description: 'Does an extra check to check current holding value in wallet (increases response time)',
                            },
                            hideDetails: {
                                type: 'string',
                                description: 'Return only summary for the pnl without seperate data for every token.',
                            },
                        },
                        required: ['wallet'],
                    },
                },
                {
                    name: 'get_first_buyers',
                    description: 'Retrieve the first 100 buyers of a token with Profit and Loss data for each wallet.',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            token: {
                                type: 'string',
                                description: 'The token address',
                            },
                        },
                        required: ['token'],
                    },
                },
                {
                    name: 'get_pnl_wallet_token',
                    description: 'Get Profit and Loss data for a specific token in a wallet.',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            wallet: {
                                type: 'string',
                                description: 'The wallet address',
                            },
                            token: {
                                type: 'string',
                                description: 'The token address',
                            },
                        },
                        required: ['wallet', 'token'],
                    },
                },
                {
                    name: 'get_top_traders_all',
                    description: 'Get the most profitable traders across all tokens.',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            page: {
                                type: 'string',
                                description: 'The page number',
                            },
                            expandPnl: {
                                type: 'string',
                                description: 'Include detailed PnL data for each token if true',
                            },
                            sortBy: {
                                type: 'string',
                                description: 'Sort results by metric (“total” or “winPercentage”)',
                            },
                        },
                    },
                },
                {
                    name: 'get_top_traders_token',
                    description: 'Get top 100 traders by PnL for a token.',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            token: {
                                type: 'string',
                                description: 'The token address',
                            },
                        },
                        required: ['token'],
                    },
                },
                {
                    name: 'get_stats_token_pool',
                    description: 'Get detailed stats for a token-pool pair over various time intervals.',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            token: {
                                type: 'string',
                                description: 'The token address',
                            },
                            pool: {
                                type: 'string',
                                description: 'The pool address',
                            },
                        },
                        required: ['token', 'pool'],
                    },
                },
                {
                    name: 'get_stats_token',
                    description: 'Get detailed stats for a token over various time intervals.',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            token: {
                                type: 'string',
                                description: 'The token address',
                            },
                        },
                        required: ['token'],
                    },
                },
            ],
        }));
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            try {
                switch (request.params.name) {
                    case 'get_token_information': {
                        const { tokenAddress } = request.params.arguments;
                        try {
                            const response = await axiosInstance.get(`/tokens/${tokenAddress}`);
                            if (response.status !== 200) {
                                throw new McpError(ErrorCode.InternalError, `Solana Tracker API returned status code: ${response.status}: ${response.statusText}`);
                            }
                            return {
                                content: [{ type: 'json', json: response.data }],
                            };
                        }
                        catch (error) {
                            if (axios.isAxiosError(error)) {
                                throw new McpError(ErrorCode.InternalError, `Solana Tracker API error: ${error.message}`);
                            }
                            else {
                                throw new McpError(ErrorCode.InternalError, `Unknown error: ${error.message}`);
                            }
                        }
                    }
                    case 'get_token_information_by_pool': {
                        const { poolAddress } = request.params.arguments;
                        try {
                            const response = await axiosInstance.get(`/tokens/by-pool/${poolAddress}`);
                            if (response.status !== 200) {
                                throw new McpError(ErrorCode.InternalError, `Solana Tracker API returned status code: ${response.status}: ${response.statusText}`);
                            }
                            return {
                                content: [{ type: 'json', json: response.data }],
                            };
                        }
                        catch (error) {
                            if (axios.isAxiosError(error)) {
                                throw new McpError(ErrorCode.InternalError, `Solana Tracker API error: ${error.message}`);
                            }
                            else {
                                throw new McpError(ErrorCode.InternalError, `Unknown error: ${error.message}`);
                            }
                        }
                    }
                    case 'get_token_holders_top': {
                        const { tokenAddress } = request.params.arguments;
                        try {
                            const response = await axiosInstance.get(`/tokens/${tokenAddress}/holders/top`);
                            if (response.status !== 200) {
                                throw new McpError(ErrorCode.InternalError, `Solana Tracker API returned status code: ${response.status}: ${response.statusText}`);
                            }
                            return {
                                content: [{ type: 'json', json: response.data }],
                            };
                        }
                        catch (error) {
                            if (axios.isAxiosError(error)) {
                                throw new McpError(ErrorCode.InternalError, `Solana Tracker API error: ${error.message}`);
                            }
                            else {
                                throw new McpError(ErrorCode.InternalError, `Unknown error: ${error.message}`);
                            }
                        }
                    }
                    case 'get_token_ath': {
                        const { tokenAddress } = request.params.arguments;
                        try {
                            const response = await axiosInstance.get(`/tokens/${tokenAddress}/ath`);
                            if (response.status !== 200) {
                                throw new McpError(ErrorCode.InternalError, `Solana Tracker API returned status code: ${response.status}: ${response.statusText}`);
                            }
                            return {
                                content: [{ type: 'json', json: response.data }],
                            };
                        }
                        catch (error) {
                            if (axios.isAxiosError(error)) {
                                throw new McpError(ErrorCode.InternalError, `Solana Tracker API error: ${error.message}`);
                            }
                            else {
                                throw new McpError(ErrorCode.InternalError, `Unknown error: ${error.message}`);
                            }
                        }
                    }
                    case 'get_tokens_created_by_wallet': {
                        const { wallet } = request.params.arguments;
                        try {
                            const response = await axiosInstance.get(`/deployer/${wallet}`);
                            if (response.status !== 200) {
                                throw new McpError(ErrorCode.InternalError, `Solana Tracker API returned status code: ${response.status}: ${response.statusText}`);
                            }
                            return {
                                content: [{ type: 'json', json: response.data }],
                            };
                        }
                        catch (error) {
                            if (axios.isAxiosError(error)) {
                                throw new McpError(ErrorCode.InternalError, `Solana Tracker API error: ${error.message}`);
                            }
                            else {
                                throw new McpError(ErrorCode.InternalError, `Unknown error: ${error.message}`);
                            }
                        }
                    }
                    case 'search_tokens': {
                        const { query, page, limit, sortBy, sortOrder, showAllPools, minCreatedAt, maxCreatedAt, minLiquidity, maxLiquidity, minMarketCap, maxMarketCap, minBuys, maxBuys, minSells, maxSells, minTotalTransactions, maxTotalTransactions, lpBurn, market, freezeAuthority, mintAuthority, deployer, showPriceChanges } = request.params.arguments;
                        try {
                            const response = await axiosInstance.get(`/search`, {
                                params: {
                                    query,
                                    page,
                                    limit,
                                    sortBy,
                                    sortOrder,
                                    showAllPools,
                                    minCreatedAt,
                                    maxCreatedAt,
                                    minLiquidity,
                                    maxLiquidity,
                                    minMarketCap,
                                    maxMarketCap,
                                    minBuys,
                                    maxBuys,
                                    minSells,
                                    maxSells,
                                    minTotalTransactions,
                                    maxTotalTransactions,
                                    lpBurn,
                                    market,
                                    freezeAuthority,
                                    mintAuthority,
                                    deployer,
                                    showPriceChanges,
                                },
                            });
                            if (response.status !== 200) {
                                throw new McpError(ErrorCode.InternalError, `Solana Tracker API returned status code: ${response.status}: ${response.statusText}`);
                            }
                            return {
                                content: [{ type: 'json', json: response.data }],
                            };
                        }
                        catch (error) {
                            if (axios.isAxiosError(error)) {
                                throw new McpError(ErrorCode.InternalError, `Solana Tracker API error: ${error.message}`);
                            }
                            else {
                                throw new McpError(ErrorCode.InternalError, `Unknown error: ${error.message}`);
                            }
                        }
                    }
                    case 'get_latest_tokens': {
                        const { page } = request.params.arguments;
                        try {
                            const response = await axiosInstance.get(`/tokens/latest`, {
                                params: {
                                    page,
                                },
                            });
                            if (response.status !== 200) {
                                throw new McpError(ErrorCode.InternalError, `Solana Tracker API returned status code: ${response.status}: ${response.statusText}`);
                            }
                            return {
                                content: [{ type: 'json', json: response.data }],
                            };
                        }
                        catch (error) {
                            if (axios.isAxiosError(error)) {
                            }
                            else {
                                throw new McpError(ErrorCode.InternalError, `Unknown error: ${error.message}`);
                            }
                        }
                    }
                    case 'get_trending_tokens': {
                        try {
                            const response = await axiosInstance.get(`/tokens/trending`);
                            if (response.status !== 200) {
                                throw new McpError(ErrorCode.InternalError, `Solana Tracker API returned status code: ${response.status}: ${response.statusText}`);
                            }
                            return {
                                content: [{ type: 'json', json: response.data }],
                            };
                        }
                        catch (error) {
                            if (axios.isAxiosError(error)) {
                                throw new McpError(ErrorCode.InternalError, `Solana Tracker API error: ${error.message}`);
                            }
                            else {
                                throw new McpError(ErrorCode.InternalError, `Unknown error: ${error.message}`);
                            }
                        }
                    }
                    case 'get_trending_tokens_timeframe': {
                        const { timeframe } = request.params.arguments;
                        try {
                            const response = await axiosInstance.get(`/tokens/trending/${timeframe}`);
                            if (response.status !== 200) {
                                throw new McpError(ErrorCode.InternalError, `Solana Tracker API returned status code: ${response.status}: ${response.statusText}`);
                            }
                            return {
                                content: [{ type: 'json', json: response.data }],
                            };
                        }
                        catch (error) {
                            if (axios.isAxiosError(error)) {
                                throw new McpError(ErrorCode.InternalError, `Solana Tracker API error: ${error.message}`);
                            }
                            else {
                                throw new McpError(ErrorCode.InternalError, `Unknown error: ${error.message}`);
                            }
                        }
                    }
                    case 'get_tokens_volume': {
                        try {
                            const response = await axiosInstance.get(`/tokens/volume`);
                            if (response.status !== 200) {
                                throw new McpError(ErrorCode.InternalError, `Solana Tracker API returned status code: ${response.status}: ${response.statusText}`);
                            }
                            return {
                                content: [{ type: 'json', json: response.data }],
                            };
                        }
                        catch (error) {
                            if (axios.isAxiosError(error)) {
                                throw new McpError(ErrorCode.InternalError, `Solana Tracker API error: ${error.message}`);
                            }
                            else {
                                throw new McpError(ErrorCode.InternalError, `Unknown error: ${error.message}`);
                            }
                        }
                    }
                    case 'get_tokens_multi_all': {
                        try {
                            const response = await axiosInstance.get(`/tokens/multi/all`);
                            if (response.status !== 200) {
                                throw new McpError(ErrorCode.InternalError, `Solana Tracker API returned status code: ${response.status}: ${response.statusText}`);
                            }
                            return {
                                content: [{ type: 'json', json: response.data }],
                            };
                        }
                        catch (error) {
                            if (axios.isAxiosError(error)) {
                                throw new McpError(ErrorCode.InternalError, `Solana Tracker API error: ${error.message}`);
                            }
                            else {
                                throw new McpError(ErrorCode.InternalError, `Unknown error: ${error.message}`);
                            }
                        }
                    }
                    case 'get_tokens_multi_graduated': {
                        try {
                            const response = await axiosInstance.get(`/tokens/multi/graduated`);
                            if (response.status !== 200) {
                                throw new McpError(ErrorCode.InternalError, `Solana Tracker API
                                );
                            }
                        }
                        finally { }
                    }
                }
            }
            finally { }
        });
    }
}
