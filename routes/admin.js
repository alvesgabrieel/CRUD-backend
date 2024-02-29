const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/Categoria");
const Categoria = mongoose.model("categorias");
require("../models/Postagem");
const Postagem = mongoose.model("postagens");
const { eAdmin } = require("../helpers/eAdmin");

// Definindo as rotas
router.get("/", eAdmin, (req, res) => {
  res.render("admin/index");
});

router.get("/posts", eAdmin, (req, res) => {
  res.send("pagina de posts");
});

router.get("/categorias", eAdmin, (req, res) => {
  Categoria.find()
    .sort({ date: "desc" })
    .then((categorias) => {
      res.render("admin/categorias", { categorias: categorias });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro a listar as categorias");
      res.redirect("/admin");
    });
});

router.get("/categorias/add", eAdmin, (req, res) => {
  res.render("admin/addcategorias");
});

router.post("/categorias/nova", eAdmin, (req, res) => {
  //validar form
  let erros = [];

  if (!req.body.nome || req.body.nome == undefined || req.body.nome == null) {
    erros.push({ texto: "Nome inválido" });
  }

  if (!req.body.slug || req.body.slug == undefined || req.body.slug == null) {
    erros.push({ texto: "Slug inválido" });
  }

  if (req.body.nome.length < 2) {
    erros.push({ texto: "Nme da categoria muito pequeno" });
  }

  if (erros.length > 0) {
    res.render("admin/addcategorias", { erros: erros });
  } else {
    const novaCategoria = {
      nome: req.body.nome,
      slug: req.body.slug,
    };

    new Categoria(novaCategoria)
      .save()
      .then(() => {
        req.flash("success_msg", "Categoria criada com sucesso");
        res.redirect("/admin/categorias");
      })
      .catch((err) => {
        req.flash(
          "error_msg",
          "houve um erro ao salvar a categoria, tente novamente"
        );
        res.redirect("/admin");
      });
  }
});

router.get("/categorias/edit/:id", eAdmin, (req, res) => {
  Categoria.findOne({ _id: req.params.id })
    .then((categoria) => {
      res.render("admin/editcategorias", { categoria: categoria });
    })
    .catch((err) => {
      req.flash("error_msg", "Essa categoria não existe");
      res.redirect("/admin/categorias");
    });
});

router.post("/categorias/edit", eAdmin, (req, res) => {
  let erros = [];

  if (!req.body.nome || req.body.nome == undefined || req.body.nome == null) {
    erros.push({ texto: "Nome inválido, digite algo" });
  }

  if (!req.body.slug || req.body.slug == undefined || req.body.slug == null) {
    erros.push({ texto: "Slug inválido, digite algo" });
  }

  if (req.body.nome.length < 2) {
    erros.push({ texto: "Nome da categoria muito pequeno" });
  }

  if (erros.length > 0) {
    res.render("admin/editcategorias", { erros: erros });
  } else {
    Categoria.findOne({ _id: req.body.id })
      .then((categoria) => {
        if (
          categoria.nome !== req.body.nome ||
          categoria.slug !== req.body.slug
        ) {
          categoria.nome = req.body.nome;
          categoria.slug = req.body.slug;

          categoria
            .save()
            .then(() => {
              req.flash("success_msg", "Categoria editada com sucesso");
              res.redirect("/admin/categorias");
            })
            .catch((err) => {
              req.flash(
                "error_msg",
                "Houve um erro interno ao salvar a edição de categoria"
              );
              res.redirect("/admin/categorias");
            });
        } else {
          req.flash(
            "error_msg",
            "Você tem que alterar nome ou slug para poder salvar"
          );
          res.redirect(`/admin/categorias/edit/${categoria.id}`);
        }
      })
      .catch((erro) => {
        req.flash("error_msg", "Houve um erro ao editar a categoria");
        res.redirect("/admin/categorias");
      });
  }
});

router.post("/categorias/deletar", eAdmin, (req, res) => {
  Categoria.deleteOne({ id: req.body.id })
    .then(() => {
      req.flash("success_msg", "Categoria deletada com sucesso!");
      res.redirect("/admin/categorias");
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao deletar a categoria");
      res.redirect("/admin/categorias");
    });
});

