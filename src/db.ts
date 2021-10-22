import path from "path";
import { Doggo } from "./data/dogs";

const doggoDatabasePath = path.resolve(__dirname, './db/doggos.db')

const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database(doggoDatabasePath, sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Connected to the doggos database.');
    }
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS doggos (
        name text NOT NULL,
        age integer NOT NULL,
        hasOwner integer,
        size text,
        id INTEGER PRIMARY KEY AUTOINCREMENT
    );`);
})

const addDoggo = (dog: Omit<Doggo, 'id'>) => {
    const { name, age, hasOwner, size } = dog;

    db.serialize(() => {
        db.run(`INSERT INTO doggos (name,age,hasOwner,size) VALUES (?,?,?,?);`, [name, age, hasOwner ? 1 : 0, size], err => {
            console.error(err)
        });
        db.each("SELECT * from doggos;", function (err, row) {
            console.log(row.id + ": " + row.name);
        });
    })
}

addDoggo({ name: 'Test1', age: 22, hasOwner: false, size: 'small' })

export default addDoggo;