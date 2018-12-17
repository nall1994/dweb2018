var mongoose = require('mongoose')
var Schema = mongoose.Schema

var GroupSchema = new Schema({
    membros: [{
        username: {type:String, required:true},
        groupRole: {type:String, required:true}
    }],
    descricao: {type:String, required:true},
    isPrivate: {type:Boolean, required:true, default: true},
    fotosGrupo: [String]
})

module.exports = mongoose.model('Group',GroupSchema,'groups')