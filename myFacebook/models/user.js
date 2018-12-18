var mongoose = require('mongoose')
var bcrypt = require('bcrypt')
var Schema = mongoose.Schema

var UserSchema = new Schema({
    email: {type:String, required:true, unique: true},
    nome: {type:String, required:true},
    password: {type:String, required:true},
    role: {type:String, enum:['admin','user'], required:true},
    classificadores: [String]
})

UserSchema.pre('save', async next => {
    var hash = await bcrypt.hash(this.password,10)
    this.password = hash
    next()
})

UserSchema.methods.isValidPassword = async password => {
    var compare = await bcrypt.compare(password,this.password)
    return compare
}

module.exports = mongoose.model('User',UserSchema,'users')

