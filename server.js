const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient
const multer = require('multer');

var db, collection, upload;

const dbName = "shoutout";
const url = `mongodb+srv://cvilla:rc123@cluster0.zzquo.mongodb.net/${dbName}?retryWrites=true&w=majority`

app.listen(3000, () => {
    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (error, client) => {
        if(error) {
            throw error;
        }
        db = client.db(dbName);
        console.log("Connected to `" + dbName + "`!");
    });
});

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(express.static('public'))

app.get('/', (req, res) => {
  db.collection('shoutouts').find().toArray((err, result) => {
      if (err) return console.log(err)
      res.render('index.ejs', {shoutouts: result})
    })
})

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/img/')
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + ".png")
  }
})
var upload = multer({storage: storage})

app.post('/add', upload.single('file-to-upload'), (req, res) => { console.log(req.file); console.log(req.body);
  db.collection('shoutouts').insertOne({name: req.body.name, image: "img/" + req.file.filename}, (err, result) => {
    if (err) return console.log(err)
    console.log('Document added to database');
  })
})

app.put('/edit', upload.single('filetoupload'), (req, res) => {
  console.log(req.body);
    db.collection('shoutouts')
    .findOneAndUpdate({name: req.body.name, image: req.body.image}, {
      $set: { name: ((req.body.newName === '') ? req.body.name : req.body.newName), 
              image: ((!req.file) ? req.body.image : "img/" + req.file.filename)}
    }, {
      upsert: true
    }, (err, result) => {
      if (err) return res.send(err)
      res.send('Document updated');
    })
})

app.delete('/delete', (req, res) => {
  console.log(req.body);
  db.collection('shoutouts').findOneAndDelete({name: req.body.name,}, (err, result) => {
    if (err) return res.send(500, err)
    res.send('Document deleted!')
  })
})
app.delete('/completedTasks', (req, res) => {
  db.collection('shoutouts').deleteMany({completed: true}, (err, result) => {
    if (err) return res.send(500, err)
    res.send('Collection cleared!')
  })
})
app.delete('/clear', (req, res) => {
  db.collection('shoutouts').deleteMany({}, (err, result) => {
    if (err) return res.send(500, err)
    res.send('List Cleared!')
  })
})
