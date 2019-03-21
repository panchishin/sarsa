console.log("\nThis is the cliff problem.\nThe virtual world consists of a 7x3 world like so:\n\n" +
" +-------+\n |ScccccR|\n |       |\n |       |\n +-------+\n\n" +
"The bot starts at 'S' and is trying to get to 'R'.  If the bot touches a 'c' it falls off the cliff.\n" +
"Falling off the cliff is -10,000 points, the reward is 1,000 points, and everything else is -1 point.\n" +
"After the bot falls or gets a reward it starts again.  To make matters more challenging, 20% of the\n" +
"time the bot will move randomly, increasing the odds that it falls off the cliff.\n" +
"It takes 12 moves to take the 'long' way around the cliff, so a score of 80 is near perfect\n" +
"and assumes that no random movements delay the bot.\n")

var map = [ 
  [     -1, -1, -1 ],
  [ -10000, -1, -1 ],
  [ -10000, -1, -1 ],
  [ -10000, -1, -1 ],
  [ -10000, -1, -1 ],
  [ -10000, -1, -1 ],
  [   1000, -1, -1 ] 
];

var width = map.length;
var height = map[0].length;

// The possible actions
var action_list = ['up','down','right','left','hold']
    
function move(location,action) {
    if ( action == 'up'    ) { return [ location[0]                        , Math.min(location[1] + 1, height-1) ] }
    if ( action == 'down'  ) { return [ location[0]                        , Math.max(location[1] - 1, 0) ] }
    if ( action == 'left'  ) { return [ Math.min(location[0] + 1, width-1) , location[1] ] }
    if ( action == 'right' ) { return [ Math.max(location[0] - 1, 0)       , location[1] ] }
    return [ location[0] , location[1] ]
}

var sarsaConstructor = require("../index.js")

var sarsa = sarsaConstructor();  // use default settings since they are fairly good for this problem.

// keep track of where the virtual bot is
var location = null;
var action = null;
var reward = 0;

// let it learn by trying a lot.  This is the number of moves, not the number of games.
var trials_max = 8192;

// we keep track of the last several rewards to calculate average reward
var reward_history = [];
function averageReward(reward_history) {
    return Math.round(reward_history.reduce(function(a,b) { return a + b } ) / reward_history.length)
}

var last_full_run = [] // movement of last full game
var current_run = [] // current game

for(var trials=1; trials<=trials_max; trials++) {

    // if the bot touches something other than regular 'ground' then restart.
    if ( reward != -1 ) {
        location = [0,0]
        action = 'hold'
        last_full_run = current_run
        current_run = [location]
    }


    var next_location = move(location,action);
    var next_action = sarsa.chooseAction(next_location,action_list );

    // 5% of the time the bot does not go where it wants but instead does something random
    if (( Math.random() <= 0.05 )&&( trials < trials_max - 800 )) {
        next_action = action_list[Math.floor(Math.random()*4)]
    }

    // get reward from map, see top
    reward = map[next_location[0]][next_location[1]];

    sarsa.update(location,action,reward,next_location,next_action)

    // set the current location and action for the next step
    location = next_location;
    action = next_action;

    current_run.push(location)

    // add the reward to the history so we can calculate an average
    reward_history.push(reward);
    if ( reward_history.length > 800 ) { // only keep a bit of recent history
        reward_history.shift()
    }

    if ( Math.log2(trials) % 1 == 0 && trials >= 64 )  {
        console.log("Move " + trials + " , average reward per move "
            + averageReward(reward_history)
            + " for the last " + reward_history.length + " moves" )
    }

}

var average_reward = averageReward(reward_history);
if ( average_reward >= 70 ) {
    console.log("\nAfter " + trials_max + " moves the SARSA RL algorithm found a solution to the\n"+
    "cliff problem and accumulated an average of " + average_reward + " points per move.\n"+
    "These results are good and expected.\n")
} else if (average_reward >= 50 ) {
    console.log("\nThese results are fair.  Try running the simulation again.\n")
} else {
    console.log("\nThese results are very poor.  Try running the simulation again.\n")
}

console.log("Here is the last run.")
console.log( last_full_run.map(function(a){return "["+a+"]"}).join(" ") )

var map = [ 
  [ 'S', ' ', ' ' ],
  [ 'c', ' ', ' ' ],
  [ 'c', ' ', ' ' ],
  [ 'c', ' ', ' ' ],
  [ 'c', ' ', ' ' ],
  [ 'c', ' ', ' ' ],
  [ 'R', ' ', ' ' ] 
];

function printMap(map) {
    console.log("+-------+")
    for( height = 0 ; height < map[0].length ; height++ ) {
        var row = []
        for( width = 0 ; width < map.length ; width++ ) {
            row.push( map[width][height] )
        }
        console.log("|" + row.join("") +"|")
    }
    console.log("+-------+")
}

console.log("An empty map")
printMap(map)

for( i in last_full_run ) {
    map[ last_full_run[i][0] ][ last_full_run[i][1] ] = "x"
}

console.log("The last path taken marked by 'x'")
printMap(map)
