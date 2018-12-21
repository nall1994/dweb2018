var Group = require('../models/group')

module.exports.consultar = email => {
    return Group
            .find({'membros.username': email},{nome})
            .exec()    
}