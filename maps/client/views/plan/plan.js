function panToJobPlanned(jobId) {
    var job = JobsCollection.findOne(jobId);
    GoogleMaps.maps.planMap.instance.setCenter({lat: job.lat, lng: job.lng});
}

Template.planningLine.events({
    "click .delete": function () {
        Meteor.call("deleteJob", this._id);
    },
    "click .panTo": function () {
        panToJobPlanned(this._id);
    },
    "blur .nr": function (event) {
        var nr = event.target.value;
        Meteor.call("setNr", this._id, nr);
    },
    "blur .address": function (event) {
        var address = event.target.value;
        Meteor.call("setAddress", this._id, address);
    },
    "blur .description": function (event) {
        var description = event.target.value;
        Meteor.call("setDescription", this._id, description);
    },
    "click .status": function () {
        Meteor.call("statusClick", this._id, this.status);
    }
});