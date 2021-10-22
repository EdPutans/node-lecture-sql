import express from "express";
import dataDogs, { Doggo } from "./data/dogs";
import { Request } from "express";
import addDoggo from "./db";

type DogRequest = Request<{ id: string }, any, Doggo>;

const app = express();
app.use(express.json());

const port = 3000;


let dogs = [...dataDogs];

/**
@get_all_doggos
*/
app.get("/dogs/", (req, res) => {
  res.send(dogs);
});
/**
@get_single_pupper
*/
app.get("/dogs/:id", (req, res) => {
  const doggo = dogs.find(
    (item) => item.id.toString() === req.params.id.toString()
  );

  if (!doggo) return res.status(404).send("404: Dog not found");

  console.log(`Someone is interested in ${doggo.name}!`);
  return res.send(doggo);
});

/**
@add_another_doggo
*/
app.post("/dogs", (req: DogRequest, res) => {
  if (!req.body.age || !req.body.name)
    return res.status(400).send("Name or age aren't present");

  if (typeof req.body.name !== "string")
    return res.status(400).send("Name must be a string");

  if (typeof req.body.age !== "number")
    return res.status(400).send("Wrong type for age");

  const lastDogId = Math.max(...dogs.map((doggo) => doggo.id));

  const newId = dogs.length ? lastDogId + 1 : 1;

  console.log({ lastDogId, newId });
  const newDog: Doggo = {
    age: req.body.age,
    name: req.body.name,
    id: newId,
  };

  if (req.body.hasOwner) newDog.hasOwner = req.body.hasOwner;
  if (req.body.size) newDog.size = req.body.size;

  dogs = [...dogs, newDog];

  return res.send(dogs);
});
/**
@update_doge
*/
app.patch("/dogs/:id", (req: DogRequest, res) => {
  const doggoIndex = dogs.findIndex(
    (pupper) => pupper.id.toString() === req.params.id
  );

  if (doggoIndex === -1) return res.status(404).send("404: Dog not found");

  const updatedDog = { ...dogs[doggoIndex], ...req.body };
  dogs[doggoIndex] = updatedDog;

  res.send(dogs);
});

/**
@murder_animal
*/
app.delete("/dogs/:id", (req: DogRequest, res) => {
  dogs = dogs.filter((doggo) => doggo.id.toString() !== req.params.id);

  res.status(204).send();
});


app.listen(port, (): void => {
  // either the types mismatch or err doesnt exist?
  return console.log(`server is listening on the port ${port}`);
});
