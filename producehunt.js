Produce = new Mongo.Collection("Produce");
Comments = new Mongo.Collection("Comments");

function uuid() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
	    return v.toString(16);
	});
}

if (Meteor.isClient) {
	ClientID = window.localStorage.ProduceHuntClientID;
	if (!ClientID) {
		ClientID = uuid();
		window.localStorage.ProduceHuntClientID = ClientID;
	}
	
	Template.produce.helpers({
		produce: function() {
			return Produce.find({}, {sort: {points: -1, added: -1}});
		},
		showSidebar: function() {
			return !!Session.get("sidebarContent");
		},
		showSubmit: function() {
			return Session.get("sidebarContent") == "submit";
		}
	});
	
	Template.produce.events({
		'click .submitLink': function() {
			Session.set("sidebarContent", "submit");
		},
		'click #sidebarContainer': function(e) {
			if (e.currentTarget == e.target) {
				Session.set("sidebarContent", undefined);
			}
		}
	});
	
	Template.produceItem.helpers({
		pointsControlClass: function() {
			return this.upvoters.indexOf(ClientID) == -1 ? "" : "upvoted";
		}
	});
	
	Template.produceItem.events({
		'click .pointsControl': function(e) {
			if (this.upvoters.indexOf(ClientID) == -1) {
				Produce.update({_id: this._id}, {$push: {upvoters: ClientID}, $inc: {points: 1}});
			} else {
				Produce.update({_id: this._id}, {$pull: {upvoters: ClientID}, $inc: {points: -1}});
			}
			return false;
		},
		'click .produceItem': function() {
			Session.set("sidebarContent", this._id);
		}
	})
	
	Template.submit.events({
		'submit .submit': function(e) {
			e.preventDefault()
			encodeImage(e.target.image, function(imageDataUrl) {
				Produce.insert({
					name: e.target.name.value,
					tagline: e.target.tagline.value,
					imageUrl: imageDataUrl,
					added: new Date(),
					upvoters: [],
					hasFarmerComments: false,
					farmerID: ClientID,
					commentsCount: 0,
					points: 0
				});
				e.target.reset();
				Session.set("sidebarContent", undefined);
			})
			return false;
		}
	});
	
	Template.comments.helpers({
		comments: function() {
			return Comments.find({"produce": Session.get("sidebarContent")});
		},
		produce: function() {
			var produceID = Session.get("sidebarContent");
			return Produce.findOne({_id: produceID});
		}
	});
	
	Template.comments.events({
		'submit #postComment': function(event) {
			event.preventDefault();
			var produceID = Session.get("sidebarContent");
			var produce = Produce.findOne({_id: produceID});
			var isFarmer = (produce && produce.farmerID == ClientID);
			Comments.insert({
				produce: produceID,
				name: event.target.name.value,
				title: event.target.title.value,
				comment: event.target.comment.value,
				added: new Date(),
				farmer: isFarmer
			});
			var updateDict = {$inc: {commentsCount: 1}};
			if (isFarmer) {
				updateDict["$set"] = {hasFarmerComments: true};
			}
			Produce.update({_id: produceID}, updateDict);
			return false;
		}
	})
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
