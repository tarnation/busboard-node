
var mongoBroker = require('./mongobroker');
var bcrypt = require('bcrypt');

var userHelper = {

    getCredsFromReq : function( req ) {
        return {
            user : req.body.username,
            pass : req.body.password
        };
    },

    getByName : function( username, callback ) {
        mongoBroker.find( 'user', {"username" : username}, callback );
    },

    addStop : function( userId, stop, callback ) {
        console.log(typeof userId);
        userId = mongoBroker.makeId(userId);
        mongoBroker.update('user', {"_id" : userId}, {$push : {"HotStops" : stop}}, {}, callback );
    }

};
    
exports.users = {

    addStop : function (req, res) {
        var userId = req.session.authenticated;
        console.log(req.session);

        if (!userId) return res.send({"message" : 'No user.', "success" : false} );
        var HotStop = req.body;

        console.log(HotStop);

        userHelper.addStop(userId, HotStop, function(err, count) {
            if (err) throw err;

            if (count < 1) return res.send({"message": "We blew it.", "success" : false});

            res.send({"message" : 'Stop added.', "success" : true} );
        });
    },

    login : function (req, res) {
        if ( req.session.authenticated ) throw new Error( 'Already authenticated!' );
        
        var creds = userHelper.getCredsFromReq(req);
        
        userHelper.getByName( creds.user, function(err, result) {
            if (err) throw err;

            if ( result.length > 1 ) throw new Error( 'Found non-unique username: ' + creds.user );
            
            if ( result.length === 0 ) {
                return res.send( {"message" : 'User not found.', "success" : false} );
            }

            var user = result[0];

            bcrypt.compare( creds.pass, user.password, function(err, same) {
                if (err) throw err;

                req.session.authenticated = user._id;

                return res.send( {
                "success" : same, 
                "message" : same ? 'Welcome back, ' + user.username + '!'
                : 'Sorry, that password does not match that username.'
                } );
            } );
        } );
    },

    addUser : function (req, res) {

        var pass =  req.body.password,
            username = req.body.username;

        mongoBroker.find( 'user', {"username" : username}, function(err, result) {
            if (err) throw err;

            console.log( result );
            if ( result.length > 0 ) return res.send({
                "message" : "Sorry, that username is already in use.",
                "success" : false
                });

            bcrypt.hash( req.body.password, 5, function(err, hash) {
                if (err) throw err;

                var user = { 
                    'username' : username,
                    'password' : hash,
                    'joined' : new Date(),
                    'modified' : new Date(),
                    'HotStops' : []
                };

                mongoBroker.insert('user', user, function(err, result) {
                    if (err) res.send({'error' : err});

                    console.log("Added user '" + user.username +"'");
                    res.send({"success" : true});
                    
                });
            });
        });
    }
};

