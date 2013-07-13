var $betSlider;
var $betGraph;

var windowLoaded = false;
var templateRendered = false;

var initBetSlider = function(){
  if($betSlider.data("uiRangeSlider")){
    $betSlider.rangeSlider("resize");
  }else{
    $betSlider.rangeSlider({
      bounds:{min:1, max: 100},
      step: 1
    }).on("userValuesChanged", function(){
      // likely unnecessary but just in case...
      if ($betSlider.rangeSlider("values").min <= $betSlider.rangeSlider("values").max) {      
        Session.set("betSlider.range", $betSlider.rangeSlider("values"));
      }
    });
  }
};

var initBetGraph = function(){
  if(!$betGraph.data("btoStackedBetGraph")){
    $betGraph.stackedBetGraph();
    Deps.autorun(function(){
      $betGraph.stackedBetGraph("redraw", Collections.Bets.find().fetch());
    });
  };
};

var initPlugins = function(){
  initBetSlider(); 
  initBetGraph();
};

Template.betInput.created = function(){
  Session.set("betInput_stakeKeydown", 0);
};

Template.betInput.rendered = function(){
  $betSlider = $(this.find(".bet-slider"));
  $betGraph = $(this.find(".bet-graph"));
  $(this.find(".stake")).numeric();
  templateRendered = true;
  if(windowLoaded) initPlugins(); // otherwise init in window load callback
};

$(window).load(function(){
  windowLoaded = true;
  if(templateRendered) initPlugins(); //i'm sure there must be a better way to do this...
});

Template.betInput.helpers({
  activeBet: function(){
    return Meteor.user() && Collections.Bets.findOne({playerId: Meteor.user()._id});
  },
  betAmount: function(){
    var bet = Meteor.user() && Collections.Bets.findOne({playerId: Meteor.user()._id});
    if(bet){
      bet = intToBtc(bet.amount);
    }else{
      bet = Session.get("betInput_stake");
    }
    return bet || 0;
  },
  sufficientFunds: function(){
    var bal = Meteor.user().balance;
    var stake = Session.get("betInput_stake") || 0;
    return Meteor.user() &&  bal > 0 && bal >= btcToInt(stake);
  }
});

Template.betInput.events({
  "click .bet-btn, click .update-btn":function(){
    var amount = $("input.stake").val() || 0;
    var range = Session.get("betSlider.range");
    Meteor.call("submitBet", btcToInt(amount), range.min, range.max);
  },
  "click .revoke-btn": function(){
    Meteor.call("revokeBet");
  },
  "click .signin-btn": function(e){
    Auth.showSigninDialog();
  },
  "click .deposit-btn": function(e){
    e.preventDefault();
    Template.bank.toggleOpen();
  },
  "keyup .stake": function(){
    Session.set("betInput_stake", $("input.stake").val());
  },
  "click .stake-buttons .btn": function(e){
    var $btn = $(e.currentTarget);
    var oldStake = parseFloat($("input.stake").val(),10);
    var newStake = 0;
    var user = Meteor.user();
    
    if($btn.is(".btn-01")) newStake = 0.1 + oldStake;
    if($btn.is(".btn-001")) newStake = 0.01 + oldStake;
    if($btn.is(".btn-0001")) newStake = 0.001 + oldStake;
    if($btn.is(".btn-max") && user) newStake = intToBtc(user.balance);
    if($btn.is(".btn-x2")) newStake = oldStake * 2;

    newStake = Math.round(newStake * 100000000) / 100000000;

    $("input.stake").val(newStake);
    Session.set("betInput_stake", newStake);

    e.preventDefault();
  }
});

Template.betInput.preserve([".stake"]);
