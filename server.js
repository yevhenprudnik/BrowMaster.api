const express = require('express');
const cors = require('cors');
let port = process.env.PORT || 3000;
const knex = require('knex');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0; 

const db = knex({
    client: 'pg',
    connection: {
        connectionString: process.env.DATABASE_URL,
        ssl: true
        }
    });

const app = express();
app.use(express.json());
app.use(cors());

const database = [
    {
        One: true,
        Two: true,
        Three: false,
        Four: true,
        Five: false,
        Six: false,
        Seven: false,
        Date: '"2027-03-19T06:06:00.000Z"', 
        Time: '"12:00"',
        Name: "John",
        Telephone: '0680887728',
        Instagram: '@_jetstrog_'
    }
]


    const timeDiff = (time1, time2) => {
        let NewTime1 = (parseInt(time1[1])*10+parseInt(time1[2]))*60 + parseInt(time1[4])*10+parseInt(time1[5]);
        let NewTime2 = (parseInt(time2[1])*10+parseInt(time2[2]))*60 + parseInt(time2[4])*10+parseInt(time2[5]);
        
        return Math.abs(NewTime1-NewTime2);
    }



app.get('/', (req, res) => {
    res.json(database)
})

app.post('/appointment', (req, res) => {
    let One = req.body.One;
    let Two = req.body.Two;
    let Three = req.body.Three;
    let Four = req.body.Four;
    let Five = req.body.Five;
    let Six = req.body.Six;
    let Seven = req.body.Seven;
    let Date = (JSON.stringify(req.body.Date)).slice(0,11)+`"`;
    let Time = JSON.stringify(req.body.Time);
    let Name = req.body.Name;
    let Telephone = req.body.Telephone;
    let Instagram = req.body.Instagram;
    if (Name === "") {
        res.json("Name is required!")
    }
    else if (Telephone === "") {
        res.json("Telephone is required!")
    }
    else if (Date === "") {
        res.json("Date is required!")
    }
    else if ((parseInt(Time[1])*10+parseInt(Time[2]))*60 + parseInt(Time[4])*10+parseInt(Time[5]) > 1080 ||
    (parseInt(Time[1])*10+parseInt(Time[2]))*60 + parseInt(Time[4])*10+parseInt(Time[5]) < 600){
        res.json("Set a proper time")
    }
    else if (Time === "\"\"") {
        res.json("Time is required!")
    }
    else if (!One && !Two && !Three && !Four && !Five && !Six && !Seven) {
        res.json("Select procedure")
    }
    else {
        let Success = true;
        db.select('*').from('clients').where({
            register_date: Date,
        })
        .then(user_date => {
            if (user_date[0] !== undefined) {
                for (let i = 0; i < user_date.length; i++) {
                    if (timeDiff(user_date[i].register_time, Time) < 30) {
                        Success = false;
                        res.json("Reserved")
                        break;
                    }
                }
            }
            if (Success) {
                db('clients').insert({
                    one: One,
                    two: Two,
                    three: Three,
                    four: Four,
                    five: Five,
                    six: Six,
                    seven: Seven,
                    register_date: Date, 
                    register_time: Time,
                    name: Name,
                    telephone: Telephone,
                    instagram: Instagram
                })
                .then(res.json('Success'))
            }
        })
}
})

app.post('/add', (req, res)=>{
    const { Link, Name} = req.body;
    let link = Link;
    let name = Name;
    if (link !== "" && name !== "") {
        db('photos').insert({
            name: name,
            link: link
        })
        .then(res.json('Added'))
    }
    else{
        res.json('Error')
    }
})

app.get('/links', (req, res)=>{
    db.select('link').from('photos')
    .then(data => res.json(data))
})

app.get('/names', (req, res)=>{
    db.select('name').from('photos')
    .then(data => res.json(data))
})

app.delete('/delete', (req, res)=>{
    let Name = req.body.Name;
    db('photos')
    .where('name', Name)
    .del()
    .then(res.json('Deleted'))
})

app.listen(port, () =>{
    console.log(`listening on port ${port}`);
});