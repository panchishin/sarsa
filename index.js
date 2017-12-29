function cloneJSON( object ) {
    return JSON.parse ( JSON.stringify ( object ) )
}

function configWithDefaults(config,defaults) {
    var result = {}
    config = config || {}
    result.alpha = (('alpha' in config) ? config.alpha : defaults.alpha )
    result.gamma = (('gamma' in config) ? config.gamma : defaults.gamma )
    result.defaultReward = (('defaultReward' in config) ? config.defaultReward : defaults.defaultReward )
    return cloneJSON(result)
}

function setReward(policy,state,action,reward) {
    state = JSON.stringify(state)
    policy[state] = policy[state] || {}
    policy[state][action] = reward
}

function getRewards(policy,state,action_list,defaultReward) {
    var actions = policy[JSON.stringify(state)] || {}
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

function sarsaEquation(state0,action0,reward1,state1,action1,alpha,gamma,policy,defaultReward,getRewards,setReward) {
    // formula : ( 1 - a )Q(t) + (a)( r + yQ(t+1) )

    var a = alpha
    var Qt0 = getRewards(policy,state0,[action0],defaultReward)[action0]
    var Qt1 = getRewards(policy,state1,[action1],defaultReward)[action1]
    var r = reward1
    var y = gamma

    var result = (1-a)*Qt0 + a*(r+y*Qt1)
    setReward(policy,state0,action0,result)
    return result
}

var defaults = {
    'alpha' : 0.2,     // default to a low(-ish) learning rate
    'gamma' : 0.8,     // default of a high(-ish) dependance on future expectation
    'defaultReward' : 0
}

module.exports = function sarsaConstructor(config) {

    var instance = {
        getConfig : function() {
            return cloneJSON(this._config)
        },
        setConfig : function(config) {
            this._config = configWithDefaults(config,this._config)
            return this
        },
        setReward : function(state,action,reward) {
            setReward(this._policy,state,action,reward)
            return this
        },
        getRewards : function(state,action_list) {
            return cloneJSON(getRewards(this._policy,state,action_list,this._config.defaultReward))
        },
        update : function (state0,action0,reward1,state1,action1) {
            return sarsaEquation(state0,action0,reward1,state1,action1,
                this._config.alpha,this._config.gamma,
                this._policy,this._config.defaultReward,getRewards,setReward)
        },
        clone : function() {
            var clone = sarsaConstructor(this._config)
            clone._policy = cloneJSON(this._policy)
            return clone
        }
    }

    instance._config = configWithDefaults(config,defaults);
    instance._policy = {}
    if (config && ('policy' in config)) {
        instance._policy = cloneJSON(config.this._policy)
    }

    return instance
}
