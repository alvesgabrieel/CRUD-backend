//verificar se o usuario esta autenticado e se ele é um admin

module.exports = {
  eAdmin: (req, res, next) => {
    if (req.isAuthenticated() && req.user.eAdmin == 1) {
      return next();
    }

    req.flash(
      "error_msg",
      "Você precisa ser um administrador para acessar aqui"
    );
    res.redirect("/");
  },
};
