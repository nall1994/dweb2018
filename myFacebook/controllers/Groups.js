var Group = require('../models/group');

// Obtenção da lista dos grupos de um dado utilizador (identificado pelo email).
module.exports.listaGrupos = email => {
    return Group
        .find({ 'membros': email })
        .sort({nome: 1})
        .exec()
};

// Contagem do número de grupos registados.
module.exports.contar = () => {
    return Group.countDocuments().exec()
}

module.exports.importar = groupsArray => {
    return Group.insertMany(groupsArray)
}

module.exports.listarTodos = () => {
    return Group.find().exec()
}

// Registo de um grupo.
module.exports.inserir = group => {
    return Group
        .create(group);
};