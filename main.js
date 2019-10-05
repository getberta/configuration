var express = require('express'),
    app = express(),
    port = 80,
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    mode = "DEV";

app.use(bodyParser.urlencoded({
        extended: false
}));

app.use(bodyParser.json());
app.set('view engine', 'pug');
app.set('view cache', true);
app.use(express.static('public'));

mongoose.connect('mongodb://localhost:27017/berta', (err) => {
    if(err) {
        console.log('error - mongodb start!')
    } else {
        console.log('db connected with sucess!')
    }
});

var configSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    wifi_name: {
        type: String,
        required: true
    },
    wifi_password: {
        type: String,
        required: true
    },
    facebook_apikey: {
        type: String,
        required: false
    },
    google_apikey: {
        type: String,
        required: false
    },
    instagram_apikey: {
        type: String,
        required: false
    },
    twitter_apikey: {
        type: String,
        required: false
    },
    configed: {
        type: String,
        required: true
    }
});

var Config = mongoose.model('config', configSchema);

app.get('/', (req, res) => {
    res.render('home.pug');
});

app.get('/configuration', (req, res) => {
    Config.findOne({
        configed: "true"
    }, (err, config) => {
        if(err) {
            console.log(err);
            res.redirect('/');
        } else {
            if(config == null) {
                res.render('configuration.pug', {
                    nothing: true
                });
            } else {
                res.render('configuration.pug', {
                    name: config.name,
                    city: config.city,
                    email: config.email,
                    wifi_name: config.wifi_name,
                    wifi_password: config.wifi_password,
                    facebook_apikey: config.facebook_apikey,
                    google_apikey: config.google_apikey,
                    instagram_apikey: config.instagram_apikey,
                    twitter_apikey: config.twitter_apikey
                });
            }
        }
    });
});

app.post('/db/update', (req, res) => {

    var name = req.body.name;
    var city = req.body.city;
    var email = req.body.email;
    var wifi_name = req.body.wifi_name;
    var wifi_password = req.body.wifi_password;
    var facebook_apikey = req.body.facebook_apikey;
    var google_apikey = req.body.google_apikey;
    var instagram_apikey = req.body.instagram_apikey;
    var twitter_apikey = req.body.twitter_apikey;

    var updateConfig = new Config();
    updateConfig.name = name;
    updateConfig.city = city;
    updateConfig.email = email;
    updateConfig.wifi_name = wifi_name;
    updateConfig.wifi_password = wifi_password;
    updateConfig.facebook_apikey = facebook_apikey;
    updateConfig.google_apikey = google_apikey;
    updateConfig.instagram_apikey = instagram_apikey;
    updateConfig.twitter_apikey = twitter_apikey;
    updateConfig.configed = "true";

    Config.findOne({
        configed: "true"
    }, (err, config) => {
        if(err) {
            console.log(err);
            res.redirect('/configuration');
        } else {
            if(config == null) {
                updateConfig.save((err, updated) => {
                    if (err) {
                        console.log(err);
                        res.redirect('/configuration');
                    } else {
                        res.redirect('/privacy');
                    }
                }); 
            } else {
                Config.findOneAndUpdate({
                        configed: "true"
                    }, {
                        name: name,
                        city: city,
                        email: email,
                        wifi_name: wifi_name,
                        wifi_password: wifi_password,
                        facebook_apikey: facebook_apikey,
                        google_apikey: google_apikey,
                        instagram_apikey: instagram_apikey,
                        twitter_apikey: twitter_apikey
                    }, {
                        new: true
                    }, (err, updated) => {
                        if(err) {
                            console.log(err);
                        } else {
                            res.redirect('/privacy')
                        }
                    }
                )
            }
        }
    });

});

app.get('/privacy', (req, res) => {
    res.render('privacy.pug');
});

app.post('/api/conditions', (req, res) => {
    if(req.body.accept == "on") {
        res.redirect('/finish');
    } else {
        res.redirect('/privacy');
    }
});

app.get('/finish', (req, res) => {
    res.render('finish.pug');
});

app.post('/api/info', (req, res) => {

    var code = req.body.code;

    if(code == 'demoAuthCode') {
        Config.findOne({
            configed: "true"
        }, (err, config) => {
            if(err) {
                res.send('<h1>Request denied!</h1><p>Wrong auth code.</p>');
            } else {
                res.send(config);
            }
        });
    } else {
        res.send('<h1>Request denied!</h1><p>Wrong auth code.</p>');
    }

});

app.get('/*', (req, res) => {
    res.redirect('/');
});

app.listen(port, () => {
    console.log('berta config ' + mode + ' running on port ', port)
});
