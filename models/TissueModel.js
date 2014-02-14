var fs = require('fs');
var sys = require('sys');
var mongoose = require('mongoose');

//a schema describes the details of the object, including methods and variables.
var tissueSchema = mongoose.Schema({
    name: String,
    poles: [Number],
    debye: [{const_p: Number, const_c: Number, poles: [ {dp: Number, dc: Number} ] }],
    cole: {ef: Number, sig: Number, poles: [ {del: Number, tau: Number, alf: Number} ] }
 });
//Global object to create new models
Tissue = mongoose.model('Tissue', tissueSchema);



module.exports = Tissue;