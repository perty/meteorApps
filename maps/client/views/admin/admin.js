
function panToJobDeleted(jobId) {
    var job = DeletedJobs.findOne(jobId);
    GoogleMaps.maps.adminMap.instance.setCenter({lat: job.lat, lng: job.lng});
}

Template.deletedJobLine.events({
    "click .panTo": function () {
        panToJobDeleted(this._id);
    },
    "click .restore": function () {
        Meteor.call("restoreJob", this._id);
    }
});

