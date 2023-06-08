const express = require("express");
const app = express();

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const dbPath = path.join(__dirname, "cricketTeam.db");

app.use(express.json());
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//GET PLAYER API 1

app.get("/players/", async (request, response) => {
  const getPlayerDetails = `
    SELECT *
    FROM cricket_team;
    `;
  const playersArray = await db.all(getPlayerDetails);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

//POST PLAYER API2

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerid } = request.params;
  const { playerId, playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `
    INSERT INTO 
     cricket_team (player_name,jersey_number,role)
     VALUES (
          '${playerName}',
          '${jerseyNumber}',
          '${role}'
    );`;
  const dbResponse = await db.run(addPlayerQuery);
  response.send("Player Added to Team");
});

//GET PLAYER1 API3

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerDetail = `
    SELECT *
    FROM cricket_team
    WHERE player_id = ${playerId};
    `;
  const player = await db.get(getPlayerDetail);
  response.send(convertDbObjectToResponseObject(player));
});

//POST PLAYER API

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayer = `
    UPDATE cricket_team
    SET 
        player_name = '${playerName}',
        jersey_number = '${jerseyNumber}',
        role = '${role}'
    WHERE player_id = ${playerId}
    ;`;
  await db.run(updatePlayer);
  response.send("Player Details Updated");
});

//DELETE PLAYER API

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayer = `
    DELETE FROM cricket_team
    WHERE player_id = ${playerId};`;
  await db.run(deletePlayer);
  response.send("Player Removed");
});

module.exports = app;
