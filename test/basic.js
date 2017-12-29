
var sarsaConstructor = require("../index.js")

module.exports = {

	'sarsa is a function' : function(beforeExit, assert) {
		assert.equal('function', typeof sarsaConstructor)
	},

	'sarsa creates basic config' : function(beforeExit, assert) {

		var sarsa = sarsaConstructor();

		assert.equal('object' , typeof sarsa )
	},

	'basic config has values' : function(beforeExit, assert) {

		var sarsa = sarsaConstructor();
		var config = sarsa.getConfig();

		assert.equal(0.2 , config.alpha );
		assert.equal(0.8 , config.gamma );
		assert.equal(0 , config.defaultReward );
	},


	'basic clone' : function(beforeExit, assert) {

		var sarsa = sarsaConstructor();
		var config = sarsa.getConfig();

		assert.equal(0.2 , config.alpha );
		assert.equal(0.8 , config.gamma );
		assert.equal(0 , config.defaultReward );

		sarsa.setReward('state','action',4)
		assert.equal( 4, sarsa.getRewards('state',['action'])['action'] )

		var clone = sarsa.clone()

		config = clone.getConfig();
		assert.equal(0.2 , config.alpha );
		assert.equal(0.8 , config.gamma );
		assert.equal(0 , config.defaultReward );

		assert.equal( 4, clone.getRewards('state',['action'])['action'] )
		clone.setReward('state','action',5)
		assert.equal( 5, clone.getRewards('state',['action'])['action'] )
		sarsa.setReward('state','action',4)
		assert.equal( 4, sarsa.getRewards('state',['action'])['action'] )

	},

	'able to set and reset options' : function(beforeExit, assert) {

		var sarsa = sarsaConstructor({'alpha':0.9,'gamma':0.1});
		var config = sarsa.getConfig();

		assert.equal(0.9 , config.alpha );
		assert.equal(0.1 , config.gamma );
		assert.equal(0 , config.defaultReward );

		sarsa.setConfig({'alpha':0.3});
		config = sarsa.getConfig();

		assert.equal(0.3 , config.alpha );
		assert.equal(0.1 , config.gamma );
		assert.equal(0 , config.defaultReward );
	},

	'set' : function(beforeExit, assert) {

		var sarsa = sarsaConstructor({'alpha':0.9,'gamma':0.1,'defaultReward':-100});

		sarsa.setReward(5,'up',1);
		var actions = sarsa.getRewards(5,['up','down']);

		assert.equal(1 , actions.up);
		assert.equal(-100 , actions.down);
	},

	'update' : function(beforeExit, assert) {

		var sarsa = sarsaConstructor({'alpha':0.9,'gamma':0.1,'defaultReward':-1});
		var actions = sarsa.getRewards(5,['up','down']);

		assert.equal(-1 , actions.up);
		assert.equal(-1 , actions.down);

		var result = sarsa.update(5,'up',10,6,'down');
		// Q(t) + a( r + yQ(t+1) - Q(t) )
		var expected = -1 + .9*( 10 + .1*-1 -(-1));
		assert.equal( Math.round(expected*100) , Math.round(result*100) )
		actions = sarsa.getRewards(5,['up','down']);

		assert.equal( Math.round(expected*100) , Math.round(actions.up*100));
		assert.equal( -1 , actions.down);

		// step 2
		result = sarsa.update(6,'down',10,7,'down');
		// Q(t) + a( r + yQ(t+1) - Q(t) )
		expected = -1 + .9*( 10 + .1*-1 -(-1))
		expected = 8.81
		assert.equal( Math.round(expected*100) , Math.round(result*100) )
		actions = sarsa.getRewards(6,['up','down']);

		assert.equal( Math.round(expected*100) , Math.round(actions.down*100));
		assert.equal( -1 , actions.up);

		// step 3
		result = sarsa.update(5,'up',10,6,'down');
		// Q(t) + a( r + yQ(t+1) - Q(t) )
		expected = 8.81 + .9*( 10 + .1*8.81 - 8.81)
		expected = 10.67
		assert.equal( Math.round(expected*100) , Math.round(result*100) )
		actions = sarsa.getRewards(5,['up','down']);

		assert.equal( Math.round(expected*100) , Math.round(actions.up*100));
		assert.equal( -1 , actions.down);

	},


}

