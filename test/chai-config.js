const chai = require('chai');
const dirty = require('dirty-chai');
/* permet d'accrocher cette fonction à tous les objets javascript */
const should = chai.should();

chai.use(dirty);

module.exports = should;
