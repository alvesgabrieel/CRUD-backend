const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Usuario = new Schema({
  name: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
  },
  // > Controle de acesso
  //eAdmin = 0 > Usuário normal
  //eAdmin = 1 > Usuário admin
  eAdmin: {
    type: Number,
    default: 0,
  },
  password: {
    type: String,
    require: true,
  },
});

mongoose.model("usuarios", Usuario);
