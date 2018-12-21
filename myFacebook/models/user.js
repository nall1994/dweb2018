var mongoose = require('mongoose')
var Schema = mongoose.Schema
var bcrypt = require('bcrypt')

var UserSchema = new Schema({
    email: {type:String, required:true, unique: true},
    profissao: {type: String},
    instituicao: {type:String},
    nome: {type:String, required:true},
    password: {type:String, required:true},
    foto: {type:String},
    morada: {type:String},
    role: {type:String, enum:['admin','user'], required:true},
    classificadores: [String],
    favoritos:[{type:String}],
    dataAniversario: {type:String}
})

//Método de validação da password
UserSchema.methods.isValidPassword = async function(password) {
    var compare = await bcrypt.compare(password,this.password)
    return compare
}

module.exports = mongoose.model('User',UserSchema,'users')

