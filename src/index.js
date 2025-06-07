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

// Meta-tools for entity resolution
const RESOLVER_COMMANDS = {
  resolve_team: "resolve_team",
  resolve_player: "resolve_player"
};

// MLB Team name to ID mapping
const MLB_TEAMS = {
  // American League East
  "yankees": { id: 147, name: "New York Yankees", abbreviation: "NYY" },
  "new york yankees": { id: 147, name: "New York Yankees", abbreviation: "NYY" },
  "nyy": { id: 147, name: "New York Yankees", abbreviation: "NYY" },
  
  "red sox": { id: 111, name: "Boston Red Sox", abbreviation: "BOS" },
  "boston red sox": { id: 111, name: "Boston Red Sox", abbreviation: "BOS" },
  "boston": { id: 111, name: "Boston Red Sox", abbreviation: "BOS" },
  "bos": { id: 111, name: "Boston Red Sox", abbreviation: "BOS" },
  
  "blue jays": { id: 142, name: "Toronto Blue Jays", abbreviation: "TOR" },
  "toronto blue jays": { id: 142, name: "Toronto Blue Jays", abbreviation: "TOR" },
  "toronto": { id: 142, name: "Toronto Blue Jays", abbreviation: "TOR" },
  "tor": { id: 142, name: "Toronto Blue Jays", abbreviation: "TOR" },
  
  "rays": { id: 139, name: "Tampa Bay Rays", abbreviation: "TB" },
  "tampa bay rays": { id: 139, name: "Tampa Bay Rays", abbreviation: "TB" },
  "tampa bay": { id: 139, name: "Tampa Bay Rays", abbreviation: "TB" },
  "tb": { id: 139, name: "Tampa Bay Rays", abbreviation: "TB" },
  
  "orioles": { id: 110, name: "Baltimore Orioles", abbreviation: "BAL" },
  "baltimore orioles": { id: 110, name: "Baltimore Orioles", abbreviation: "BAL" },
  "baltimore": { id: 110, name: "Baltimore Orioles", abbreviation: "BAL" },
  "bal": { id: 110, name: "Baltimore Orioles", abbreviation: "BAL" },
  
  // American League Central
  "guardians": { id: 114, name: "Cleveland Guardians", abbreviation: "CLE" },
  "cleveland guardians": { id: 114, name: "Cleveland Guardians", abbreviation: "CLE" },
  "cleveland": { id: 114, name: "Cleveland Guardians", abbreviation: "CLE" },
  "cle": { id: 114, name: "Cleveland Guardians", abbreviation: "CLE" },
  
  "white sox": { id: 145, name: "Chicago White Sox", abbreviation: "CWS" },
  "chicago white sox": { id: 145, name: "Chicago White Sox", abbreviation: "CWS" },
  "cws": { id: 145, name: "Chicago White Sox", abbreviation: "CWS" },
  
  "tigers": { id: 116, name: "Detroit Tigers", abbreviation: "DET" },
  "detroit tigers": { id: 116, name: "Detroit Tigers", abbreviation: "DET" },
  "detroit": { id: 116, name: "Detroit Tigers", abbreviation: "DET" },
  "det": { id: 116, name: "Detroit Tigers", abbreviation: "DET" },
  
  "royals": { id: 118, name: "Kansas City Royals", abbreviation: "KC" },
  "kansas city royals": { id: 118, name: "Kansas City Royals", abbreviation: "KC" },
  "kansas city": { id: 118, name: "Kansas City Royals", abbreviation: "KC" },
  "kc": { id: 118, name: "Kansas City Royals", abbreviation: "KC" },
  
  "twins": { id: 142, name: "Minnesota Twins", abbreviation: "MIN" },
  "minnesota twins": { id: 142, name: "Minnesota Twins", abbreviation: "MIN" },
  "minnesota": { id: 142, name: "Minnesota Twins", abbreviation: "MIN" },
  "min": { id: 142, name: "Minnesota Twins", abbreviation: "MIN" },
  
  // American League West
  "astros": { id: 117, name: "Houston Astros", abbreviation: "HOU" },
  "houston astros": { id: 117, name: "Houston Astros", abbreviation: "HOU" },
  "houston": { id: 117, name: "Houston Astros", abbreviation: "HOU" },
  "hou": { id: 117, name: "Houston Astros", abbreviation: "HOU" },
  
  "angels": { id: 108, name: "Los Angeles Angels", abbreviation: "LAA" },
  "los angeles angels": { id: 108, name: "Los Angeles Angels", abbreviation: "LAA" },
  "la angels": { id: 108, name: "Los Angeles Angels", abbreviation: "LAA" },
  "laa": { id: 108, name: "Los Angeles Angels", abbreviation: "LAA" },
  
  "athletics": { id: 133, name: "Oakland Athletics", abbreviation: "OAK" },
  "oakland athletics": { id: 133, name: "Oakland Athletics", abbreviation: "OAK" },
  "oakland": { id: 133, name: "Oakland Athletics", abbreviation: "OAK" },
  "a's": { id: 133, name: "Oakland Athletics", abbreviation: "OAK" },
  "oak": { id: 133, name: "Oakland Athletics", abbreviation: "OAK" },
  
  "mariners": { id: 136, name: "Seattle Mariners", abbreviation: "SEA" },
  "seattle mariners": { id: 136, name: "Seattle Mariners", abbreviation: "SEA" },
  "seattle": { id: 136, name: "Seattle Mariners", abbreviation: "SEA" },
  "sea": { id: 136, name: "Seattle Mariners", abbreviation: "SEA" },
  
  "rangers": { id: 140, name: "Texas Rangers", abbreviation: "TEX" },
  "texas rangers": { id: 140, name: "Texas Rangers", abbreviation: "TEX" },
  "texas": { id: 140, name: "Texas Rangers", abbreviation: "TEX" },
  "tex": { id: 140, name: "Texas Rangers", abbreviation: "TEX" },
  
  // National League East
  "braves": { id: 144, name: "Atlanta Braves", abbreviation: "ATL" },
  "atlanta braves": { id: 144, name: "Atlanta Braves", abbreviation: "ATL" },
  "atlanta": { id: 144, name: "Atlanta Braves", abbreviation: "ATL" },
  "atl": { id: 144, name: "Atlanta Braves", abbreviation: "ATL" },
  
  "marlins": { id: 146, name: "Miami Marlins", abbreviation: "MIA" },
  "miami marlins": { id: 146, name: "Miami Marlins", abbreviation: "MIA" },
  "miami": { id: 146, name: "Miami Marlins", abbreviation: "MIA" },
  "mia": { id: 146, name: "Miami Marlins", abbreviation: "MIA" },
  
  "mets": { id: 121, name: "New York Mets", abbreviation: "NYM" },
  "new york mets": { id: 121, name: "New York Mets", abbreviation: "NYM" },
  "nym": { id: 121, name: "New York Mets", abbreviation: "NYM" },
  
  "phillies": { id: 143, name: "Philadelphia Phillies", abbreviation: "PHI" },
  "philadelphia phillies": { id: 143, name: "Philadelphia Phillies", abbreviation: "PHI" },
  "philadelphia": { id: 143, name: "Philadelphia Phillies", abbreviation: "PHI" },
  "phi": { id: 143, name: "Philadelphia Phillies", abbreviation: "PHI" },
  
  "nationals": { id: 120, name: "Washington Nationals", abbreviation: "WSH" },
  "washington nationals": { id: 120, name: "Washington Nationals", abbreviation: "WSH" },
  "washington": { id: 120, name: "Washington Nationals", abbreviation: "WSH" },
  "wsh": { id: 120, name: "Washington Nationals", abbreviation: "WSH" },
  
  // National League Central
  "cubs": { id: 112, name: "Chicago Cubs", abbreviation: "CHC" },
  "chicago cubs": { id: 112, name: "Chicago Cubs", abbreviation: "CHC" },
  "chc": { id: 112, name: "Chicago Cubs", abbreviation: "CHC" },
  
  "reds": { id: 113, name: "Cincinnati Reds", abbreviation: "CIN" },
  "cincinnati reds": { id: 113, name: "Cincinnati Reds", abbreviation: "CIN" },
  "cincinnati": { id: 113, name: "Cincinnati Reds", abbreviation: "CIN" },
  "cin": { id: 113, name: "Cincinnati Reds", abbreviation: "CIN" },
  
  "brewers": { id: 158, name: "Milwaukee Brewers", abbreviation: "MIL" },
  "milwaukee brewers": { id: 158, name: "Milwaukee Brewers", abbreviation: "MIL" },
  "milwaukee": { id: 158, name: "Milwaukee Brewers", abbreviation: "MIL" },
  "mil": { id: 158, name: "Milwaukee Brewers", abbreviation: "MIL" },
  
  "pirates": { id: 134, name: "Pittsburgh Pirates", abbreviation: "PIT" },
  "pittsburgh pirates": { id: 134, name: "Pittsburgh Pirates", abbreviation: "PIT" },
  "pittsburgh": { id: 134, name: "Pittsburgh Pirates", abbreviation: "PIT" },
  "pit": { id: 134, name: "Pittsburgh Pirates", abbreviation: "PIT" },
  
  "cardinals": { id: 138, name: "St. Louis Cardinals", abbreviation: "STL" },
  "st. louis cardinals": { id: 138, name: "St. Louis Cardinals", abbreviation: "STL" },
  "st louis cardinals": { id: 138, name: "St. Louis Cardinals", abbreviation: "STL" },
  "st. louis": { id: 138, name: "St. Louis Cardinals", abbreviation: "STL" },
  "st louis": { id: 138, name: "St. Louis Cardinals", abbreviation: "STL" },
  "stl": { id: 138, name: "St. Louis Cardinals", abbreviation: "STL" },
  
  // National League West
  "diamondbacks": { id: 109, name: "Arizona Diamondbacks", abbreviation: "ARI" },
  "arizona diamondbacks": { id: 109, name: "Arizona Diamondbacks", abbreviation: "ARI" },
  "arizona": { id: 109, name: "Arizona Diamondbacks", abbreviation: "ARI" },
  "d-backs": { id: 109, name: "Arizona Diamondbacks", abbreviation: "ARI" },
  "ari": { id: 109, name: "Arizona Diamondbacks", abbreviation: "ARI" },
  
  "rockies": { id: 115, name: "Colorado Rockies", abbreviation: "COL" },
  "colorado rockies": { id: 115, name: "Colorado Rockies", abbreviation: "COL" },
  "colorado": { id: 115, name: "Colorado Rockies", abbreviation: "COL" },
  "col": { id: 115, name: "Colorado Rockies", abbreviation: "COL" },
  
  "dodgers": { id: 119, name: "Los Angeles Dodgers", abbreviation: "LAD" },
  "los angeles dodgers": { id: 119, name: "Los Angeles Dodgers", abbreviation: "LAD" },
  "la dodgers": { id: 119, name: "Los Angeles Dodgers", abbreviation: "LAD" },
  "lad": { id: 119, name: "Los Angeles Dodgers", abbreviation: "LAD" },
  
  "padres": { id: 135, name: "San Diego Padres", abbreviation: "SD" },
  "san diego padres": { id: 135, name: "San Diego Padres", abbreviation: "SD" },
  "san diego": { id: 135, name: "San Diego Padres", abbreviation: "SD" },
  "sd": { id: 135, name: "San Diego Padres", abbreviation: "SD" },
  
  "giants": { id: 137, name: "San Francisco Giants", abbreviation: "SF" },
  "san francisco giants": { id: 137, name: "San Francisco Giants", abbreviation: "SF" },
  "san francisco": { id: 137, name: "San Francisco Giants", abbreviation: "SF" },
  "sf": { id: 137, name: "San Francisco Giants", abbreviation: "SF" }
};

