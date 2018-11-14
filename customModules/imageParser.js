/* currently not in use, should resize images etc before upload to mongodb */
console.log('Hello from imageParser');
module.exports = function (options) {
    const mongoose = require('mongoose');
    const Grid = require('gridfs-stream');
    const sharp = require('sharp');
    const Busboy = require('busboy');
    const async = require('async');


    var conn;
	if(options.mongoose){
		Grid.mongo = options.mongoose.mongo;
		conn = options.mongoose.connection;
	}else{
		Grid.mongo = options.mongo;
		conn = {db:options.db};
	}

    return function (req, res, next) {
        // Check if multipart or not
        if (!req.is('multipart/form-data')) {
            next();
        }
        
        if(!req.body){ // some cases where body is not defined needs this
            req.body = {};
        }
        console.log('Got a multipart form with something in body');
        console.log(req.headers);
        let busboy = new Busboy({ headers: req.headers });
        let gfs = Grid(conn.db);

        // Sends the normal fields through without doing much so it's accesable in req.body
        console.log('gonna start look for fields');
        busboy.on('field', function (fieldname, val) {
            console.log('saving field:', fieldname, val);
            req.body[fieldname] = val;
        });
        // If it's a file, run all this fancy stuff
        console.log('gonna start look for files');
        busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
            console.log('have a file');
            // check if there actually is a filename in the incoming data
            if (filename != "") {
                console.log('Got file:', fieldname, filename, encoding, mimetype);
                // Start an async operation which saves multiple version of the image
                async.parallel({
                    medium: function(done){
                        // object which will be written to gridfs
                        let writestream = gfs.createWriteStream({
                            filename: filename,
                            metadata: {
                                userid: req.user._id,
                                mimetype: mimetype,
                                encoding: encoding,
                                size: medium
                            }
                        });
                        // starts piping the image through sharp
                        // rotate if needed, resize to max 400x400
                        // pipe the data into gridfs writestream
                        file.pipe(sharp().rotate().resize(400,400).max()).pipe(writestream)
                        .on('close', function (gridFile) {
                            console.log('Image upload medium close', Date.now());
                            return document(null, gridFile);
                        });                
                    },
                    thumb: function (done) {
                        // object which will be written to gridfs
                        let writestream = gfs.createWriteStream({
                            filename: filename,
                            metadata: {
                                userid: req.user._id,
                                mimetype: mimetype,
                                encoding: encoding,
                                size: medium
                            }
                        });
                        // starts piping the image through sharp
                        // rotate if needed, resize to max 256x256
                        // pipe the data into gridfs writestream
                        file.pipe(sharp().rotate().resize(256,256).max()).pipe(writestream)
                        .on('close', function (gridFile) {
                            console.log('Image upload thumb close', Date.now());
                            return document(null, gridFile);
                        }); 
                    },
                    mini: function (done) {
                        // object which will be written to gridfs
                        let writestream = gfs.createWriteStream({
                            filename: filename,
                            metadata: {
                                userid: req.user._id,
                                mimetype: mimetype,
                                encoding: encoding,
                                size: medium
                            }
                        });
                        // starts piping the image through sharp
                        // rotate if needed, resize to max 64x64
                        // pipe the data into gridfs writestream
                        file.pipe(sharp().rotate().resize(64,64).max()).pipe(writestream)
                        .on('close', function (gridFile) {
                            console.log('Image upload mini close', Date.now());
                            return document(null, gridFile);
                        });
                    }
                }, function (err, result) {
                    console.log('Busboy finished with images');
                    req.body._image = result;
                    next();
                });
            }
        });

        busboy.on('finish', function() {
            console.log('Done parsing form!');
            res.writeHead(303, { Connection: 'close', Location: '/' });
            res.end();
          });
    }
}