var User = require('../models/user')

module.exports.contar = () => {
    return User.countDocuments().exec()
}

//Consultar um utilizador pelo seu email
module.exports.consultaEmail = email => {
    return User.findOne({email: email}).exec()
}

//Consultar favoritos pelo seu email
module.exports.consultaFavoritos = (emailUser,emailFav) => {
    return User.findOne({
                    email: emailUser,
                    favoritos:{$elemMatch:{email:emailFav}}
                },
                {_id:false,favoritos:true})
                .exec()
}

//Consultar utilizadores que tenham um dado nome
module.exports.consultaNome = nome => {
    return User.find({nome:nome}).sort({nome: -1}).exec()
}

//Registar um utilizador
module.exports.inserir = user => {
    return User.create(user)
}

//Atualizar dados de utilizador
module.exports.atualizarDados = (email,user) => {
    return User.update({email: email},user)
}

module.exports.atualizarPassword = (email,newPass) => {
    return User.findOne({email: email},(err,doc) => {
        doc.password = newPass
        doc.save()
    })
}

module.exports.adicionarFavorito = (email,favorito) => {
    return User.findOne({email: email},(err,doc) => {
        doc.favoritos.push(favorito)
        doc.save()
    })
}

module.exports.removerFavorito = (email,favorito) => {
    return User.update( 
                { email: email },
                { $pull: { favoritos : { email : favorito.email } } },
                { safe: true })
               .exec()
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