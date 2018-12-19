var mongoose = require('mongoose')
var Schema = mongoose.Schema
var bcrypt = require('bcrypt')

var UserSchema = new Schema({
    email: {type:String, required:true, unique: true},
    nome: {type:String, required:true},
    password: {type:String, required:true},
    role: {type:String, enum:['admin','user'], required:true},
    classificadores: [String]
})

//Método de validação da password
UserSchema.methods.isValidPassword = async function(password) {
    var compare = await bcrypt.compare(password,this.password)
    return compare
}

module.exports = mongoose.model('User',UserSchema,'users')

