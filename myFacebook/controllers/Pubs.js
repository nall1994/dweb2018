var Pub = require('../models/publicacao')

module.exports.consulta = seletores => {
    return Pub
        .find(seletores)
        .sort({data: 1})
        .exec()
}
module.exports.consultaTodas = () => {
    return Pub
        .find()
        .sort({data: 1})
        .exec()
}
//Registar publicação
module.exports.inserir = pub => {
    return Pub.create(pub)
}
