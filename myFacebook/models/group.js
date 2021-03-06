var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var GroupSchema = new Schema({
    nome: { type: String, required: true },
    descricao: { type: String, required: true },
    fotoGrupo: { type: String},
    membros: [String],
    admin: { type: String, required: true }
});

module.exports = mongoose.model('Group', GroupSchema, 'groups');