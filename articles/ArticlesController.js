const express = require("express");
const router = express.Router();
const Category = require("../categories/Category");
const Article = require("./Article");
const slugify = require("slugify");
const cheerio = require('cheerio');
const adminAuth = require("../middlewares/adminAuth");


router.get("/admin/articles", adminAuth,  (req, res) =>{
    Article.findAll({
        //Join no sequelize
        include: [{model: Category}]
    }).then(articles => {
        res.render("admin/articles/index", {articles:articles})
    })
});


router.get("/admin/articles/new", adminAuth, (req, res) => {
    Category.findAll().then(categories => {
        res.render("admin/articles/new", {categories: categories});
    });
});


router.post("/articles/delete", adminAuth, (req,res) => {
    var id = req.body.id;

    if(id != undefined)
    {
        if(!isNaN(id))
        {
            Article.destroy
            ({
                where:
                {
                    id:id
                }
            }).then(() => {
                res.redirect("/admin/articles");
            });
        } 
        else{ //Senão for um número
            res.redirect("/admin/articles");
        }
    }
    else{ //Se for nulo
        res.redirect("/admin/articles");
    }
});

router.get("/admin/articles/edit/:id", adminAuth, (req, res) => {
    var id = req.params.id;
    
    console.log(id);

    if(isNaN(id)) res.redirect("/admin/articles");

    Article
    .findByPk(id)
    .then(article => 
    {
        if(article != undefined)
        {
            Category.findAll().then(categories => {
                res.render("admin/articles/edit", {article: article, categories: categories});

            })
        }
        else res.redirect("/");
    }).catch(erro => {
        res.redirect("/");           
    });
});

router.post("/articles/update", adminAuth, (req,res) => {
    var id = req.body.id;
    var title = req.body.title;

    // Extrai o texto dentro das tags <p>
    var body = req.body.body;
    var content = cheerio.load(body);
    var bodyText = content('p').text(); 
    // Extrai o texto dentro das tags <p>


    var category = req.body.category;

    Article.update({

        title: title, 
        body: bodyText,
        categoryId: category,
        slug: slugify(title)
    }, 
    {
        where: 
        {
            id:id
        }
    }).then(() => {
        res.redirect("/admin/articles");
    }).catch(erro =>{
        res.redirect("/");
    });
});




router.post("/articles/save" , adminAuth, (req, res) => {
    var title = req.body.title;
    
    // Extrai o texto dentro das tags <p>
    var body = req.body.body;
    var content = cheerio.load(body);
    var bodyText = content('p').text(); 
    // Extrai o texto dentro das tags <p>

    var category = req.body.category;


    Article.create({
        title: title,
        slug: slugify(title),
        body: bodyText,
        categoryId: category
    }).then(() => {
        res.redirect("/admin/articles");
    });

});

router.get("/articles/page/:num", (req, res) => {
    var page = req.params.num;
    var offset = 0;

    if(isNaN(page) || page == 1) {
        offset = 0;
    } else { 
        offset = (parseInt(page) - 1) * 4;
    }

    Article
        .findAndCountAll({
            limit: 4,
            offset: offset,
            order: [
                ['id', 'DESC']
            ]
        }).then(articles => {
            var next;


            console.log(offset);
            console.log(articles.count);
            if(offset + 4 >= articles.count) 
            {
                next = false;
                console.log(offset);
                console.log(articles.count);
            } else {
                next = true;
            }
            var result = {
                page: parseInt(page),
                next: next,
                articles: articles
            }

            Category.findAll().then(categories => {
                res.render("admin/articles/page", {result: result, categories: categories})
            })
        })
});

module.exports = router;