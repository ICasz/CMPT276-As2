const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

const { Pool } = require('pg');
var pool;
pool = new Pool({
  connectionString: process.env.DATABASE_URL
  ssl: {
    rejectUnauthorized: false;
  }
});

 var app = express()
  app.use(express.json());
  app.use(express.urlencoded({extended: false}));
  app.use(express.static(path.join(__dirname, 'public')));
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'ejs');

  app.get('/', (req, res) => res.render('pages/index'))

  app.get('/database', (req, res) => {
    var getRectanglesQuery = `SELECT * from rectangles`;
    pool.query(getRectanglesQuery, (error, result) => {
      if (error){
        res.end(error);
      }
      else {
        var results = {'rows': result.rows}
        res.render('pages/rectanglesTable', results);
      }
    })
  });

  app.get('/rectangleForm', (req, res) => {
    res.render('pages/rectangleForm');
  });

  app.post('/addRectangle', (req, res) => {
    var name = req.body.name;
    var height = req.body.height;
    var width = req.body.width;
    var color = req.body.color;
    var getRectanglesQuery = `Insert into rectangles values ('${name}', ${height}, ${width}, '${color}');`
    pool.query(getRectanglesQuery, (error, result) => {
      if (error) {
        res.end(error)
      }
      else {
        res.render('pages/rectangleForm');
      }
    });
  });

app.get('/pages/:id', (req, res) => {
  var id = req.params.id;
  var getRectanglesQuery = `select * from rectangles where id=${id};`
  // console.log(getRectanglesQuery);
  pool.query(getRectanglesQuery, (error, result) => {
    if (error){
      res.end(error);
    }
    else {
      var results =  {'rectangle' : result.rows};
      res.render('pages/rectangle', results);
    }
  })
  // console.log(id);
});

app.post('/updateRectangle', (req,res) => {
  var action = req.body.update;
  var id = req.body.id;
  if (action == "Delete Rectangle") {
    var getRectanglesQuery = `delete from rectangles where id=${id};`
    console.log(getRectanglesQuery);
    pool.query(getRectanglesQuery, (error,result) => {
      if (error){
        res.end(error);
      }
      else {
        res.redirect('/database');
      }
    });
  }
  else {
    var name = req.body.rname;
    var height = req.body.height;
    var width = req.body.width;
    var color = req.body.color;
    var getRectanglesQuery = `update rectangles set name='${name}', height=${height}, width=${width}, color='${color}' where id=${id};`
    pool.query(getRectanglesQuery, (error,result) => {
      if (error){
        res.end(error);
      }
      else {
        res.redirect(`/pages/${id}`);
      }
    });
  }
});

  // app.post('/goToRectangle', (req, res) => {
  //   console.log("Rectangle request sent!");
  //   var name = req.body.name;
  //   var getRectanglesQuery = `Select * from rectangles where name=${name};`
  //   pool.query(getRectanglesQuery (error, result) => {
  //     if (error) {
  //       res.send(error);
  //     }
  //     else {
  //       var results = {rectangle : result.collums}
  //       res.render(pages.aRectangle.ejs, results)
  //     }
  //   })
  // });

  app.use((req, res) => {
    res.status(404).render('pages/404')
  });

  app.listen(PORT, () => console.log(`Listening on ${ PORT }`));
