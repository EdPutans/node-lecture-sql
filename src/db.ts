import { Doggo } from "./data/dogs";
import path from 'path';
import Database from 'better-sqlite3';

const db = new Database(path.resolve(__dirname, 'db/doggos.db'), { verbose: console.log })

const init = db.prepare(`CREATE TABLE IF NOT EXISTS doggos (
    name text NOT NULL,
    age integer NOT NULL,
    hasOwner integer,
    size text,
    id INTEGER PRIMARY KEY AUTOINCREMENT
);`);

init.run()

const getByIdQuery = db.prepare(`SELECT * FROM doggos WHERE id=?`)
const insertQuery = db.prepare(`INSERT INTO doggos (name, age, size, hasOwner) VALUES (?,?,?,?);`);
const updateQuery = db.prepare(`UPDATE doggos SET name=?, age=?, size=?, hasOwner=? WHERE id=?;`);
const deleteQuery = db.prepare(`DELETE FROM doggos WHERE id=?;`);

export const addDoggo = (dog: Omit<Doggo, 'id'>) => {
    try {
        const { name, age, size, hasOwner } = dog;

        const { lastInsertRowid } = insertQuery.run(name, age, size, hasOwner);
        const lastItem = getByIdQuery.get(lastInsertRowid)

        return lastItem
    } catch (error) {
        console.log({ error })
        return { error }
    }

}

export const updateDoggo = (id, dogParams: Partial<Doggo>) => {
    try {
        const existingDog = getByIdQuery.get(id);

        updateQuery.run(
            dogParams.name ?? existingDog.name,
            dogParams.age ?? existingDog.age,
            dogParams.hasOwner ?? existingDog.hasOwner,
            dogParams.size ?? existingDog.size,
            id
        );

        const updatedDog = getByIdQuery.get(id);

        console.log({ updatedDog })
        return updatedDog;
    } catch (error) {
        console.log({ error })
        return { error }
    }
}


export const deleteDoggo = (id) => {
    try {
        deleteQuery.run(id)
        return "All good";
    } catch (error) {
        console.log(error)
        return { error }
    }
}

//@ts-ignore
addDoggo({ name: '2', age: undefined })
updateDoggo(1, { name: 'ANANA', size: 'small', age: 2 })
updateDoggo(1, { name: 'ANANA', size: undefined, age: 3 })
deleteDoggo(1)