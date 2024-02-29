const localStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

//Model de usuario
require("../models/Usuario");
const Usuario = mongoose.model("usuarios");

module.exports = (passport) => {
  passport.use(
    new localStrategy(
      { usernameField: "email", passwordField: "senha" },
      (email, senha, done) => {
        Usuario.findOne({ email: email }).then((usuario) => {
          if (!usuario) {
            return done(null, false, { message: "Esta conta não existe" });
          }

          bcrypt.compare(senha, usuario.password, (erro, batem) => {
            if (batem) {
              return done(null, usuario);
            } else {
              return done(null, false, { message: "Senha incorreta" });
            }
          });
        });
      }
    )
  );

  //Quando o usuario logar no meu site, seus dados serão salvos em uma sessão
  passport.serializeUser((usuario, done) => {
    done(null, usuario._id);
  });

  passport.deserializeUser((id, done) => {
    Usuario.findById(id)
      .lean()
      .then((usuario) => {
        done(null, usuario);
      })
      .catch((err) => {
        done(null, false, { message: "algo deu errado" });
      });
  });
};
