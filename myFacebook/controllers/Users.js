var User = require('../models/user')

//Consultar um utilizador pelo seu email
module.exports.consultaEmail = email => {
    return User.findOne({email: email}).exec()
}

//Consultar utilizadores que tenham um dado nome
module.exports.consultaNome = nome => {
    return User.find({nome:nome}).sort({nome: -1}).exec()
}

//Registar um utilizador
module.exports.inserir = user => {
    return User.create(user)
}


//Iniciar classificadores default
module.exports.iniciarDefault = user => {
    var classificadores = new Array()
    classificadores.push('desporto')
    classificadores.push('família')
    classificadores.push('educação')
    classificadores.push('profissional')
    classificadores.push('evento')
    classificadores.push('doméstico')
    user.classificadores = classificadores
    return user
}