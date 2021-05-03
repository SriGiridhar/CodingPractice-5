const express = require("express");
const app = express();
app.use(express.json());
const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
let db = null;
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => console.log("Server is Starting"));
  } catch (e) {
    console.log(`DBError:{e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

const dbObjectToResponseObjectMovies = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};
const dbObjectToResponseObjectDirector = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

//API 1
app.get("/movies/", async (request, response) => {
  const moviesQuery = `Select movie_name from movie;`;
  const Movies = await db.all(moviesQuery);
  response.send(
    Movies.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

// API 2
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const movieQuery = `Insert Into movie
    (director_id,movie_name,lead_actor)
    Values 
    (${directorId},
     '${movieName}',
     '${leadActor}');`;
  const Movie = await db.run(movieQuery);
  response.send("Movie Successfully Added");
});
//API 3
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieQuery = `Select * from movie
    Where movie_id=${movieId}`;
  const Movie = await db.get(movieQuery);
  response.send(dbObjectToResponseObjectMovies(Movie));
});
//API 4
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const movieQuery = `UPDATE movie 
    SET 
    director_id=${directorId},
    movie_name='${movieName}',
    lead_actor='${leadActor}';`;
  const UpdateMovie = db.run(movieQuery);
  response.send("Movie Details Updated");
});

//API 5
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `Delete From movie
    Where movie_id=${movieId};`;
  await db.run(deleteQuery);
  response.send("Movie Removed");
});

// API 6
app.get("/directors/", async (request, response) => {
  const directorQuery = `Select * from director;`;
  const Director = await db.all(directorQuery);
  response.send(
    Director.map((eachDirector) =>
      dbObjectToResponseObjectDirector(eachDirector)
    )
  );
});
// API 7

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMoviesQuery = `
    SELECT
      movie_name
    FROM
      movie
    WHERE
      director_id='${directorId}';`;
  const moviesArray = await db.all(getDirectorMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => ({
      movieName: eachMovie.movie_name,
    }))
  );
});

module.exports = app;
