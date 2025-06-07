# MLB Stats MCP Server - Enhanced with Meta-Tools

🔧 **Version 2.1 - Now with Entity Resolution Meta-Tools!**

A Cloudflare Worker that serves as an enhanced MCP (Model Context Protocol) server for accessing MLB Stats API data. Features meta-tools for intelligent entity resolution, comprehensive team/player mappings, and optimized data access patterns.

## 🎯 Enhanced Features

### 🔧 Meta-Tools for Entity Resolution
- **resolve_team**: Convert team names to canonical MLB team IDs
- **resolve_player**: Convert player names to canonical MLB player IDs  
- **Comprehensive Mappings**: All 30 MLB teams with aliases and abbreviations
- **Fuzzy Matching**: "Yankees", "NYY", "New York Yankees" all resolve correctly
- **Smart Suggestions**: "Did you mean?" fallbacks for typos and partial matches

### ⚾ MLB Data Access
- **Direct MLB API proxy** with zero additional latency
- **All MLB endpoints** supported (teams, players, stats, schedules, etc.)
- **CORS enabled** for web applications
- **No API keys required** (MLB Stats API is public)
- **Error handling** and validation with detailed responses

### 🏗️ Architecture Benefits
- **Domain logic ownership**: All MLB-specific logic contained within this worker
- **Service binding ready**: Optimized for Cloudflare worker-to-worker communication
- **Token efficient**: Meta-tools reduce round-trips and enable smart caching
- **Future-proof**: Extensible pattern for other sports (NFL, NBA, NHL)

## 🛠️ Available Commands

### 🔧 Meta-Tools (Entity Resolution)

#### `resolve_team` - Team Name Resolution
Convert any team reference to canonical MLB team information.

**Request:**
```json
{
  "command": "resolve_team",
  "params": {
    "name": "Yankees"
  }
}
```

**Response:**
```json
{
  "result": {
    "id": 147,
    "name": "New York Yankees", 
    "abbreviation": "NYY",
    "query": "Yankees",
    "resolved": true
  }
}
```

**Supported Inputs:**
- Team names: "Yankees", "Red Sox", "Dodgers"
- Full names: "New York Yankees", "Boston Red Sox"
- Abbreviations: "NYY", "BOS", "LAD"
- Cities: "New York", "Boston", "Los Angeles"

#### `resolve_player` - Player Name Resolution
Convert any player reference to canonical MLB player information.

**Request:**
```json
{
  "command": "resolve_player",
  "params": {
    "name": "Judge"
  }
}
```

**Response:**
```json
{
  "result": {
    "id": 592450,
    "name": "Aaron Judge",
    "team": "New York Yankees",
    "query": "Judge", 
    "resolved": true
  }
}
```

**Supported Players:**
- Aaron Judge, Shohei Ohtani, Mookie Betts, Freddie Freeman
- Ronald Acuna Jr., Mike Trout, and other star players
- Both full names and last names supported

### ⚾ MLB Data Commands

- `getTeamInfo` - Get team information and details
- `getRoster` - Get team roster and player positions  
- `getPlayerStats` - Get player statistics (hitting, pitching)
- `getSchedule` - Get game schedule and dates
- `getLiveGame` - Get live game data and updates
- `getStandings` - Get league and division standings
- `getGameBoxscore` - Get detailed game boxscore
- `getPlayerInfo` - Get player biographical information
- `getSeasons` - Get season information and years
- `getVenues` - Get stadium and venue information

### 🎯 Enhanced Workflow

**Traditional Approach:**
```json
// Step 1: User needs to know exact team ID
{"command": "getRoster", "params": {"pathParams": {"teamId": "147"}}}
```

**Enhanced Meta-Tool Approach:**
```json
// Step 1: Resolve team name to ID
{"command": "resolve_team", "params": {"name": "Yankees"}}
// Returns: {"result": {"id": 147, "name": "New York Yankees"}}

// Step 2: Use resolved ID automatically (handled by sports-proxy)
{"command": "getRoster", "params": {"pathParams": {"teamId": "147"}}}
```

## Request Format

