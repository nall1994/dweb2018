var Group = require('../models/group');

// Obtenção da lista dos grupos de um dado utilizador (identificado pelo email).
module.exports.listaGrupos = email => {
    return Group
        .find({ 'membros': email })
        .sort({ nome: 1 })
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

module.exports.atualizar = group => {
    return Group.updateOne({ _id: group._id }, group)
}

// Registo de um grupo.
module.exports.inserir = group => {
    return Group
        .create(group);
};

module.exports.obterGrupo = id => {
    return Group
        .find({ _id: id })
        .exec()
}

module.exports.removeMembro = (id, email) => {
    return Group
        .update({ _id: id }, { $pull: { membros: email } });
}

module.exports.addMembro = (id, email) => {
    return Group
        .update({ _id: id }, { $push: { membros: email } });
}