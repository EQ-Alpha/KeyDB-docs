---
id: armm-limitations
title: Limitations
sidebar_label: Limitations
---

## Introduction

Although an Active-Replica / Multi-Master setup is great for handling a lot of read/write traffic, it is not the best when it comes to data consistency. Quite a few drawbacks of this system architecture come mainly from the implicit shortcomings of Last Write Wins and Split Brains. These two situations could prevent data to be out of sync or for data to behave unexpectedly for certain nodes. 

## Inter-master communciation traffic

A single master node only knows about its own immediate connections. It does not know about the overall network topology that it is a part of. Each master must constantly relay messages to other masters/replica connected to it. The amount of traffic between masters increases per additional connection in the network topology. Traffic is maximized in a mesh network topology.

## Last Write Wins Implications

When a write is performed on a key, the key is associated with a timestamp to resolve conflicting writes. However, a write operation that deletes a key will also delete the timestamp, creating the following possible inconsistency scenarios: 

- When one of the masters within a network topology perform a key deletion operation such as `DEL` or `FLUSHALL` then all other masters will also automatically delete the same key.
- For a disconnected master DM, where the `dump.RDB` file of DM is deleted, and finally DM reconnects to the network topology, the lack of keys on DM does not imply a `FLUSHALL` that will propagate to every other master. Instead, DM will receive keys from the rest of the other masters.  

Other inconsistency scenario are as follows:
 
- When a Master A issues a (sub)key to `expiremember`/`expire`, and a master B also issues the same (sub)key a second `expiremember`/`expire`, the (sub)key’s time-to-live will be updated to the second `expiremember`/`expire`’s time to live.
- If a member M of a set A has been `SMOVE` from set A to another set B, M will not carry over the expire in set B. 

## Multiple Concurrent BLOCKING POP (`BRPOP`/`BLPOP`/`BZPOPMAX`/`BZPOPMIN`/`BRPOPLPUSH`) Operations

Route all incoming blocking queries towards only one specific master and avoid having more than one master receive blocking queries. When a blocked data structure is inserted with any number of values, the updated data structure is sent to all other masters and cloned on those masters BEFORE any unblocking happens.  After unblocking, multiple POP across multiple masters will be executed asynchronously and can lead to out of sync inconsistency issues. It is possible that value returned by the POP will be different than the value removed. It is also possible the Sorted Set/List can contain different values on different masters.

## Split Brain 

![SplitBrain](/img/doc/SplitBrain.png)

When there are two or more disconnections that prevent masters from propagating writes to all other masters, the overall network topology becomes severed and split (hence split-brain). 

The server instances will still serve writes during these split-brain scenarios. What could happen on the two halves of the split brain is there can be two different versions of the data for the same key.  

When the connection is restored (split brain healing), each master will share their version of the new data (and their timestamps). Conflicting key values are resolved via Last Write Wins. This prevents stale data from overwriting new data written after the connection was severed.

## Split Brain Healing and Last Write Win Violations

After a network topology heals from a split brain, there could be some Last Write Win violations. These violations will lead to data inconsistencies and lost split-brain-writes. 

- **During split brain**: Assume A key K is already present or created on one half of a split brain B1.  Then the same key K is deleted or becomes an empty array on the other half of the brain B2. After healing, the key K will still be present using B1’s value even if B2’s most recent write deletes K. 


- **During split brain**: When a key’s value will be written (but not deleted or emptied out) by multiple masters, the master LM with the latest (most recent) write to K decides K‘s post-healing value. Write operations for K across split brains are not merged. After healing, K’s value on master LM will be sent to all the remaining masters on the other side of the split brain, thereby replacing the remaining masters' K's value. Hence all write operations performed on the other side of the split will be completely lost. This applies for Strings (includes `INCR(BY)`/`DECR(BY)`), Lists, Sets, Sorted Sets and Hashes.
    - For subkey-available complex data structures such as Sorted Sets and Hashes, Last Write Wins applies a timestamp only for the entire key, not for its subkeys. This means if split brain B1 updates a score/field SK1 in a sorted set/hash with key K, the timestamp is applied on K not SK1. Then when the other spilt brain B2 updates a different score/field SK2 for the same sorted set/hash with key K, there is later timestamp on K, not SK2. Upon healing, B2’s entire set of value for K will be taken. All of B1’s changes to the first score/field SK1 will be lost, not merged with B2.  


- `EXPIRE`/`PERSIST`
    - Assume a key has not been set to expire before a split brain.
	    - During a split brain:  If a Key K is set to expire on one half of the split brain B1 and expires, while it is ignored on the other half of the split brain B2. After healing, K will still be present. Hence the `EXPIRE` operation on B1 will be lost. 
	- Assume a key is set to expire before a split brain. 
		- During the split brain: if K expires due to a second expire on one half of the split brain B1 but does not expire on the other half of split brain B2. After healing, K will revive with the time-to-live remaining from B2. The additional `EXPIRE` operation on B1 will be lost.
		- During the split brain: if a PERSIST is applied to the key by one half the split brain B1, and if the key is ignored by the other half. After healing, K’s time-to-live will be still present. The `PERSIST` has been lost. 
