var https = require('https');
var MongoClient = require('mongodb').MongoClient;

var mongoUrl = 'mongodb://localhost:3001/meteor';
var redditUrl = 'https://www.reddit.com/r/malefashion/new.json?sort=new';

MongoClient.connect(mongoUrl, function(err, db) {
    var pictures = db.collection('pictures');

    https.get(redditUrl, function(res){
        var body = '';

        res.on('data', function(chunk){
            body += chunk;
        });

        res.on('end', function(){
            var redditResponse = JSON.parse(body);
            pictures.insertMany(getAllPictures(redditResponse), function(err, results) {
                process.exit();
            });
        });
    }).on('error', function(e){
        console.log("Got an error: ", e);
    });
});

function getAllPictures(redditResponse) {
    return redditResponse.data.children.reduce((arr, post) => {
            if ('preview' in post.data) {
        post.data.preview.images.forEach(image => {
            let pic = image.source;
        pic.created = post.data.created;
        arr.push(pic);
        return arr;
    });
    }
    return arr;
}, []);
}