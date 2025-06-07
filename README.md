# MLB Stats MCP Server

A Cloudflare Worker that serves as an MCP (Model Context Protocol) server for accessing MLB Stats API data.

## Features

- Proxy requests to MLB Stats API
- Support for multiple MLB endpoints
- CORS enabled for web applications
- Error handling and validation
- No API keys required (MLB Stats API is public)

## Supported Commands

- `getTeamInfo` - Get team information
- `getRoster` - Get team roster
- `getPlayerStats` - Get player statistics
- `getSchedule` - Get game schedule
- `getLiveGame` - Get live game data
- `getStandings` - Get league standings
- `getGameBoxscore` - Get game boxscore
- `getPlayerInfo` - Get player information
- `getSeasons` - Get season information
- `getVenues` - Get venue information

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

## Example Usage

### Get Team Information
```json
{
  "command": "getTeamInfo",
  "params": {
    "queryParams": {
      "season": "2024",
      "sportId": "1"
    }
  }
}
```

### Get Player Stats
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

### Get Schedule
```json
{
  "command": "getSchedule",
  "params": {
    "queryParams": {
      "sportId": "1",
      "date": "2024-07-04"
    }
  }
}
```