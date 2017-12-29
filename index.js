function cloneJSON( object ) {
    return JSON.parse ( JSON.stringify ( object ) )
}

function setReward(weights,state,action,reward) {
    state = JSON.stringify(state)
    weights[state] = weights[state] || {}
    weights[state][action] = reward
}

function getRewards(weights,state,action_list,defaultReward) {
    var actions = weights[JSON.stringify(state)] || {}
    var result = {}
    action_list.forEach( function(action) {
        if (action in actions) {
            result[action] = actions[action];
        } else {
            result[action] = defaultReward;
        }
    })
    return result
}

function sarsaEquation(state0,action0,reward1,state1,action1,alpha,gamma,weights,defaultReward,getRewards,setReward) {
    // formula : ( 1 - a )Q(t) + (a)( r + yQ(t+1) )

    var a = alpha
    var Qt0 = getRewards(weights,state0,[action0],defaultReward)[action0]
    var Qt1 = getRewards(weights,state1,[action1],defaultReward)[action1]
    var r = reward1
    var y = gamma

    var result = (1-a)*Qt0 + a*(r+y*Qt1)
    setReward(weights,state0,action0,result)
    return result
}

function randomPolicy(actions,epsilon) {
    actions = Object.keys(actions)
    return actions[ Math.trunc( Math.random()*(actions.length) ) ]
}

function greedyPolicy(actions,epsilon) {
    var best_score = Object.values(actions).reduce(function(a,b){return (a>b)?a:b })
    return Object.keys(actions).filter( function( key ) { return actions[key] == best_score } )[0]
}

function epsilonGreedyPolicy(actions,epsilon) {
    if ( Math.random() <= epsilon ) { 
        return randomPolicy(actions,epsilon)
    } else { 
        return greedyPolicy(actions,epsilon)
    }
}

function epsilonSoftPolicy(actions,epsilon) {
    if ( Math.random() <= (1-epsilon+epsilon/Object.keys(actions).length) ) {
        return greedyPolicy(actions,epsilon)
    } else {
        return randomPolicy(actions,epsilon)
    }
}

function softmaxPolicy(actions,epsilon) {
    var keys = Object.keys(actions)
    if (keys.length < 1) {
        process.exit(-1)
    }
    var values = keys.map(function(key){ return Math.pow(Math.E,actions[key]) })
    var denominator = values.reduce(function(a,b){return a+b})
    var softmax = values.map(function(v){ return v/denominator })

    var selection = Math.random()
    var offset = 0
    var index = 0
    for( index in values ) {
        offset += softmax[index]
        if ( offset >= selection ) {
            return keys[index]
        }
    }
    return randomPolicy(actions,epsilon)
}

function epsilonGreedySoftmaxPolicy(actions,epsilon) {
    if ( Math.random() >= epsilon ) { 
        return greedyPolicy(actions,epsilon)
    } else { 
        return softmaxPolicy(actions,epsilon)
    }
}

var policies = {
    greedy : greedyPolicy,
    epsilonGreedy : epsilonGreedyPolicy,
    epsilonSoft : epsilonSoftPolicy,
    softmax : softmaxPolicy,
    epsilonGreedySoftmax : epsilonGreedySoftmaxPolicy,
    random : randomPolicy,
}

var defaults = {
    'alpha' : 0.2,     // default to a low(-ish) learning rate
    'gamma' : 0.8,     // default of a high(-ish) dependance on future expectation
    'defaultReward' : 0,
    'epsilon' : 0.001,
    'policy' : epsilonGreedyPolicy
}

function configWithDefaults(config,defaults) {
    var result = {}
    config = config || {}
    result.alpha = (('alpha' in config) ? config.alpha : defaults.alpha )
    result.gamma = (('gamma' in config) ? config.gamma : defaults.gamma )
    result.defaultReward = (('defaultReward' in config) ? config.defaultReward : defaults.defaultReward )
    result.epsilon = (('epsilon' in config) ? config.epsilon : defaults.epsilon )
    result = cloneJSON(result)
    result.policy = (('policy' in config) ? config.policy : defaults.policy )
    if ( typeof(result.policy) == 'string' ) {
        if ( result.policy in policies ) {
            result.policy = policies[result.policy]
        } else {
            console.error("A policy has to be a function or one of : " + Object.keys(policies) + ". Setting it to 'greedyPolicy'")
            result.policy = greedyPolicy
        }
    }
    return result
}

module.exports = function sarsaConstructor(config) {

    return {
        _config : configWithDefaults(config,defaults),
        _weights : {},
        getConfig : function() {
            return cloneJSON(this._config)
        },
        setConfig : function(config) {
            this._config = configWithDefaults(config,this._config)
            return this
        },
        setReward : function(state,action,reward) {
            setReward(this._weights,state,action,reward)
            return this
        },
        getRewards : function(state,action_list) {
            return cloneJSON(getRewards(this._weights,state,action_list,this._config.defaultReward))
        },
        update : function (state0,action0,reward1,state1,action1) {
            return sarsaEquation(state0,action0,reward1,state1,action1,
                this._config.alpha,this._config.gamma,
                this._weights,this._config.defaultReward,getRewards,setReward)
        },
        chooseAction : function(state,action_list) {
            var actions = getRewards(this._weights,state,action_list,this._config.defaultReward)
            return this._config.policy(actions,this._config.epsilon)
        },
        clone : function() {
            var clone = sarsaConstructor(this._config)
            clone._weights = cloneJSON(this._weights)
            return clone
        }
    }

}
