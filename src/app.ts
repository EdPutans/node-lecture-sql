import express from "express";
import { Doggo } from "./data/dogs";
import { Request } from "express";

import Database from 'better-sqlite3';

const db = new Database('doggos.db', { verbose: console.log });

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

const getAllStatement = db.prepare(`SELECT * FROM doggos;`);
app.get("/dogs/", (req, res) => {
  const dogs = getAllStatement.get();

  res.send(dogs);
});

const getDogStatement = db.prepare(`SELECT * FROM doggos WHERE id=?;`)

app.get("/dogs/:id", (req, res) => {
  const doggo = getDogStatement.get(req.params.id);

  res.send(doggo);
});

const insertStatement = db.prepare(`INSERT INTO doggos (name, age, size, hasOwner) VALUES (?,?,?,?);`);
app.post("/dogs", async (req: DogRequest, res) => {

  const { name, age, size, hasOwner } = req.body;
  const { lastInsertRowid } = insertStatement.run(name, age, size, hasOwner);
  const lastInsertedDog = getDogStatement.get(lastInsertRowid);

  res.send(lastInsertedDog);
});

const updateStatement = db.prepare(`UPDATE doggos SET name=?, age=?, size=?, hasOwner=? WHERE id=?;`);
app.patch("/dogs/:id", (req: DogRequest, res) => {
  const { name, age, hasOwner, size } = req.body;
  const existingDog = getDogStatement.get(req.params.id);

  updateStatement.run(
    name ?? existingDog.name,
    age ?? existingDog.age,
    size ?? existingDog.size,
    hasOwner ?? existingDog.hasOwner,
    req.params.id
  );

  const updatedDog = getDogStatement.get(req.params.id);

  res.send(updatedDog);
});

const deleteStatement = db.prepare(`DELETE FROM doggos WHERE id=?;`);

app.delete("/dogs/:id", (req: DogRequest, res) => {
  deleteStatement.run(req.params.id)
  res.send({ message: "Dog successfully deleted lol" })
});

app.listen(port, (): void => {
  // either the types mismatch or err doesnt exist?
  return console.log(`server is listening on the port ${port}`);
});
