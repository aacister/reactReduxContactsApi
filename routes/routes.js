var express = require('express');
var router = express.Router();
var cors = require('cors');
var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var Contact = mongoose.model('Contact');
var Hobby = mongoose.model('Hobby');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express for React Contacts' });
});

router.param('contact', function(req, res, next, id){
	var query = Contact.findById(id);

	query.exec(function(err, contact){
		if(err){
			return next(err);
		}
		if(!contact){
			return next(null);
		}

		req.contact = contact;
		return next();
   	});
});

//Get all contacts
router.get('/api/contacts/', (req, res, next) => {

  Contact.find().deepPopulate(['hobbies']).exec(function(err, contacts){
      if(err){
        return next(err);
      }
      res.json(contacts);
    })
});

//Get all hobbies
router.get('/api/hobbies',  (req, res, next) => {
  Hobby.find().exec(function(err, hobbies){
    if(err){
      return next(err);
    }
    res.json(hobbies);
  });
});

//Get contact by id
router.get('/api/contacts/:contact', function(req, res, next) {
  Contact.findById(req.params.contact, function(err, contact){
  	if(err){
		return next(err);
	}
	res.json(contact);
});

});

//Add contact
router.post('/api/contacts/', (req, res, next) =>{

  var contact = new Contact();
	contact.first_name = req.body.contact.first_name;
	contact.last_name = req.body.contact.last_name;
	contact.email = req.body.contact.email;

  let hobbies = [];

    req.body.contact.hobbies.forEach(hobby => {
      hobbies.push(Hobby.findById(hobby._id));
  });

Promise.all(hobbies).then((hobbies) => {
  contact.hobbies = hobbies;
  return contact.save().then(() =>{
    return res.json(contact);
  })
});

});



//Edit contact
router.put('/api/contacts/:contact', (req, res, next)=>{
	Contact.findById(req.params.contact).then(function(contact){
	if(!contact){ return res.sendStatus(401);}

	if(typeof req.body.contact.first_name !== 'undefined'){
		contact.first_name = req.body.contact.first_name;
	}
	if(typeof req.body.contact.last_name !== 'undefined'){
		contact.last_name = req.body.contact.last_name;
	}
	if(typeof req.body.contact.email !== 'undefined'){
		contact.email = req.body.contact.email;
	}
      let hobbies = [];

        req.body.contact.hobbies.forEach(hobby => {
          hobbies.push(Hobby.findById(hobby._id));
      });

    Promise.all(hobbies).then((hobbies) => {
      contact.hobbies = hobbies;
      return contact.save().then(function(){
        return res.json(contact);
      });
    });

     }).catch(next);
});

function fillContactHobbies(contact, hobbies){
  return new Promise(resolve => {
  let contactHobbies = [];
  hobbies.map(hobby => {
    Hobby.findById(hobby._id).then(function(h){
      contactHobbies.push(h);
  });
});
  resolve(contactHobbies);
});
}

router.delete('/api/contacts/:contact', (req, res, next)=>{
	Contact.findById(req.body.id).then(function(){
		return req.contact.remove().then(function(){
			return res.sendStatus(204);
		});
	});
});


module.exports = router;