// Common player mappings (can be expanded)
const MLB_PLAYERS = {
  "aaron judge": { id: 592450, name: "Aaron Judge", team: "New York Yankees" },
  "judge": { id: 592450, name: "Aaron Judge", team: "New York Yankees" },
  "mookie betts": { id: 605141, name: "Mookie Betts", team: "Los Angeles Dodgers" },
  "betts": { id: 605141, name: "Mookie Betts", team: "Los Angeles Dodgers" },
  "shohei ohtani": { id: 660271, name: "Shohei Ohtani", team: "Los Angeles Dodgers" },
  "ohtani": { id: 660271, name: "Shohei Ohtani", team: "Los Angeles Dodgers" },
  "freddie freeman": { id: 518692, name: "Freddie Freeman", team: "Los Angeles Dodgers" },
  "freeman": { id: 518692, name: "Freddie Freeman", team: "Los Angeles Dodgers" },
  "ronald acuna jr": { id: 660670, name: "Ronald Acuna Jr.", team: "Atlanta Braves" },
  "acuna": { id: 660670, name: "Ronald Acuna Jr.", team: "Atlanta Braves" },
  "mike trout": { id: 545361, name: "Mike Trout", team: "Los Angeles Angels" },
  "trout": { id: 545361, name: "Mike Trout", team: "Los Angeles Angels" }
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
 * Handle resolver meta-tool commands
 * @param {string} command - The resolver command
 * @param {object} params - Command parameters
 * @returns {Response} - Resolver response
 */
function handleResolverCommand(command, params) {
  try {
    switch (command) {
      case 'resolve_team':
        return handleResolveTeam(params);
      case 'resolve_player':
        return handleResolvePlayer(params);
      default:
        return createErrorResponse(`Unknown resolver command: ${command}`);
    }
  } catch (error) {
    console.error(`Error in resolver command ${command}:`, error);
    return createErrorResponse(`Resolver error: ${error.message}`, 500);
  }
}

/**
 * Resolve team name to MLB team information
 * @param {object} params - Parameters containing team name
 * @returns {Response} - Team resolution response
 */
function handleResolveTeam(params) {
  const teamName = params.name || params.team || params.teamName;
  
  if (!teamName) {
    return createErrorResponse("Missing 'name' parameter for team resolution");
  }
  
  // Normalize team name for lookup
  const normalizedName = teamName.toLowerCase().trim();
  
  // Look up team in our mapping
  const teamInfo = MLB_TEAMS[normalizedName];
  
  if (!teamInfo) {
    // Return error with suggestions
    const suggestions = Object.keys(MLB_TEAMS)
      .filter(key => key.includes(normalizedName.split(' ')[0]) || normalizedName.includes(key.split(' ')[0]))
      .slice(0, 3);
    
    return createErrorResponse(
      `Team "${teamName}" not found. ${suggestions.length > 0 ? `Did you mean: ${suggestions.join(', ')}?` : 'Please check the team name.'}`
    );
  }
  
  return createSuccessResponse({
    id: teamInfo.id,
    name: teamInfo.name,
    abbreviation: teamInfo.abbreviation,
    query: teamName,
    resolved: true
  });
}

/**
 * Resolve player name to MLB player information
 * @param {object} params - Parameters containing player name
 * @returns {Response} - Player resolution response
 */
function handleResolvePlayer(params) {
  const playerName = params.name || params.player || params.playerName;
  
  if (!playerName) {
    return createErrorResponse("Missing 'name' parameter for player resolution");
  }
  
  // Normalize player name for lookup
  const normalizedName = playerName.toLowerCase().trim();
  
  // Look up player in our mapping
  const playerInfo = MLB_PLAYERS[normalizedName];
  
  if (!playerInfo) {
    // Return error with suggestions
    const suggestions = Object.keys(MLB_PLAYERS)
      .filter(key => key.includes(normalizedName.split(' ')[0]) || normalizedName.includes(key.split(' ')[0]))
      .slice(0, 3);
    
    return createErrorResponse(
      `Player "${playerName}" not found. ${suggestions.length > 0 ? `Did you mean: ${suggestions.join(', ')}?` : 'Please check the player name or try using their full name.'}`
    );
  }
  
  return createSuccessResponse({
    id: playerInfo.id,
    name: playerInfo.name,
    team: playerInfo.team,
    query: playerName,
    resolved: true
  });
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

    // Handle resolver commands
    if (RESOLVER_COMMANDS[command]) {
      return handleResolverCommand(command, params);
    }

    if (!MLB_ENDPOINTS[command]) {
      return createErrorResponse(`Unknown command: ${command}. Available commands: ${Object.keys(MLB_ENDPOINTS).concat(Object.keys(RESOLVER_COMMANDS)).join(", ")}`);
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