router.get("/postagens", eAdmin, (req, res) => {
  Postagem.find()
    .populate("categoria") //nome do campo do model POSTAGEM
    .sort({ data: "desc" })
    .then((postagens) => {
      res.render("admin/postagens", { postagens: postagens });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao listar as postagens");
      res.redirect("/admin");
    });
});

router.get("/postagens/add", eAdmin, (req, res) => {
  Categoria.find()
    .then((categorias) => {
      res.render("admin/addpostagem", { category: categorias });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao carregar o formulário");
      res.redirect("/admin");
    });
});

router.post("/postagens/nova", eAdmin, (req, res) => {
  var erros = [];

  if (req.body.categoria == "0") {
    erros.push({ texto: "Categoria inválida, registre uma categoria" });
  }

  if (erros.length > 0) {
    res.render("admin/addpostagem", { erros: erros });
  } else {
    const novaPostagem = {
      titulo: req.body.titulo,
      descricao: req.body.descricao,
      conteudo: req.body.conteudo,
      categoria: req.body.categoria,
      slug: req.body.slug,
    };

    new Postagem(novaPostagem)
      .save()
      .then(() => {
        req.flash("success_msg", "Postagem criada com sucesso");
        res.redirect("/admin/postagens");
      })
      .catch((err) => {
        req.flash("error_msg", "Houve um erro ao criar a postagem");
        res.redirect("/admin/postagens");
      });
  }
});

router.post("/postagens/deletar", (req, res) => {
  Postagem.deleteOne({ id: req.body.id })
    .then(() => {
      req.flash("success_msg", "Postagem deletada com sucesso");
      res.redirect("/admin/postagens");
    })
    .catch((err) => {
      req.flash("error_msg", "Ocorreu um erro ao deletar a postagem");
      res.redirect("/admin/postagens");
    });
});

router.get("/postagens/edit/:id", eAdmin, (req, res) => {
  Postagem.findOne({ _id: req.params.id })
    .then((postagem) => {
      res.render("admin/editpostagens", { postagem: postagem });
    })
    .catch((err) => {
      req.flash("error_msg", "Ocorreu um erro ao editar postagem");
      res.redirect("/admin/postagens");
    });
});

router.post("/postagens/edit", eAdmin, (req, res) => {
  let erros = [];

  if (
    !req.body.titulo ||
    req.body.titulo == null ||
    req.body.titulo == undefined
  ) {
    erros.push({ texto: "insira um titulo válido" });
  }
  if (!req.body.slug || req.body.slug == null || req.body.slug == undefined) {
    erros.push({ texto: "insira um slug válido" });
  }
  if (
    !req.body.descricao ||
    req.body.descricao == null ||
    req.body.descricao == undefined
  ) {
    erros.push({ texto: "insira um descrição válido" });
  }
  if (
    !req.body.conteudo ||
    req.body.conteudo == null ||
    req.body.conteudo == undefined
  ) {
    erros.push({ texto: "insira um conteúdo válido" });
  }

  if (erros.length > 0) {
    res.render("admin/addpostagem", { erros: erros });
    console.log(erros);
  } else {
    Postagem.findOne({ _id: req.body.id })
      .then((postagem) => {
        postagem.titulo = req.body.titulo;
        postagem.slug = req.body.slug;
        postagem.conteudo = req.body.conteudo;
        postagem.descricao = req.body.descricao;

        postagem
          .save()
          .then(() => {
            req.flash("success_msg", "Postagem editada com sucesso");
            res.redirect("/admin/postagens");
          })
          .catch((err) => {
            req.flash("error", "Ocorreu um erro" + err);
            res.redirect("/admin/postagens");
          });
      })
      .catch((err) => {
        req.flash(
          "error_msg",
          "Ocorreu um erro ao editar a postagem, insira dados válidos"
        );
        res.redirect("/admin/postagens");
      });
  }
});

module.exports = router;
