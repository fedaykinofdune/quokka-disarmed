var createCounter = function(theNum, totalTime, callback) {
  var interval = totalTime / 20;
  var intervalId;
  var firstStep = 0;
  var lastStep = 20;

  var f = function () {
    var randNum = Math.round(Math.random() * 100);
    $luckyNum.text(randNum);
    if (firstStep === lastStep) {
      $luckyNum.text(theNum);
      clearInterval(intervalId);
      if (callback) callback();
    }
    ++firstStep;
  };

  intervalId = setInterval(f, interval);
};


var createBackToGameTimer = function(totalTime) { 
  var interval = totalTime / 10;
  var intervalId;
  var firstStep = 10;
  var lastStep = 0;

  var f = function () {
    $timer.text("Back to game in: " + firstStep);
    if (firstStep === lastStep) {
      clearInterval(intervalId);
    }
    --firstStep;
  };

  intervalId = setInterval(f, interval);
};


Template.personalResults.rendered = function(){
  $luckyNum = $(this.find("#lucky-num"));
  $timer = $(this.find("#timer-back-to-game"));
  createBackToGameTimer(BTO.TIMER_BACKTOGAME);
};


Template.personalResults.helpers({
  backToGameTimer: function(remainingTime){
    return remainingTime;
  },
  results: function(){
    var lastGame = Collections.Games.findOne({completed: true}, {sort: {completedAt: -1}}); // to retrieve lucky num and publicSeq
    var personalResult, hasWon;

    createCounter(lastGame.luckyNum , BTO.TIMER_ROLL_DURATION, function () {
      $luckyNum.addClass("pulsate");
    });

    if(!Meteor.userId()) return { publicSeq: lastGame.publicSeq }; // observers only see publicSeq and luckyNum

    personalResult = Collections.GameResults.findOne({ playerId: Meteor.userId() });

    if (!personalResult) return { publicSeq: lastGame.publicSeq };

    if (personalResult.won < 0) {
      hasWon = false;
    } else {
      hasWon = true;
    }

    return {
      extendedResultInfo: true,
      hasWon: hasWon,
      outcome: intToBtc(Math.abs(personalResult.won)), // won can be negative!
      publicSeq: lastGame.publicSeq,
      stake: personalResult.stake,
      payout: personalResult.payout
    };
  }
});


Template.personalResults.events({
  "click #skipBtn": function(e){
    e.preventDefault();
    Session.set("displayResults", false);
  }
});