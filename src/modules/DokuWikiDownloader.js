var DokuWikiDownloader = function(fs) {
    "use strict";
    /* eslint-env node */

    var request = require("request");
    var cookieJar;


    function download(file, success, error) {
        if(file.type === "pdf") {
            file.url = file.url + "?do=export_pdf";
        }
        if(cookieJar === undefined) {
            error({error: "Not logged in. Can not send request"});
            return;
        }
        request.get({
            uri: file.url,
            jar: cookieJar,
            method: "GET",
            rejectUnauthorized: false
        }).pipe(fs.createWriteStream(file.filename)).on("close", function() {
            console.log("Did download: " + file.url);
            success();
        });
    }

    function login(wiki, success) {
        cookieJar = request.jar();
        request.get({
            uri: wiki.url + "?do=login&u=" + wiki.user + "&p=" + wiki.password,
            jar: cookieJar,
            method: "GET",
            rejectUnauthorized: false
        }, function() {
            success();
        });
    }

    return {
        download: download,
        login: login
    };

};

module.exports = DokuWikiDownloader;
