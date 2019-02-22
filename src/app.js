const ResumeParser = require('./index.js');
var fs = require('fs');
var request = require("request");
const log4js = require('log4js');
//set variables in env.json
var debug = true;
log4js.configure({
    appenders: { resume: { type: 'file', filename: 'upload.log' } },
    categories: { default: { appenders: ['resume'], level: 'info' } },
    appenders: { email: { type: 'file', filename: 'upload_email.log' } },
    categories: { default: { appenders: ['email'], level: 'error' } }
});
const logger_info = log4js.getLogger('resume');
const logger_error = log4js.getLogger('email');
if (!debug) {
    console.log = function () { };
}

var main = function () {
    const path = readEnv(__dirname + '/env.json');
    console.log(path.src);
    fs.readdir(path.src, function (err, files) {
        for (var i = 0; i < files.length; i++) {
            var filePath = path.src + '/' + files[i];
            flowControl = readEnv(__dirname + '/flow_control.json');
            if (flowControl.terminate != "yes" && flowControl.send_url == "yes") {
                parse(filePath, path.dest, path.url);
            }
            else {
                console.log("bye bye! check your terminate in flow_control.json!");
                break;
            }
        }
    });
}

function parse(filePath, dest, url) {
    ResumeParser.parseResumeFile(filePath, dest)
        .then(file => {
            jsonContent = readEnv(dest + "/" + file + ".json");
            if ("email" in jsonContent) {
                var postPromise = postData(jsonContent.email, filePath, url);
                postPromise.then(function (result) {
                    if (result.Status == "true") {
                        deleteFile(filePath);
                        deleteFile(contentPath);
                        logger_info.info("uploaded successfully and deleted file:" + filePath + ":" + contentPath + " status:" + result.Status);
                    }
                    else {
                        console.log("already uploaded");
                        deleteFile(filePath);
                        deleteFile(contentPath);
                        logger_error.error("File already uploaded, so deleted:" + filePath + "json file:" + contentPath);
                    }
                }, function (err) {
                    console.log(err);
                })
            }
            else {
                deleteFile(filePath);
                deleteFile(contentPath);
                logger_error.error("email does not exist, so deleted:" + filePath + "json file:" + contentPath);
            }
        })
        .catch(error => {
            console.log(error);
        })
}
//To read json data from file 
function readEnv(path) {
    data = fs.readFileSync(path);
    jsonData = JSON.parse(data);
    return jsonData
}
//To delete file
function deleteFile(file) {
    fs.unlink(file, function (err) {
        if (err) return console.log(err);
        console.log('file deleted successfully' + file);
    });
}
//To post data
 
function postData(email, fileToSend, publicUrl) {
    var name = email.substring(0, email.lastIndexOf("@"));
    // Setting Formdata for request
    const formData = {
        'Resume[]': fs.createReadStream(fileToSend),
        'model': JSON.stringify(
            {
                Email: email,
                ConfirmEmail: email,
                FirstName: name,
                LastName: name
            }
        )
    };
    // Return new promise 
    return new Promise(function (resolve, reject) {
        // Do async job
        request.post({ url: publicUrl, formData: formData }, function (err, resp, body) {
            if ((err) || resp.statusCode != 200) {
                reject(err);
            }
            else {
                resolve(JSON.parse(body));
            }
        })
    })
}

if (require.main === module) {
    main();
}
