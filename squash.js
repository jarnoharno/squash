// ace

var editor = ace.edit('editor');
editor.setTheme('ace/theme/xcode');
editor.getSession().setMode('ace/mode/javascript');

function get_editor_text() {
  return editor.getSession().getDocument().getValue();
}

// dates

function get_week_data(day, days_in_month) {

  var month = 0;
  function advance(days) {
    day += days;
    var dim = days_in_month[month];
    if (day > dim) {
      ++month;
      day -= dim;
    }
    return { month: month, day: day };
  }

  var week_data = [];
  for (var week = 1; week <= 53; ++week) {
    var w = { number: week };
    w.from = advance(1);
    w.to = advance(6);
    week_data.push(w);
  }
  return week_data;
}

// data

var first_week = 36;
var weeks = 16;
var week_data = get_week_data(29,
  [31, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31])
  .slice(first_week - 1, first_week + weeks - 1);
var games;
var players;
var get_match;

// helpers

function split(str) {
  return str.split(' ').filter(function(s) { return s.length > 0; });
}

function eval_data() {
  var text = get_editor_text();
  var ret;
  try {
    ret = eval('(function() {' + text + '})();');
  } catch (err) {
    return;
  }
  games = ret.games_per_week;
  players = split(ret.player_names);
  get_match = ret.get_opponents;
}

function get_matches() {
  var ret = [];
  for (var week = 0; week < weeks; ++week) {
    var entry = {
      week: week_data[week],
      games: []
    };
    for (var game = 0; game < games; ++game) {
      entry.games.push(get_match(week, game));
    }
    ret.push(entry);
  }
  return ret;
}

// angular

angular.module('squash', ['ui.bootstrap'])
.controller('squash', function($scope, $rootScope) {

  function update() {
    eval_data();
    $scope.games = games;
    $scope.players = players;
    $scope.matches = get_matches();
  }

  // bind to ace
  update();
  editor.getSession().on('change', function(e) {
    update();
    $rootScope.$digest();
  });

  $scope.range = function(n) {
    var ret = [];
    for (var i = 0; i < n; ++i) {
      ret.push(i);
    }
    return ret;
  };

  $scope.format = function(week) {
    return week.number + '. viikko (' + week.from.day + '.' + week.from.month +
      '. - ' + week.to.day + '.' + week.to.month + '.)';
  };

});

