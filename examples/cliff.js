console.log("\nThis is the cliff problem.\nThe virtual world consists of a 7x3 world like so:\n\n" +
" +-------+\n |ScccccR|\n |       |\n |       |\n +-------+\n\n" +
"The bot starts at 'S' and is trying to get to 'R'.  If the bot touches a 'c' it falls off the cliff.\n" +
"Falling off the cliff is -10,000 points, the reward is 1,000 points, and everything else is -1 point.\n" +
"After the bot falls or gets a reward it starts again.  To make matters more challenging, 2% of the\n" +
"time the bot will move randomly, increasing the odds that it falls off the cliff.\n" +
"It takes 12 moves to take the 'long' way around the cliff, so a score of 80 is near perfect\n" +
"and assumes that no random movements delay the bot.\n")

var map = [ 
  [    -1, -1, -1 ],
  [ -10000, -1, -1 ],
  [ -10000, -1, -1 ],
  [ -10000, -1, -1 ],
  [ -10000, -1, -1 ],
  [ -10000, -1, -1 ],
  [  1000, -1, -1 ] 
];
var width = map.length;
var height = map[0].length;

// The possible actions
var action_list = ['up','down','right','left','hold']
    
function move(location,action) {
    if ( action == 'up'    ) { return { 'h' : Math.min(location.h + 1, height-1), 'w' : location.w } }
    if ( action == 'down'  ) { return { 'h' : Math.max(location.h - 1, 0),        'w' : location.w } }
    if ( action == 'left'  ) { return { 'h' : location.h , 'w' : Math.min(location.w + 1, width-1) } }
    if ( action == 'right' ) { return { 'h' : location.h , 'w' : Math.max(location.w - 1, 0)       } }
    return { 'h':location.h, 'w':location.w }
}

var sarsaConstructor = require("../index.js")


var defaultSettings = {
    'alpha':0.2,            // a low learning rate (alpha)
    'gamma':0.8,            // a large signal from future expectation (gamma)
    'defaultReward' : 0,
    'epsilon':0.02,
    'policy':'epsilonGreedy' // do greedy other usually, else softmax, using epsilon as ratio
}

var sarsa = sarsaConstructor(defaultSettings)

var location = null;
var action = null;
var reward = 0;
var lambda_reward = 0;
var lambda_fraction = 8;

var trials_max = 16384*4;
for(var trials=1; trials<=trials_max; trials++) {

    if ( reward != -1 ) {
        location = {'w':0,'h':0}
        action = 'hold'
    }

    var next_location = move(location,action);
    var next_action = sarsa.chooseAction(next_location,action_list );

    reward = map[next_location.w][next_location.h];

    sarsa.update(location,action,reward,next_location,next_action)

    location = next_location;
    action = next_action;

    // calculate lambda average over a lambda_fraction of the current number of trials
    var lambda = lambda_fraction/trials
    lambda_reward = lambda_reward*(1-lambda) + reward*lambda

    if ( Math.log2(trials) % 1 == 0 && trials >= 64 )  {
        console.log("Move " + trials + " , average reward per move " + Math.round(lambda_reward) )
    }

}

if ( Math.round(lambda_reward) >= 75 ) {
    console.log("\nAfter " + trials + " moves the SARSA RL algorithm found a solution to the\n"+
    "cliff problem and accumulated an average of " + Math.round(lambda_reward) + " points per move.\n"+
    "These results are good and expected.\n")
} else if (Math.round(lambda_reward) >= 50 ) {
    console.log("\nThese results are fair.  Try running the simulation again.\n")
} else {
    console.log("\nThese results are very poor.  Try running the simulation again.\n")
}