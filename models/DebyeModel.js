
var mongoose = require('mongoose');

//a schema describes the details of the object, including methods and variables.
var debyeSchema = mongoose.Schema({
    name: String,
    tissuetype: String,
    pole: [{constants:{permitivity: Number, conductivity: Number}, poles: [{ delta_permitivity: Number, delta_time: Number}]}],
    calculated: [{frequency: Number,conductivity: Number,relative_permitivity: Number, loss_tangent: Number, wavelength: Number, penetration_depth: Number}]
 });
//Global object to create new models
Debye = mongoose.model('Debye', debyeSchema);
module.exports = Debye;
