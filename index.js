module.exports = function sarsaConstructor(config) {

    function cloneJSON( object ) {
        return JSON.parse ( JSON.stringify ( object ) )
    }

    var defaults = {
        'alpha' : 0.2,     // default to a low(-ish) learning rate
        'gamma' : 0.8,     // default of a high(-ish) dependance on future expectation
        'initialReward' : 0
    }

    function configWithDefaults(config,defaults) {
        var result = {}
        config = config || {}
        result.alpha = (('alpha' in config) ? config.alpha : defaults.alpha )
        result.gamma = (('gamma' in config) ? config.gamma : defaults.gamma )
        result.initialReward = (('initialReward' in config) ? config.initialReward : defaults.initialReward )
        return cloneJSON(result)
    }

    var option_values = configWithDefaults(config,defaults);
    var states = {}
    if (config && ('states' in config)) {
        states = cloneJSON(config.states)
        delete(config.states)
    }


    function setReward(state,action,reward) {
        state = JSON.stringify(state)
        states[state] = states[state] || {}
        states[state][action] = reward
    }



    function getRewards(state,action_list) {
        var actions = states[JSON.stringify(state)] || {}
        var result = {}
        action_list.forEach( function(action) {
            if (action in actions) {
                result[action] = actions[action];
            } else {
                result[action] = option_values.initialReward;
            }
        })
        return result
    }


    return {
        getConfig : function() {
            return cloneJSON(option_values)
        },
        setConfig : function(config) {
            option_values = configWithDefaults(config,option_values)
            return this
        },

        setReward : function(state,action,reward) {
            setReward(state,action,reward)
        },
        getRewards : function(state,action_list) {
            return cloneJSON(getRewards(state,action_list))
        },

        update : function (state0,action0,reward0,state1,action1) {
            // formula      : Q(t) + a( r + yQ(t+1) - Q(t) )
            // or rewritten : ( 1 - a )Q(t) + (a)( r + yQ(t+1) )
            // I prefer the rewritten formula (which is the same but shows the lambda average more clearly)

            var a = option_values.alpha
            var Qt0 = getRewards(state0,[action0])[action0]
            var Qt1 = getRewards(state1,[action1])[action1]
            var r = reward0
            var y = option_values.gamma

            var result = (1-a)*Qt0 + a*(r+y*Qt1)
            setReward(state0,action0,result)
            return result

        },
        getState : function() {
            return states
        },
        clone : function() {
            return sarsaConstructor({'states':states}).setConfig(option_values)
        }
    }
}
