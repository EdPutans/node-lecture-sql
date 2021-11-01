import path from "path";
import { Doggo } from "./data/dogs";
import { Database, RunResult, sqlite3, Statement } from 'sqlite3'

type DoggoCallback = (response: { row: Doggo, err: Error | null }) => void

const doggoDatabasePath = path.resolve(__dirname, './db/doggos.db')

const sqlite3 = require('sqlite3').verbose();

let db: Database = new sqlite3.Database(doggoDatabasePath, sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Connected to the doggos database.');
    }
});

// @init
db.run(`CREATE TABLE IF NOT EXISTS doggos (
        name text NOT NULL,
        age integer NOT NULL,
        hasOwner integer,
        size text,
        id INTEGER PRIMARY KEY AUTOINCREMENT
    );`);


const insertSQL = `INSERT INTO doggos (name, age, size, hasOwner ) VALUES (?,?,?,?);`


export const addDoggo = (dog: Omit<Doggo, 'id'>, callback: DoggoCallback) => {
    const { name, age, size, hasOwner } = dog;

    db.serialize(() => {
        db.run(
            insertSQL,
            [name, age, size, hasOwner],
            function (this: RunResult, error) {
                if (error) return { error };

                db.get(`SELECT * FROM Doggos ORDER BY id DESC LIMIT 1;`, (err, row) => {
                    callback({ row, err })
                })
            }
        );

    })
}

export const updateDoggo = (id, dog: Omit<Doggo, 'id'>) => {
    const { name, age, hasOwner, size } = dog;


    db.run(`UPDATE Doggos 
        SET name = ?, age = ?, hasOwner = ?, size = ?
        WHERE id = ${id};`, [name, age, hasOwner ? 1 : 0, size], err => {
        if (err) return err;
        console.log('Successfully updated dog:', { ...dog, id })
    });
}

// addDoggo({ name: '0', age: 0, hasOwner: false, size: 'big' })
// updateDoggo(1, { name: '0', age: 0, hasOwner: false, size: 'big' })


export default addDoggo;