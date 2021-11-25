import express from "express";
import { Doggo } from "./data/dogs";
import { Request } from "express";

import Database from 'better-sqlite3';

const db = new Database('src/dogs.db', { verbose: console.log });

const init = db.prepare(`CREATE TABLE IF NOT EXISTS doggos (
    name text NOT NULL,
    age integer NOT NULL,
    hasOwner integer,
    size text,
    id INTEGER PRIMARY KEY AUTOINCREMENT
);`);
init.run()

type DogRequest = Request<{ id: string }, any, Doggo>;

const app = express();
app.use(express.json());

const port = 3000;

const getAll = db.prepare(`SELECT * FROM doggos;`);

app.get("/dogs", (req, res) => {
  const dogs = getAll.get();

  res.send(dogs);
});

const getDog = db.prepare(`SELECT * FROM doggos WHERE id=?;`)
app.get("/dogs/:id", (req: DogRequest, res) => {
  const doggo = getDog.get(req.params.id);

  res.send(doggo);
});

const insertDog = db.prepare(`INSERT INTO doggos (name, age, size, hasOwner) VALUES (?,?,?,?);`);
app.post("/dogs", async (req: DogRequest, res) => {

  const { name, age, size, hasOwner } = req.body;
  const result = insertDog.run(name, age, size, hasOwner);
  const lastInsertedDog = getDog.get(result.lastInsertRowid);

  res.send(lastInsertedDog);
});

const update = db.prepare(`UPDATE doggos SET name=?, age=?, size=?, hasOwner=? WHERE id=?;`);

app.patch("/dogs/:id", (req: DogRequest, res) => {
  const { name, age, hasOwner, size } = req.body;
  const existingDog = getDog.get(req.params.id);

  update.run(
    name ?? existingDog.name,
    age ?? existingDog.age,
    size ?? existingDog.size,
    hasOwner ?? existingDog.hasOwner,
    req.params.id
  );

  const updatedDog = getDog.get(req.params.id);

  res.send(updatedDog);
});

const deleteDog = db.prepare(`DELETE FROM doggos WHERE id=?;`);

app.delete("/dogs/:id", (req: DogRequest, res) => {
  const dogExists = !!getDog.get(req.params.id);
  if (!dogExists) return res.status(404).send("Dog not found")

  deleteDog.run(req.params.id)
  res.send("Dog successfully deleted lol")
});

app.listen(port, (): void => {
  // either the types mismatch or err doesnt exist?
  return console.log(`server is listening on the port ${port}`);
});
