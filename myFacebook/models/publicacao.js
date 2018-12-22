var mongoose = require('mongoose')
var Schema = mongoose.Schema

var ReceitaSchema = new Schema({
    titulo: {type:String, required:true},
    textoEstruturado: {type:String, required:true}
})

var DesportivoSchema = new Schema({
    titulo: {type:String, required:true},
    atividade: {type:String, required:true},
    duracao: {type:String, required:true},
    descricao: {type:String, required:true},
    fotos: [{type:String}],
    ficheiro_gpx: {type:String}
})

var EventoSchema = new Schema({
    titulo: {type:String, required:true},
    dataEvento: {type:String, required:true},
    local: {type:String, required:true},
    convidados: [{
        nome: {type:String}
    }],
    descricao: {type:String,required:true}
})

var FormacaoSchema = new Schema({
    titulo: {type:String, required:true},
    creditacao: {type: String, required:true},
    instituicao: {type:String},
    descricao: {type:String, required:true}
})

var IdeiaSchema = new Schema({
    titulo: {type:String, required:true},
    classificadores: [{type:String}],
    descricao: {type:String, required:true}
})

var FotoInfoSchema = new Schema({
    dataFoto: {type:String, required:true},
    foto: {type:String, required:true},
    local: {type:String, required:true}
})


var AlbumSchema = new Schema({
    titulo: {type:String, required:true},
    descricao: {type:String, required:true},
    fotos: [FotoInfoSchema]
})

var EventoProfissionalSchema = new Schema({
    titulo: {type:String, required:true},
    dataEvento: {type:String, required:true},
    local:{type:String, required:true},
    oradores: [{type:String}],
    descricao: {type:String, required:true},
    ficheiros: [{type:String}]
})

var PubSchema = new Schema({
    receita: {type: ReceitaSchema, required:false},
    desportivo: {type: DesportivoSchema, required:false},
    evento: {type: EventoSchema, required:false},
    formacao: {type: FormacaoSchema, required:false},
    ideia: {type: IdeiaSchema, required:false},
    album: {type: AlbumSchema, required:false},
    eventoProfissional: {type: EventoProfissionalSchema, required:false}
})

var publicacaoSchema = new Schema({
    origin_email: {type:String, required:true},
    tipo: {type:String, required:true},
    data: {type:String, required:true},
    dados: PubSchema,
    classificacoes: [String],
    comentarios : [{
        origin_email: {type: String},
        comentario: {type: String}
    }],
    groupId: {type: String},
    isPrivate: {type:Boolean, required:true, default:true}
})

PubSchema.pre('save', next => {
    var counter = 0
    if(this.PubSchema.receita) counter++
    if(this.PubSchema.desportivo) counter++
    if(this.PubSchema.evento) counter++
    if(this.PubSchema.formacao) counter++
    if(this.PubSchema.ideia) counter++
    if(this.PubSchema.album) counter++
    if(this.PubSchema.eventoProfissional) counter++

    if(counter == 0) next(new Error('Tem que preencher um dos tipos de publicação para submeter uma publicação'))
    else if(counter > 1) next(new Error('Apenas pode preencher um tipo de publicacao'))
    else next()
})

module.exports = mongoose.model('Publicacao', publicacaoSchema,'pubs')
