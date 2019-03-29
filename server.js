var express = require("express");
var app = express();
app.set("view engine", "ejs");
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
var MongoClient = require("mongodb").MongoClient;
var db, currentUser = null;
var fs = require('fs');
var getFile = (file) => fs.readFileSync(file, 'utf8');

app.use('/public', express.static('public'));

app.post("/readFile", upload.single('this-file'), function (req, res) {
    res.send(req.file.buffer + "");
});


app.get("/add", function (req, res) {
    var newUser = { mail: req.query.mail, login: req.query.login, password: req.query.password }
    db.collection("users").findOne({"mail": newUser.mail}, function (err, doc) {
        if(doc == null) {
            currentUser = newUser;
            db.collection("users").insertOne(newUser, function (err, result) {});
            return res.send(newUser);
        } 
        return res.send({answer: false});
    });


});


app.get("/all", function (req, res) {
    db.collection("users").find().toArray(function (err, doc) {
        if(doc != null) {
            return res.send(doc);

        } 
        return res.send({answer: false});
    });
});


app.get("/remove", function (req, res) {
    db.collection("users").deleteOne({mail: req.query.mail}, function (err, doc) {
        return res.send({answer: false});
    });
});


app.get("/get", function (req, res) {
    db.collection("users").findOne({"mail": req.query.mail}, function (err, doc) {
        if(doc != null) {
            if(req.query.password == doc.password){
                currentUser = doc;
                return res.send(currentUser);
            }
        } 
        return res.send({answer: false});
    });
});


app.get("/close", function (req, res) {
    currentUser = null;
    return res.send(currentUser);
});


app.get("/save", function (req, res) {
    var dir = __dirname + "\\userfiles\\" + currentUser.login;
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    fs.writeFileSync(dir + "\\" +req.query.name, req.query.data);
    return res.send(currentUser);
});


app.get("/removefile", function (req, res) {
    var file = __dirname + "\\userfiles\\" + currentUser.login + "\\" + req.query.name;
    if (fs.existsSync(file)) fs.unlink(file, function () {})
    return res.send(currentUser);
});


app.get("/openfile", function (req, res) {
    var file = __dirname + "\\userfiles\\" + currentUser.login + "\\" + req.query.name;
    if (fs.existsSync(file)) {
        var data = fs.readFileSync(file, 'utf8')
        res.send({data: data, filename: (req.query.name)});
    }
    return res.send({answer: false});
});


app.get("/filelist", function (req, res) {
    var dir = __dirname + "\\userfiles\\" + currentUser.login + "\\", arrayfiles=[];
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    fs.readdir(dir, (err, files) => {
        return res.send({"files": files});
    });
});


app.use("/", function (req, res) {
    items = JSON.parse(getFile("modules-data.json"));
    if(currentUser != null) {
        display = {displayOn: "none", displayOff: "display", dissClass: "", diss: "", name: currentUser.login};
    } else {
        display = {displayOn: "display", displayOff: "none", dissClass: " disabled", diss: "disabled='true'", name: "<Пользователь>"};
    }
    res.render("index", {items: items, user: currentUser, display: display});
});


app.use("/:some",function (req, res) {
  res.redirect("/");
});


const mongoClient = new MongoClient("mongodb://localhost:27017/", { useNewUrlParser: true });
mongoClient.connect(function(err, client){
    if(err){
        return console.log(err);
    }
    db = client.db("bfitra");
    app.listen(3000);
});