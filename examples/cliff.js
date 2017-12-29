
var map = [];
var width = 6;
var height = 3;
for( var w=0; w<width; w++) {
    var row = []
    map.push(row)
    for( var h=0; h<height; h++) {
        if ( h == 0 && w != 0 && w != width-1) {
            row.push(-100); // death
        } else if ( h == 0 && w == width-1 ) {
            row.push(100); // cheese
        } else {
            row.push(-1); // get tired
        }
    }
}

function bracket(low,value,high) {
    return Math.max( low , Math.min(value,high-1) )
}

var action_list = ['up','down','right','left']

function move(location,action) {
    location = JSON.parse ( JSON.stringify ( location) )
    if ( action == 'up' ) {
        location.h += 1
    }
    if ( action == 'down' ) {
        location.h -= 1
    }
    if ( action == 'left' ) {
        location.w -= 1 
    }
    if ( action == 'right' ) {
        location.w += 1
    }
    location.h = bracket( 0 , location.h , height )
    location.w = bracket( 0 , location.w , width )
    return location
}


function chooseAction(actions,stability) {
    if ( Math.random() > stability ) {
        return randomAction(actions)
    }
    var best_score = -1e100;
    var best_action = 'hold';
    for (var action in actions) {
        if (actions[action] > best_score) {
            best_score = actions[action];
            best_action = action;
        } else if (actions[action] == best_score) {
            return randomAction(actions)
        }
    }
    return best_action
}

function randomAction(actions) {
    actions = Object.keys(actions)
    return actions[ Math.trunc( Math.random()*(actions.length) ) ]
}


var sarsaConstructor = require("../index.js")
var sarsa = sarsaConstructor()

// main training loop
var history = [];
var total_score = [];

for(var trials=0; trials<=4096; trials++) {
    var location = {'w':0,'h':0}
    var action = 'hold';

    var moves_remaining = 100;
    var reward = 0;

    history = [];

    while (moves_remaining>0) {
        
        var next_location = move(location,action);
        var next_actions = sarsa.getRewards(next_location,action_list);
        var next_action = chooseAction(next_actions, (trials==4096 ? 1.0 : 0.98) );

        reward = map[next_location.w][next_location.h];

        if ( reward == -1 ) {
            moves_remaining -= 1;
        } else {
            moves_remaining = 0;
        }

        history.push(JSON.stringify(location)+" "+action+" "+reward+" "+JSON.stringify(next_location)+" "+next_action+" "+JSON.stringify(next_actions))
        sarsa.update(location,action,reward,next_location,next_action)

        location = next_location;
        action = next_action;

        total_score.push(reward)
    }

    if ( Math.log2(trials) % 1 == 0 )  {
        console.log("TRIAL == " + trials + " " + history.length + " moves, last reward " + reward + " average reward " + ( total_score.reduce(function(x,y){return x+y}) / total_score.length ) )
        total_score = []
    }

}
console.log(history)
