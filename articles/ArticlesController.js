const express = require("express");
const router = express.Router();
const Category = require("../categories/Category");
const Article = require("./Article");
const slugify = require("slugify");
const cheerio = require('cheerio');



router.get("/admin/articles", (req, res) =>{
    Article.findAll({
        //Join no sequelize
        include: [{model: Category}]
    }).then(articles => {
        res.render("admin/articles/index", {articles:articles})
    })
});


router.get("/admin/articles/new", (req, res) => {
    Category.findAll().then(categories => {
        res.render("admin/articles/new", {categories: categories});
    });
});


router.post("/articles/delete", (req,res) => {
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


router.post("/articles/save" , (req, res) => {
    var title = req.body.title;
    
    // Extrai o texto dentro das tags <p>
    var body = req.body.body;
    var content = cheerio.load(body);
    var bodyText = content('p').text(); 
    // Extrai o texto dentro das tags <p>

    var category = req.body.category;

    console.log(title);
    console.log(bodyText);
    console.log(category);

    Article.create({
        title: title,
        slug: slugify(title),
        body: bodyText,
        categoryId: category
    }).then(() => {
        res.redirect("/admin/articles");
    });

});



router.get("/:slug", (req, res) => {
    var slug = req.params.slug;

    Article.findOne({
        where:
            {
                slug: slug
            }
    }).then(article  => {
        if(article != undefined){
            res.render("article", {article:article});
        }else{
            res.redirect("/");
        }
    }).catch(error => {
        res.redirect("/");
    });
});
module.exports = router;