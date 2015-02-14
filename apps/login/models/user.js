
module.export = function(mongoose) {

  var Schema = mongoose.Schema;

  var UserShema = new Schema({
    id: String,
    login_type: String,
    pasword_crypted: String
  
  
  });


  mongoose.model('User', UserSchema);
  

};


