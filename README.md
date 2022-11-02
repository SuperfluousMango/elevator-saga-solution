# elevator-saga-solution
**Solution for Elevator Saga**
Links:
* Play game: https://play.elevatorsaga.com/
* Source: https://github.com/magwo/elevatorsaga

This is a solution to all challenges of Elevator Saga v1.6.5. Several of the challenges took multiple runs to succeed, notably the "less than X moves" and "max wait time of X" challenges. (It seems like "wait time" is defined as time from showing up at the elevator to time getting off the elevator, not just the time spent waiting to get on the elevator.)

Rather than write optimized solutions for each of the different styles of challenges, I tried to write a single solution that, given sufficiently cooperative RNG, would suffice for all 18 challenges. The majority of challenges completed in 1 or 2 attempts; a couple took 5 or 6 tries; the final 21-floor behemoth took 18 tries; and challenge 14 took somewhere north of 100 runs.

## Statistics for the perpetual demo (challenge 19):
* 10000 transported
* 6679s elapsed
* 1.5 transported/second
* 12.4s avg wait
* 47.3s max wait (this is why challenge 18 was so hard, with its max allowed wait of 45 seconds)
* 68573 moves

There are undoubtedly plenty of possibilities for further optimization, one option in particular. When an elevator becomes idle, it looks for a set of either upward- or downward-traveling passengers, then heads to the opposite extreme to begin picking them up (closest to the top before moving down, or closest to the bottom before moving up). It ignores all calls on the way to that floor, since those will typically be heading in the opposite direction from what the elevator _intends_ to be moving in the future. It's possible that allowing the elevator to pick up passengers while on that leg of the trip might improve overall performance.
