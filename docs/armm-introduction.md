---
id: armm-introduction
title: Introduction
sidebar_label: Introduction
---

## Overview

A single KeyDB replica instance can only be read from and cannot be written to. This requires the usage of a master KeyDB instance to propagate writes to read-only replicas.

![Introduction-0](/img/doc/Introduction-0.png)

KeyDB active replica instances can be both read from and written to. Active replicas (also known as "Active-Active") are when exactly two master server instances are exact replicas of each other, containing the same dataset. Writes received by one master from clients will automatically be propagated to the other master. 

![Introduction-4](/img/doc/Introduction-1.png)

Multiple masters are an upgraded version of active replication. Multi-master requires at least three master server instances, each replicating from at least one other master. This type of replication allows clients to perform both read and write operations to any single master server instances within a network topology.  

![Introduction-2](/img/doc/Introduction-2.png)

Active Replica:/Multi-Master are designed to have a proxy server that point to the instances. A load balancer is used to direct traffic to one specific master (the one with the least traffic). When one of the masters receive a write, the master will propagate the write to its other masters, and then so on, until all the masters in the topology receives the write. 

![Introduction-3](/img/doc/Introduction-3.png)

Finally, it is also possible to attach read-only replicas to the masters. This setup allows all writes to be load balanced while reads are distributed by retrieving from a master or from read-only replicas.

![Introduction-4](/img/doc/Introduction-4.png)

## Benefits

This architecture offers the following benefits:
- Simplifies fail-over scenarios as replicas are no longer need to be promoted to active masters. In case one master fails, another master nodes can easily act as a backup.
- Distribute load in high write scenarios.
- Increase number of reads and maximize read latency under a heavy load of operations
- Optimize latency as clients can be physically connected to the closest master 

## Potential Use Cases

An Active Replica/Multi-Master configuration is perfect for the following situations: 
- Fast failover with a load balancer that sends writes to only 1 master node at a time. The writes are then propagated to the rest of the masters. 
- Caching scenarios with `GET`/`SET` commands where the Last Write Wins, ensuring eventual consistency is sufficient

## Conflict Resolution: Last Write Wins
For every write, each key is assigned a timestamp. When there are multiple concurrent writes to different master nodes, the write with the latest timestamp determines the key’s value. This provides eventual consistency.

In the future, RAFT will be implemented to provide an even better consistency model.

