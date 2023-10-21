const express = require("express");
const router = express.Router();
const Category = require("../categories/Category");
const Article = require("./Article");
const slugify = require("slugify");
const cheerio = require('cheerio');



router.get("/admin/articles", (req, res) =>{
    res.send("Rota de artigos");
});


router.get("/admin/articles/new", (req, res) => {
    Category.findAll().then(categories => {
        res.render("admin/articles/new", {categories: categories});
    });
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
module.exports = router;