var request = require('request-promise');
var moment = require('moment');
var login = require("facebook-chat-api");

// facebook email/password
var facebook = {
    'email':'example.mail.com',
    'password':'password'
};

// facebook id for send message
var facebookId = {
    'example':"1000000000000000"
};

var git = {
    'token':'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    'owner':'example',
    'repo':'Example',
    'link':'https://github.com/example/Example/'
};

var github = {
    getEvent: function() {
        return request({
            "method":"GET", 
            "uri": "https://api.github.com/repos/" + git.owner + "/" + git.repo + "/issues",
            "json": true,
            "headers": {
                "Authorization": "Bearer " + git.token,
                "User-Agent": "Userflow"
            },
            postData: {
            mimeType: 'application/x-www-form-urlencoded',
            params: [
                {
                    name: 'state',
                    value: 'open'
                },
                {
                    name: 'sort',
                    value: 'updated_at'
                }
            ]}
        });
    }
}

function event() {
    return github.getEvent();
}

event().then(function(result) {
    login(facebook, (err, api) => {
        if(err) return console.error(err);

        function sendTitle() {
            var keys = Object.keys(facebookId);
            for (var i = 0; i < keys.length; i++) {
                var msg = "แจ้งเตือนการทำงาน RED Project";
                api.sendMessage(msg, facebookId[keys[i]]);
                console.log('sent title to ' + facebookId[keys[i]]);
            }
        }

        function sendLink() {
            var keys = Object.keys(facebookId);
            for (var i = 0; i < keys.length; i++) {
                var msg = git.link;
                api.sendMessage(msg, facebookId[keys[i]]);
                console.log('sent link to ' + facebookId[keys[i]]);
            }
        }

        function sendIssues() {
            result.forEach(function(element) {
                if(element.assignees !== null) {
                    element.assignees.forEach(function(assignee) {
                        for(var key in facebookId) {
                            if(assignee.login === key) {
                                console.log('sent message to ' + facebookId[key]);
                                var msg = "issue # " + element.number + " " + element.title + "\n";
                                msg += "เริ่มไปแล้วเมื่อ : " + moment(element.created_at).format('DD-MM-YYYY');
                                api.sendMessage(msg, facebookId[key]);
                            }
                        }
                    }, this);
                }
            }, this);

            api.logout(function(err) {
                if(err) return console.error(err);
            });
        }

        setTimeout(sendTitle, 1000);
        setTimeout(sendLink, 3000);
        setTimeout(sendIssues, 5000);
    });
});