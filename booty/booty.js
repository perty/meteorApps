articles = new Mongo.Collection("articles");

if (Meteor.isClient) {
    Meteor.subscribe("articles");
    Template.body.helpers({
        articles: function () {
            return articles.find();
        }
    });

    Template.article.helpers({
            doSave: function () {
                console.log("Called doSave");
                var self = this;
                return function (e, editor) {
                    // Get edited HTML from Froala-Editor
                    var newHTML = editor.getHTML();
                    console.log("Something going on '" + newHTML + "'");
                    // Do something to update the edited value provided by the Froala-Editor plugin, if it has changed:
                    if (!_.isEqual(newHTML, self.articleContents)) {
                        console.log("onSave HTML is :" + newHTML);
                        articles.update({_id: self._id}, {
                            $set: {articleContents: newHTML}
                        });
                    }
                    return false; // Stop Froala Editor from POSTing to the Save URL
                }
            }
        }
    );

    Template.article.events({
        'xxx' : function(){
            console.log("The event");
        }
    });

    Template.article.created = function() {
        var self = Template.currentData();
        $('.summernote').summernote({
            onChange: function(contents, $editable) {
                console.log('onChange:');
            }
        });
    }

    // counter starts at 0
    Session.setDefault('counter', 0);

    Template.command.helpers({
        counter: function () {
            return Session.get('counter');
        }
    });

    Template.command.events({
        'click button': function () {
            articles.insert({articleContents: ""});
            // increment the counter when button is clicked
            Session.set('counter', Session.get('counter') + 1);
        }
    });
}

if (Meteor.isServer) {
    Meteor.startup(function () {
        // code to run on server at startup
    });
}
