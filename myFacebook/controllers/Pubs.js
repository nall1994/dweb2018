var Pub = require('../models/publicacao')

module.exports.consulta = seletores => {
    return Pub
        .find(seletores)
        .sort({data: -1})
        .exec()
}
