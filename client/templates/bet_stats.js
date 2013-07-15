Template.betStats.created = function(){
  Session.set("bet", { status: "new" });
};


Template.betStats.rendered = function() {
  var spinnerOpts = {
    lines: 6, // The number of lines to draw
    length: 1, // The length of each line
    width: 8, // The line thickness
    radius: 10, // The radius of the inner circle
    corners: 0, // Corner roundness (0..1)
    rotate: 0, // The rotation offset
    direction: 1, // 1: clockwise, -1: counterclockwise
    color: '#000', // #rgb or #rrggbb
    speed: 0.2, // Rounds per second
    trail: 15, // Afterglow percentage
    shadow: false, // Whether to render a shadow
    hwaccel: true, // Whether to use hardware acceleration
    className: 'spinner', // The CSS class to assign to the spinner
    zIndex: 2e9, // The z-index (defaults to 2000000000)
    top: '10', // Top position relative to parent in px
    left: 'auto', // center horizontally
    position: 'relative'  // element position
  };
  var spinnerTarget = document.getElementById('waiting-spinner');
  var spinner = new Spinner(spinnerOpts).spin(spinnerTarget);
}


Template.betStats.helpers({
  playing: function(){
    return !!(Meteor.user() && Collections.Bets.findOne({playerId: Meteor.userId()}));
  },
  activeBet: function(){
    var activeBet = Meteor.user() && Collections.Bets.findOne({playerId: Meteor.userId()});
    var currentGame = Collections.Games.findOne({completed: false});
    var allBets = Collections.Bets.find({gameId: currentGame._id}).fetch();
    var betAggregates = (new Quokka(allBets)).getBetStats(Meteor.userId()); 

    returnVal = {};
    if(activeBet){
      if(allBets.length > 1) {
        _.extend(returnVal, {
          maxToWin: intToBtc(betAggregates.maxToWin),
          maxToLose: intToBtc(betAggregates.maxToLose),
          chanceToWin: betAggregates.chanceToWin
        });
      }
      return _.extend(returnVal, {
        amountBtc: intToBtc(activeBet.amount),
        rangeMin: activeBet.rangeMin,
        rangeMax: activeBet.rangeMax
      });
    }
  }
});




