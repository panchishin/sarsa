[![Downloads][downloads-image]][downloads-url] [![Auto Test Status][travis-image]][travis-url] [![license][license-image]][license-url] [![Gitter chat][gitter-image]][gitter-url]

SARSA

Section Links : [Construction](#construction) , [Execution](#execution) , [Examples](#example) , [Phenotype](#phenotype) , [FAQ](#faq) , [Related](#related-ai-projects) , and [References](#references)

# Construction
TBD

# Execution
TBD

# Functions
TBD

# Example
If you have installed this as a npm dependency first change directory to *node_modules/sarsa/*.

TBD


# Equation restated

```
Q(t) + a( r + yQ(t+1) - Q(t) )

Q(t) + ar + ayQ(t+1) - aQ(t)

Q(t) - aQ(t) + ar + ayQ(t+1)

( 1 - a )Q(t) + (a)( r + yQ(t+1) )
```



# Related AI Projects
This is part of a set of related projects.

* [AlphaBeta](https://www.npmjs.com/package/alphabeta)
* [Boosting](https://www.npmjs.com/package/boosting)
* [GeneticAlgorithm](https://www.npmjs.com/package/geneticalgorithm)
* [NearestNeighbour](https://www.npmjs.com/package/nearestneighbour)
* [NeuralNet](https://www.npmjs.com/package/neuralnet)

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

