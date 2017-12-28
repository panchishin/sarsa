module.exports = function sarsaConstructor(options) {

    function cloneJSON( object ) {
        return JSON.parse ( JSON.stringify ( object ) )
    }

    var defaults = {
        'alpha' : 0.5,
        'gamma' : 0.5,
        'initialReward' : 0
    }

    function optionsWithDefaults(options,defaults) {
        var result = {}
        options = options || {}
        result.alpha = ('alpha' in options) ? options.alpha : defaults.alpha ;
        result.gamma = ('gamma' in options) ? options.gamma : defaults.gamma ;
        result.initialReward = ('initialReward' in options) ? options.initialReward : defaults.initialReward ;
        return cloneJSON(result)
    }

    var option_values = optionsWithDefaults(options,defaults);
    var states = {}


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
        getOptions : function() {
            return cloneJSON(option_values)
        },
        setOptions : function(options) {
            option_values = optionsWithDefaults(options,option_values)
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

        getStates : function() {
            return cloneJSON(states)
        },
    }
}
