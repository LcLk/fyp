var fs = require('fs');
var sys = require('sys');
var mongoose = require('mongoose');

//a schema describes the details of the object, including methods and variables:
//var mySchema = mongoose.Schema({...});
//For the tissue data I only need variables so the schema will be a parsed JS object.
//This then needs to be parsed as a model witha  given name:
//mySchemaVar = mongoose.model('mySchemaName', mySchema);


//to hold debye data by Finn Krewer
var krewerSchema = mongoose.Schema({
    name: {type: String, required: true,unique: true},
    poles_available: [Number], /*Array listing which numbers of poles can be calculated*/
    pole_sets: [{const_p: Number, const_c: Number, poles: [ {dp: Number, dc: Number} ] }],
 });
Krewer = mongoose.model('Krewer', krewerSchema);


//to hold Cole-Cole data by Gabriel
var gabrielSchema = mongoose.Schema({
    name: {type: String, required: true,unique: true},
    poles_available: [Number], /*Array listing which numbers of poles can be calculated, will always be 4 for gabriel data*/
	poles: {ef: Number, sig: Number, poles: [ {del: Number, tau: Number, alf: Number} ] }
 });
Gabriel = mongoose.model('Gabriel', gabrielSchema);



//export created models for use by the server
module.exports.Krewer = Krewer;
module.exports.Gabriel = Gabriel;