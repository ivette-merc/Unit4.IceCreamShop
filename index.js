// install pg and express
const pg = require("pg");
const express = require("express");
const client = new pg.Client(
  process.env.DATABASE_URL || "postgres://localhost/the_acme_icecream_shop"
);
const app = express();
app.use(require("morgan")("dev"));
app.use(express.json());

//GET ALL FLAVORS
app.get("/api/flavors", async (req, res, next) => {
  try {
    const SQL = `SELECT * from flavors`;
    const response = await client.query(SQL);
    res.send(response.rows);
  } catch (error) {
    next(error);
  }
});

//GET SINGLE FLAVOR
app.get("/api/flavors/:id", async (req, res, next) => {
  try {
    const flavorId = req.params.id;
    const SQL = `SELECT * FROM flavors WHERE id = $1`;
    const response = await client.query(SQL, [flavorId]);
    res.send(response.rows);
  } catch (error) {
    next(error);
  }
});

//POST (CREATE) FLAVOR
app.post("/api/flavors", async (req, res, next) => {
  try {
   

    const SQL = /*SQL*/ `
            INSERT INTO flavors (txt)
            VALUES ($1)
            RETURNING *
        `;

    const response = await client.query(SQL, [req.body.txt]);
    res.send(response.rows[0]); 
  } catch (error) {
    next(error);
  }
});

//DELETE FLAVOR
app.delete("/api/flavors/:id", async (req, res, next) => {
  try {
    const SQL = /*SQL*/ `
        DELETE from flavors
        WHERE id =$1 
        `;

    const response = await client.query(SQL, [req.params.id]);
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});
//PUT (updates flavor)
app.put("/api/flavors/:id", async (req, res, next) => {
  try {
    const { text, is_favorite } = req.body;
    const flavorId = req.params.id;

   
    if (!text || typeof is_favorite !== "boolean") {
      return res.status(400).send("Invalid request body.");
    }

    const SQL = `
        UPDATE flavors
        SET txt=$1, is_favorite=$2, updated_at=now()
        WHERE id=$3
        RETURNING *
        `;

    const response = await client.query(SQL, [text, is_favorite, flavorId]);
    if (response.rows.length === 0) {
      return res.status(404).send("Flavor not found.");
    }

    res.send(response.rows[0]);
  } catch (error) {
    next(error);
  }
});

//create init function
const init = async () => {
  await client.connect();
  console.log("connected to database");

  let SQL = /*SQL*/ `
    DROP TABLE IF EXISTS flavors;
    CREATE TABLE flavors(
        id SERIAL PRIMARY KEY,
        txt VARCHAR (49),
        is_favorite BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
    )
 `;

  await client.query(SQL);
  console.log("tables created");

  SQL = /*SQL*/ `
  INSERT INTO flavors(txt, is_favorite) VALUES('Chocolate', true);
  INSERT INTO flavors(txt, is_favorite) VALUES('Strawberry', false);
  INSERT INTO flavors(txt, is_favorite) VALUES('Vanilla', false);
  INSERT INTO flavors(txt, is_favorite) VALUES('MintChoco', true);
  INSERT INTO flavors(txt, is_favorite) VALUES('Pistachio', false);
`;
  await client.query(SQL);
  console.log("data seeded");

  const port = process.env.PORT || 3001;
  app.listen(port, () => console.log(`listening on port ${port}`));
};

init();
