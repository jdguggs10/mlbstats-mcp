/**
 * MLB Stats API MCP Server
 * Cloudflare Worker that proxies requests to MLB Stats API
 */

const MLB_ENDPOINTS = {
  getTeamInfo: "teams",
  getRoster: "teams/{teamId}/roster",
  getPlayerStats: "people/{playerId}/stats",
  getSchedule: "schedule",
  getLiveGame: "game/{gamePk}/feed/live",
  getStandings: "standings",
  getGameBoxscore: "game/{gamePk}/boxscore",
  getPlayerInfo: "people/{playerId}",
  getSeasons: "seasons",
  getVenues: "venues"
};

/**
 * Fill path template with parameters
 * @param {string} pathTemplate - Template with {param} placeholders
 * @param {object} params - Parameters to substitute
 * @returns {string} - Filled path
 */
function fillPath(pathTemplate, params = {}) {
  let filled = pathTemplate;
  for (const [key, value] of Object.entries(params)) {
    filled = filled.replace(`{${key}}`, encodeURIComponent(value));
  }
  return filled;
}

/**
 * Create CORS headers
 * @returns {object} - CORS headers
 */
function getCorsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400"
  };
}

/**
 * Handle CORS preflight requests
 * @returns {Response} - CORS preflight response
 */
function handleOptions() {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders()
  });
}

/**
 * Create error response
 * @param {string} message - Error message
 * @param {number} status - HTTP status code
 * @returns {Response} - Error response
 */
function createErrorResponse(message, status = 400) {
  return new Response(
    JSON.stringify({ error: message }),
    {
      status,
      headers: {
        "Content-Type": "application/json",
        ...getCorsHeaders()
      }
    }
  );
}

/**
 * Create success response
 * @param {object} data - Response data
 * @returns {Response} - Success response
 */
function createSuccessResponse(data) {
  return new Response(
    JSON.stringify({ result: data }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...getCorsHeaders()
      }
    }
  );
}

/**
 * Main request handler
 * @param {Request} request - Incoming request
 * @param {object} env - Environment variables
 * @param {object} ctx - Execution context
 * @returns {Response} - Response
 */
async function handleRequest(request, env, ctx) {
  try {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return handleOptions();
    }

    // Only allow POST requests
    if (request.method !== "POST") {
      return createErrorResponse("Only POST requests are allowed", 405);
    }

    // Parse request body
    let payload;
    try {
      payload = await request.json();
    } catch (error) {
      return createErrorResponse("Invalid JSON in request body");
    }

    const { command, params = {} } = payload;

    // Validate command
    if (!command) {
      return createErrorResponse("Missing 'command' parameter");
    }

    if (!MLB_ENDPOINTS[command]) {
      return createErrorResponse(`Unknown command: ${command}. Available commands: ${Object.keys(MLB_ENDPOINTS).join(", ")}`);
    }

    // Build the MLB API URL
    const pathTemplate = MLB_ENDPOINTS[command];
    const pathParams = params.pathParams || {};
    const queryParams = params.queryParams || {};

    // Fill path parameters
    const filledPath = fillPath(pathTemplate, pathParams);
    
    // Build query string
    const queryString = new URLSearchParams(queryParams).toString();
    const mlbUrl = `https://statsapi.mlb.com/api/v1/${filledPath}${queryString ? `?${queryString}` : ""}`;

    console.log(`Fetching MLB API: ${mlbUrl}`);

    // Fetch from MLB Stats API
    const mlbResponse = await fetch(mlbUrl, {
      method: "GET",
      headers: {
        "User-Agent": "MLB-MCP-Server/1.0",
        "Accept": "application/json"
      }
    });

    if (!mlbResponse.ok) {
      console.error(`MLB API error: ${mlbResponse.status} ${mlbResponse.statusText}`);
      return createErrorResponse(
        `MLB API returned ${mlbResponse.status}: ${mlbResponse.statusText}`,
        502
      );
    }

    // Parse MLB response
    const mlbData = await mlbResponse.json();
    
    // Return success response
    return createSuccessResponse(mlbData);

  } catch (error) {
    console.error("Error handling request:", error);
    return createErrorResponse(
      `Internal server error: ${error.message}`,
      500
    );
  }
}

// Export the worker
export default {
  async fetch(request, env, ctx) {
    return handleRequest(request, env, ctx);
  }
};