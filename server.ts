import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API Route for Match Data
  app.get("/api/match-data", async (req, res) => {
    const apiKey = process.env.SPORTS_API_KEY;

    if (!apiKey) {
      return res.status(401).json({
        error: "Missing SPORTS_API_KEY",
        message: "Please provide a SPORTS_API_KEY in the Settings menu to enable live data."
      });
    }

    try {
      // Example: Fetching a specific fixture from API-Football
      // In a real app, you might pass a fixture ID as a query param
      const fixtureId = req.query.fixtureId || "1035041"; // Example ID
      
      const response = await fetch(`https://v3.football.api-sports.io/fixtures?id=${fixtureId}`, {
        headers: {
          "x-rapidapi-key": apiKey,
          "x-rapidapi-host": "v3.football.api-sports.io"
        }
      });

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.response || data.response.length === 0) {
        return res.status(404).json({ error: "Match not found" });
      }

      const match = data.response[0];
      
      // Transform API-Football data to our application's MatchData format
      const transformedData = {
        id: match.fixture.id.toString(),
        homeTeam: match.teams.home.name,
        awayTeam: match.teams.away.name,
        score: {
          home: match.goals.home ?? 0,
          away: match.goals.away ?? 0
        },
        time: match.fixture.status.elapsed ?? 0,
        status: match.fixture.status.long,
        stats: {
          possession: {
            home: parseInt(match.statistics?.find(s => s.team.id === match.teams.home.id)?.statistics.find(s => s.type === "Ball Possession")?.value ?? "50%"),
            away: parseInt(match.statistics?.find(s => s.team.id === match.teams.away.id)?.statistics.find(s => s.type === "Ball Possession")?.value ?? "50%")
          },
          dangerousAttacks: {
            home: parseInt(match.statistics?.find(s => s.team.id === match.teams.home.id)?.statistics.find(s => s.type === "Dangerous Attacks")?.value ?? "0"),
            away: parseInt(match.statistics?.find(s => s.team.id === match.teams.away.id)?.statistics.find(s => s.type === "Dangerous Attacks")?.value ?? "0")
          },
          shotsOnTarget: {
            home: parseInt(match.statistics?.find(s => s.team.id === match.teams.home.id)?.statistics.find(s => s.type === "Shots on Goal")?.value ?? "0"),
            away: parseInt(match.statistics?.find(s => s.team.id === match.teams.away.id)?.statistics.find(s => s.type === "Shots on Goal")?.value ?? "0")
          },
          corners: {
            home: parseInt(match.statistics?.find(s => s.team.id === match.teams.home.id)?.statistics.find(s => s.type === "Corner Kicks")?.value ?? "0"),
            away: parseInt(match.statistics?.find(s => s.team.id === match.teams.away.id)?.statistics.find(s => s.type === "Corner Kicks")?.value ?? "0")
          },
          yellowCards: {
            home: parseInt(match.statistics?.find(s => s.team.id === match.teams.home.id)?.statistics.find(s => s.type === "Yellow Cards")?.value ?? "0"),
            away: parseInt(match.statistics?.find(s => s.team.id === match.teams.away.id)?.statistics.find(s => s.type === "Yellow Cards")?.value ?? "0")
          },
          redCards: {
            home: parseInt(match.statistics?.find(s => s.team.id === match.teams.home.id)?.statistics.find(s => s.type === "Red Cards")?.value ?? "0"),
            away: parseInt(match.statistics?.find(s => s.team.id === match.teams.away.id)?.statistics.find(s => s.type === "Red Cards")?.value ?? "0")
          }
        },
        odds: {
          home: 1.85, // Odds usually come from a separate endpoint or provider
          draw: 3.40,
          away: 4.20
        },
        liveXG: {
          home: 1.24,
          away: 0.86
        },
        tendency: {
          home: "Forte Pressão",
          away: "Contra-ataque",
          nextGoal: "Casa"
        },
        timeline: [
          { time: 0, pressure: 0 },
          { time: 10, pressure: 20 },
          { time: 20, pressure: 45 },
          { time: 30, pressure: 30 },
          { time: 40, pressure: 65 },
          { time: 50, pressure: 55 }
        ]
      };

      res.json(transformedData);
    } catch (error) {
      console.error("Error fetching sports data:", error);
      res.status(500).json({ error: "Failed to fetch live data" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
