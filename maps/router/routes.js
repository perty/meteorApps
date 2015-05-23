Iron.utils.debug = true;
DeletedJobs = new Mongo.Collection('deletedJobs');
JobsCollection = new Mongo.Collection('markers');

Router.route('/', function () {
    this.render('hello', {
        data: function () {
            return {
                jobs: JobsCollection.find({status: {$in: ["accepterad", "påbörjat", "klart"]}}, {sort: {nr: 1}})
            }
        }
    });
});
Router.route('/plan', function () {
    this.render('plan', {
        data: function () {
            return {
                jobs: JobsCollection.find({}, {sort: {nr: 1}})
            }
        }
    });
});

Router.route('/admin', function () {
    this.render('admin', {
        data: function () {
            return {
                jobs: DeletedJobs.find({}, {sort: {deletedDate: -1}})
            }
        }
    });
});

Router.route('/about', function () {
    this.render('about');
});