Send POST requests to the worker endpoint with the following JSON structure:

```json
{
  "command": "getPlayerStats",
  "params": {
    "pathParams": {
      "playerId": "660271"
    },
    "queryParams": {
      "stats": "season",
      "group": "hitting",
      "season": "2024"
    }
  }
}
```

## Response Format

Successful responses return:
```json
{
  "result": {
    // MLB API response data
  }
}
```

Error responses return:
```json
{
  "error": "Error message"
}
```

## Development

1. Install Wrangler CLI:
   ```bash
   npm install -g wrangler
   ```

2. Login to Cloudflare:
   ```bash
   wrangler login
   ```

3. Deploy the worker:
   ```bash
   wrangler deploy
   ```

## 📋 Complete Usage Examples

### 🔧 Meta-Tool Examples

#### Resolve Team Names
```bash
# Basic team resolution
curl -X POST https://mlbstats-mcp.your-domain.workers.dev \
  -H "Content-Type: application/json" \
  -d '{
    "command": "resolve_team",
    "params": {"name": "Yankees"}
  }'

# Response: {"result": {"id": 147, "name": "New York Yankees", "abbreviation": "NYY"}}
```

```bash
# Handle abbreviations and cities
curl -X POST https://mlbstats-mcp.your-domain.workers.dev \
  -H "Content-Type: application/json" \
  -d '{
    "command": "resolve_team", 
    "params": {"name": "LAD"}
  }'

# Response: {"result": {"id": 119, "name": "Los Angeles Dodgers", "abbreviation": "LAD"}}
```

#### Resolve Player Names
```bash
# Resolve player by last name
curl -X POST https://mlbstats-mcp.your-domain.workers.dev \
  -H "Content-Type: application/json" \
  -d '{
    "command": "resolve_player",
    "params": {"name": "Ohtani"}
  }'

# Response: {"result": {"id": 660271, "name": "Shohei Ohtani", "team": "Los Angeles Dodgers"}}
```

### ⚾ Data Retrieval Examples

#### Get Team Information
```json
{
  "command": "getTeamInfo",
  "params": {
    "queryParams": {
      "season": "2025",
      "sportId": "1"
    }
  }
}
```

#### Get Player Stats (with resolved player ID)
```json
{
  "command": "getPlayerStats", 
  "params": {
    "pathParams": {
      "playerId": "592450"  // Aaron Judge (from resolve_player)
    },
    "queryParams": {
      "stats": "season",
      "group": "hitting",
      "season": "2025"
    }
  }
}
```

#### Get Team Roster (with resolved team ID)
```json
{
  "command": "getRoster",
  "params": {
    "pathParams": {
      "teamId": "147"  // Yankees (from resolve_team)
    },
    "queryParams": {
      "season": "2025"
    }
  }
}
```

#### Get Schedule
```json
{
  "command": "getSchedule",
  "params": {
    "queryParams": {
      "sportId": "1",
      "date": "2025-07-04",
      "teamId": "147"  // Optional: filter by resolved team
    }
  }
}
```

### 🔍 Error Handling Examples

#### Team Not Found
```json
// Request: {"command": "resolve_team", "params": {"name": "Cowbays"}}
// Response: 
{
  "error": "Team \"Cowbays\" not found. Did you mean: cowboys, astros, royals?"
}
```

#### Player Not Found  
```json
// Request: {"command": "resolve_player", "params": {"name": "Jduge"}}
// Response:
{
  "error": "Player \"Jduge\" not found. Did you mean: judge?"
}
```

### 🚀 Integration with Sports-Proxy

When used with the enhanced sports-proxy, the workflow becomes seamless:

```python
# User input: "Get the Yankees roster"
# 1. Sports-proxy detects MLB sport
# 2. Extracts tools: resolve_team("yankees"), get_team_roster({})
# 3. MLB MCP resolves: resolve_team → {id: 147}
# 4. Sports-proxy enriches: get_team_roster({teamId: "147"})
# 5. MLB MCP returns: Complete roster data
```

This eliminates the need for manual entity resolution and creates a natural language interface to MLB data!