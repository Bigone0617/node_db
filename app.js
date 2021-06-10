// import express
var express = require('express');
// import mysql 
var mysql = require('mysql');
// import bodyParser
var bodyParser = require('body-parser');

// connect to mysql
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '147147',
    database: 'o2'
});
connection.connect();

var app = express();

app.use(express.static('views'));
app.use(bodyParser.urlencoded({extended: false}));
app.set('views', './views');
app.set('view engine', 'jade');

// page source pretty
app.locals.pretty = true;



app.listen(3000, function(){
    console.log('connect 3000 port!');
});

// main page
app.get('/', function(req, res){
    res.render('index')
});

//? ========================== SIGN IN & SIGN UP START====================

// Sign Up page
app.get('/signUp', function(req, res){
    res.render('signUp');
});

// request Sign Up
app.post('/signUp', function(req, res){
    var id = req.body.id;
    var pw = req.body.pw;
    var name = req.body.name;
    var sex = req.body.sex;
    var country = req.body.country;
    var location = req.body.location;
    var signDate = new Date();

    var selectSql = 'SELECT * FROM user WHERE id = ?';
    
    // check duplicate id and insert infomation
    connection.query(selectSql,['"'+id+'"'],function(err, rows, fields){
        if(err){
            console.log(err);
            res.send('err to select');
        }else{
            // 중복 아이디가 있을때
            if(rows.length >= 1){
                res.send('duplicate id');
            }else{
                //중복 id가 없으므로 insert data
                var sql = 'INSERT INTO user VALUE(?,?,?,?,?,?,?)';
                connection.query(sql, [id, pw, name, sex, country, location, signDate],function(err, datas, fields){
                    if(err){
                        console.log(err);
                        res.send('error to insert');
                    }else{
                        res.render('index');
                    }
                });
            }
        }
    });

});

// signIn
app.get('/signIn', function(req, res){
    res.render('signin');
});

// signIn Button
app.post('/signIn', function(req, res){
    var id = req.body.id;
    var pw = req.body.pw;
    var checkSql = 'SELECT * FROM user WHERE id=? AND pw=?';

    connection.query(checkSql, [id, pw], function(err, datas, fields){
        if(err){
            console.log(err);
            res.send('error to signIn');
        }else{
            // 아이디와 비밀번호가 일치하는 경우
            if(datas.length >= 1){
                res.redirect('/main/'+id);
            }else{
                res.send('check id or pw');
            }
        }
    });
});

//? ========================== SIGN IN & SIGN UP END====================

//? ========================== MAIN PAGE START ====================

app.get('/main/:id', function(req, res){
    var id = req.params.id;
    var selectSql = 'SELECT * FROM topic';

    connection.query(selectSql, function(err, topics, fields){
        if(err){
            res.send('error to select topics');
        }else{
            var yourTopics = topics.filter(data => data.author == id );
            res.render('main',{id : id, topics:topics, yourTopics: yourTopics});
        }
    });
    
});

// create new topic page
app.get('/main/:id/new', function(req, res){
    var id = req.params.id;
    res.render('new', {id: id});
});

// insert new topic
app.post('/main/:id/new', function(req, res){
    var id = req.params.id;
    var title = req.body.title;
    var decription = req.body.decription;
    var author = id;
    var insertSql = 'INSERT INTO topic(title, decription, author) VALUES(?, ?, ?)';

    connection.query(insertSql, [title, decription, author], function(err, rows, fields){
        if(err){
            res.send('error to create new topic');
        }else{
            res.redirect('/main/'+id);
        }
    });
});

// edit topics page
app.get('/main/:author/edit/:id/:editable',function(req, res){
    var id = req.params.id;
    var editable = req.params.editable;
    var selectSql = 'SELECT * FROM topic WHERE id =?';

    connection.query(selectSql,[id], function(err, datas, fields){
        if(err){
            res.send('error to select topic');
        }else {
            if(datas.length >= 1){
                res.render('edit', {datas: datas[0], editable: editable})
            }else{
                res.send('Sorry, we can not find topic');
            }
        }
    })
});

// edit topics
app.post('/main/edit/:id', function(req, res){
    var id = req.params.id;
    var title = req.body.title;
    var decription = req.body.decription;
    var author = req.body.author;
    
    var updateSql = 'UPDATE topic SET title=?, decription=? WHERE id=?';

    connection.query(updateSql, [title, decription, id], function(err, datas, fields){
        if(err){
            res.send('Error to update');
        }else{
            res.redirect('/main/'+author);
        }
    })
});

// delete topics
app.post('/main/:author/delete/:id', function(req, res){
    var id = req.params.id;
    var author = req.params.author;

    var deleteSql = 'DELETE FROM topic WHERE id=?';

    connection.query(deleteSql, [id], function(err, datas, fields){
        if(err){
            res.send('Error to delete');
        }else{
            res.redirect('/main/'+author);
        }
    })
});