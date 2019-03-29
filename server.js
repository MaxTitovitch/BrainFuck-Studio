var express = require("express");
var app = express();
app.set("view engine", "ejs");

var fs = require('fs');
var getFile = (file) => fs.readFileSync(file, 'utf8');

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });


app.use('/public', express.static('public'));

app.post("/readFile", upload.single('this-file'), function (req, res) {
    res.send(req.file.buffer + "");
});

app.use("/", function (req, res) {
    items = JSON.parse(getFile("modules-data.json"));
    res.render("index", {items : items});
});

app.use("/:some",function (req, res) {
  res.redirect("/");
});

app.listen(3000);


// 3) Авторизация + ФайловаяСистема
// 4) Мобилка
// 5) Опти