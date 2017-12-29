[![Downloads][downloads-image]][downloads-url] [![Auto Test Status][travis-image]][travis-url] [![license][license-image]][license-url] [![Gitter chat][gitter-image]][gitter-url]

SARSA

SARSA is A reinforcement learning algorithm that improves upon Q-Learning.  It is a type of Markov decision process policy.
The name comes from the components that are used in the update loop, specifically 
**S**tate - **A**ction - **R**eward - **S**tate - **A**ction, where the last reward,stateaction are from then next time step.
A shortcoming that Q-learning has that SARSA partially overcomes is that the equation uses the optimal expected 
reward from the future timestep to update its policy when it may not be able to achieve the optimal expected reward. 

This implementation handles the core SARSA equation and makes few assumptions about your specific problem.

Section Links : [Construction](#construction) , [Execution](#execution) , [Examples](#example) , [Equation](#equation), [Built in Action Selection Policies](#built-in-action-selection-policies), [Related](#related-ai-projects) , and [References](#references)

# Construction

### Sarsa constructor
```js
var sarsaConstructor = require('sarsa')
var sarsa = sarsaConstructor( config )
```
The minimal configuration for constructing an sarsa policy is like so:

```js
var config = {
    alpha: yourAlpha,	// defaults to 0.2.  Must be in the range of 0 to 1.  This is the learning rate.
    gamma: yourGamma,   // defaults to 0.8.  Must be in the range of 0 to 1.  This is the signal of future rewards.
    defaultReward: yourDefault,  // defaults to 0. the default reward given to uninitialized state/action pairs.
    policy: yourPolicyFunction, // defaults to 'epsilonGreedy'.  
        // a string naming one of the built in action selection policies
        // (such as 'greedy','softmax','random') or a custom policy function.
    epsilon: yourEpsilon,      // defaults to 0.001.  A parameter for the policy function
    state: initialState // defaults to empty.  If you retrieved a previous internal state using getState you could initialize your Sarsa policy with it.
}
var sarsaConstructor = require('sarsa')
var sarsa = sarsaConstructor( config )
```

That creates one instance of a sarsa policy that uses the initial configuration you supply.
*All configuration options are optional*.

That is all the configuration you need to get started.  You can skip the next sections on advanced configuration and jump right to [execution](#execution), [functions](#functions) and [examples](#example).

### sarsa.getConfig( )
You can retrieve and inspect the configurations of a Sarsa instance like so:
```js
sarsa.getConfig()
```

### sarsa.setConfig( )
You can set all or part of the configuration by using the set method like so:
```js
sarsa.setConfig({alpha:0.3})
```
In the above example the _alpha_ configuration parameter was changed and all other configurations were left the same.
Similarly, if you want to change the initial reward for uninitialized state/action pairs to 7 part way through
execution you could do so like so:
```js
sarsa.setConfig({defaultReward:7})
```

### sarsa.\_policy
You can retrieve the internal state like so:
```js
sarsa._policy
```
This could be large.  **Warning**: this does not return a copy of the state.  It is the state and modifying it will result in modifying the internal workings of your Sarsa instance.

### sarsa.clone( )
You can clone an entire SARSA entity, it's internal data and configuration like so:
```js
var myNewCloneOfASarsa = sarsa.clone()
```
This clones a sarsa instance and all of the internal state.  The two instances will not affect eachother.


# Execution

### sarsa.update( )
This is the main update policy.  It requires 5 parameters, the **S**tate - **A**ction - **R**eward - **S**tate - **A**ction, where the reward and the second state and action are from the next time step.

If you have some state and action for time step 0 called *state0* and *action0*, some *reward* that is an outcome from that, and a state and action for time step 1 called *state1* and *action1*, then you call the update like so:
```js
sarsa.update(state0,action0,reward,state1,action1)
```
That's it.

### sarsa.setReward( )
You probably won't have to do this.  Perhaps you want to specifically set a reward for whatever reason, or perhaps you want to try debugging some of your code.  If something comes up and you really need to overwrite a reward setting and not use the **sarsa.update** function then you would do it like so:
```js
sarsa.setReward(state,action,reward)
```
This is not meant to be used in regular code.  There really is no need (that I can think of) to use this other than for debugging.

### sarsa.getRewards( )
This returns a list of actions and their relative reward value.  You use this to decide on your next action like so:
```js
sarsa.getRewards(state,action_list)
```
You pass in a list of actions you want the rewards for.  Why a list of actions?  Because perhaps it isn't constant.  Perhaps your virtual world allows only some of 'north','south','east','west' at any time and sometimes allows a whole new action never before seen.  This handles that tricky situation.  And if you only want the response for one action, just send in a list containing that one action.

The result is an associative array of actions and their expected relative reward.  The action with the highest expected relative reward is the action that is expected to result in the highest reward.  If you wanted to implement a greedy algorithm then you would just choose the highest.  Other options are numerious.



# Example
If you have installed this as a npm dependency first change directory to *node_modules/sarsa/*.

### Cliff
Given a small 7x3 virtual world that consists of a starting location, a cliff, a navigable ledge, a reward, and sometimes a slippery step, come up with a policy to reliably navigate from the start to the reward.

You can execute the code like so:
```
node examples/cliff.js
```

# Equation
The equation of SARSA is 
```
Q(t) <-- Q(t) + a( r + yQ(t+1) - Q(t) )
```
But I don't feel this does justice to the fact that burried in the equation there is a lambda average.  When an equation uses a lambda average I like to see it collected neatly.  Here is my reformulation:

```
Q(t) <-- Q(t) + a( r + yQ(t+1) - Q(t) )

Q(t) <-- Q(t) + ar + ayQ(t+1) - aQ(t)

Q(t) <-- Q(t) - aQ(t) + ar + ayQ(t+1)

Q(t) <-- ( 1 - a )Q(t) + (a)( r + yQ(t+1) )
```
Here we can see the *Q(t)* is the main term in the lambda average (because it is multiplied by *1-a*) and *r + yQ(t+1)* is the incriment.  *a* just determines the fractional combination of the original *Q(t)* to the new *r + yQ(t+1)*.

If you inspect the source code you will see that I use the reformulation.  It is exactly equal to the original equation.

# Built in Action Selection Policies

### greedy
choose the action with the highest estimated reward is chosen, called the greediest action

### epsilonGreedy
choose the action with the highest estimated reward is chosen, called the greediest action, but in *epsilon* fraction of trials instead choose an action at random.  In practice this both helps a bit with exploration and caution.

### epsilonSoft
choose the action with the highest estimated reward like greedy, but in ```epsilon - epsilon/|A(s)|``` fraction of trials choose one at random.  ```|A(s)|``` is the number of actions).

### softmax
selecting a random action uniformly has drawbacks. With uniform, the worst action is as likely as the second best. Softmax selects by relative likeliness.  This can help with exploring a few highly weighted actions while at the same time avoiding very low weighted actions.

### epsilonGreedySoftmax
choose the action with the highest estimated reward is chosen, called the greediest action, but in *epsilon* fraction of trials instead choose using softmax.

### random
choose an action at random

# Creating a custom Action Selection Policy
You can create your own policies.  Simply put, the responsibility of the policy is to choose an action given an associative array of *action-reward* pairs.

An *action-reward* pair may by any valid associative array with floats for values.  Let's imagine we are solving a 2D game where actions are one of the 4 compass directions.  We call ```var actions = sarsa.getRewards(state,['north','south','east','west'])``` and get the following:
```js
actions = {'north':6,'south':-9,'east':2,'west':0}
```
An action selection policy takes the actions and epsilon, and returns one of the keys from the actions associative array.  In this case it will respond with one of 'north','south','east','west'.

We could implement a policy that arbitarily returns the first action like so.
```js
function returnFirstActionPolicy(actions,epsilon) {
	return Object.keys(actions)[0]
}
```


# Related AI Projects
This is part of a set of related projects.

* [AlphaBeta](https://www.npmjs.com/package/alphabeta)
* [Boosting](https://www.npmjs.com/package/boosting)
* [GeneticAlgorithm](https://www.npmjs.com/package/geneticalgorithm)
* [NearestNeighbour](https://www.npmjs.com/package/nearestneighbour)
* [NeuralNet](https://www.npmjs.com/package/neuralnet)
* [SARSA](https://www.npmjs.com/package/sarsa)

# References

* [Studywolf](https://studywolf.wordpress.com/2013/07/01/reinforcement-learning-sarsa-vs-q-learning/)
* [English Wikipedia](https://en.wikipedia.org/wiki/State-action-reward-state-action)


[gitter-url]: https://gitter.im/panchishin/sarsa
[gitter-image]: https://badges.gitter.im/panchishin/sarsa.png

[downloads-image]: http://img.shields.io/npm/dm/sarsa.svg
[downloads-url]: https://www.npmjs.com/~panchishin

[travis-url]: https://travis-ci.org/panchishin/sarsa
[travis-image]: http://img.shields.io/travis/panchishin/sarsa.svg

[license-image]: https://img.shields.io/badge/license-Unlicense-green.svg
[license-url]: https://tldrlegal.com/license/unlicense

