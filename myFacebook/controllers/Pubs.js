var Pub = require('../models/publicacao')

module.exports.consulta = seletores => {
    return Pub
        .find(seletores)
        .sort({data: -1})
        .exec()
}
module.exports.consultaTodas = () => {
    return Pub
        .find()
        .sort({data: -1})
        .exec()
}

module.exports.consultaID = idpub => {
    return Pub
        .findOne({_id: idpub})
        .exec()
}

//Insere comentario
module.exports.inserirComentario = (comment,id) => {
    console.log("Controler");
    console.log(comment);
    console.log(id);
    
    
    return Pub
        .findOne(
            {
                _id:id
            },(err,pub) =>{
                pub.comentarios.push(comment)
                pub.save()
            })
        .exec()
}

//Registar publicação
module.exports.inserir = pub => {
    return Pub.create(pub)
}

module.exports.atualizar = (id,pub) => {
    return Pub.updateOne({_id:id},pub)
}
