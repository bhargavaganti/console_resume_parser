const parseIt = require('./utils/parseIt');
var logger = require('tracer').colorConsole();
var request = require("request");

module.exports.parseResumeFile = function(inputFile, outputDir) {
  return new Promise((resolve, reject) => {
    parseIt.parseResumeFile(inputFile, outputDir, function(file, error) {
      if (error) {
        return reject(error);
      }
      return resolve(file);
    });
  });
};

module.exports.parseResumeUrl = function(url) {
  return new Promise((resolve, reject) => {
    parseIt.parseResumeUrl(url, function(file, error) {
      if (error) {
        return reject(error);
      }
      return resolve(file);
    });
  });
};

module.exports.postData = function(email,public_url,file_tosend, json_file) {
  console.log("email:"+email+"\nurl:"+public_url+"\nfilepath:"+file_tosend+"\njsonpath:"+ json_file);
  if(email!=undefined){
  var name   = email.substring(0, email.lastIndexOf("@"));
  // Setting Formdata for request
  const formData = {
      'Resume[]': fs.createReadStream(file_tosend),
      'model': JSON.stringify(
       {Email : email,
        ConfirmEmail : email, 
        FirstName : name,
        LastName : name}
      )
  };
  // Return new promise 
  return new Promise(function(resolve, reject) {
    // Do async job
      request.post({url:public_url, formData: formData}, function(err, resp, body) {
          if ((err) || resp.statusCode!=200) 
          {
              reject(err);
          } 
          else 
          {   
              resolve(JSON.parse(body));
          }       
      })
  })
}
else {
  console.log("email not available");
  fs.unlink(file_tosend,function(err){
      if(err) return console.log(err);
      console.log('file deleted successfully'+file_tosend);
    });  
    fs.unlink(json_file,function(err){
      if(err) return console.log(err);
      console.log('file deleted successfully'+ json_file);
    });

    logger_error.error("email does not exist, so deleted:"+file_tosend+"json file:"+json_file);
    return reject("already available");
  }
}
