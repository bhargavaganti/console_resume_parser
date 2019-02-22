var request = require('request');
var cheerio = require('cheerio');
var _ = require('underscore');

module.exports = {
  regular: {
    name: [/([A-Z][a-z]*)(\s[A-Z][a-z]*)/],
    email: [/([A-Za-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})/],
    phone: [/((?:\+?\d{1,3}[\s-])?\(?\d{2,3}\)?[\s.-]?\d{3}[\s.-]\d{4,5})/],
  },
};

// helper method
function download(url, callback) {
  request(url, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      callback(body);
    } else {
      callback(null, error);
    }
  });
}
