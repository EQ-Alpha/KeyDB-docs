---
id: armm-configurations-basic-setup
title: Basic Setup
sidebar_label: Configurations-Basic Setup
---

## Introduction

Setting up Active Replication is like traditional replication, with the additional requirement that both nodes will be configured to `replicaof` each other. 

Multi-master shares the setup as Active Replication but with a few additional steps. In a multi-master setup, each master node will be configured to be a replica of at least one (rather than only a single) other master. Different setup offers its own unique advantage/disadvantages, refer to the [Recommended Network Topology](/docs/armm-recommended-network-topology) for more information.

As normally Active Replica / Multi-Master is used with a load balancer, visit [HAProxy configurations](/docs/haproxy) for health checks, and different routing configurations (round-robin, first).     

## Active Replication Setup

### Version #1: First Independent Later Join

If for any reason that two server instances could function as active replicas, but not synchronize immediately upon boot, then this setup version is ideal. They would be both independent server instances at first. Then later, when they’re ready to be synchronized, one of them would become a copy [hence lose all its data since boot] of the other. 

Assume two server instances M1 and M2, perform the following: 

1. In M1 and M2’s `keydb.conf` configuration files, enable `active-replica yes`

![ActiveReplica1](/img/doc/ActiveReplica1.png)

**REMINDER** : Executing `replicaof` will drop and delete the current server’s entire data. Backup the current server’s data in case the data is needed. 

2. Initialize a client via that connects to **M**1. Execute the command `replicaof <address of M2> <port of M2>`.  M1 will drop all of its current database and load M2’s dataset. M1 is now a copy of M2.

![ActiveReplica2](/img/doc/ActiveReplica2.png)

3. Initialize a second client that now instead connects to **M2**. Execute the command `replicaof <address of M1> <port of M1>`.  M2 will drop all of its current database and load M1’s dataset (the same data that M2 sent to M1). 

![ActiveReplica3](/img/doc/ActiveReplica3.png)

See YouTube demo:

<iframe width="560" height="315" src="https://www.youtube.com/embed/2QOICUsBEls?start=12" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

### Version #2 : Configuration File Only

Two server instances can be configured to be active replicas to immediately synchronize with each other upon boot. This achieved by setting up the configuration files as follows: 

| Instance-A config file located at 10.0.0.2  | Instance-B config file located at 10.0.0.3 |
| ------------- | ------------- |
| ``` port 6379```<br/>```active-replica yes```<br/>```replicaof 10.0.0.3 6379``` | ```port 6379```<br/>``` active-replica yes```<br/>```replicaof 10.0.0.2 6379```  |

![ActiveReplica4](/img/doc/ActiveReplica4.png)

### Version #3 : Command Line Arguments

Append to config file via the following command:

`keydb-server keydb.conf --active-replica yes --replicaof <ipaddress of other master> <port of other master>`

## Multi-Master : Differences To Active/Traditional Replication

When a master (let’s call it M) `replicaof` two other masters, the replication is different than Active Replication.

- After a `replicaof` invocation, M’s existing database will not be dropped as `replicaof` normally does
- Each additional `replicaof` invocation will instead result in M append (and not replace) a new master to the list of masters M has
- After M fully synchronizes with all its masters, M will merge all incoming writes from each of the database of M’s masters 

## Multi-Master Setup

For every server’s `keydb.conf` configuration file, apply the following changes: 

1. Enable both `active-replica` and `multi-master` mode.  `multi-master yes` will not function without `active-replica yes` enabled. 

```
active-replica yes
multi-master yes
```

2. Register each keydb-server master node as a replica of the other desired master nodes via `replicaof <IP address of desired master> <PORT of desired master>`

**REQUIRED** :  When setting up multi-master in a config file, `active-replica yes` and `multi-master yes` must be enabled BEFORE `replicaof <IP address> <PORT>`, as shown in the examples below.

### Example #1: unidirectional ring topology of 3 master nodes

![MM-1](/img/doc/MM1.png)

| Instance-A config file located at 10.0.0.2  | Instance-B config file located at 10.0.0.3 | Instance-C config file located at 10.0.0.4 |
| ------------- | ------------- | ------------- |
| ```port 6379```<br/>```active-replica yes```<br/>```multi-master yes```<br/>```replicaof 10.0.0.3 6379``` | ```port 6379```<br/>```active-replica yes```<br/>```multi-master yes```<br/>```replicaof 10.0.0.4 6379```  | ```port 6379```<br/>```active-replica yes```<br/>```multi-master yes```<br/>```replicaof 10.0.0.2 6379```  |

**ATTENTION** : The `replicaof` command configures its caller master’s incoming data traffic, and not the callee’s outgoing traffic. Observe that write data traffic from the diagram arrow and the `replicaof` command are in reverse direction.  For example, In the above diagram, `10.0.0.3:6379` sends writes to `10.0.0.2:6379`. While the configuration file for A states that `10.0.0.2:6379` is `replicaof`  `10.0.0.3:6379`.

### Example #2: mesh / bidirectional ring topology of 3 master nodes

![MM-2](/img/doc/MM2.png)

| Instance-A config file located at 10.0.0.2  | Instance-B config file located at 10.0.0.3 | Instance-C config file located at 10.0.0.4 |
| ------------- | ------------- | ------------- |
| ```port 6379```<br/>```active-replica yes```<br/>```multi-master yes```<br/>```replicaof 10.0.0.3 6379```<br/>```replicaof 10.0.0.4 6379```  | ```port 6379```<br/>```active-replica yes```<br/>```multi-master yes```<br/>```replicaof 10.0.0.2 6379```<br/>```replicaof 10.0.0.4 6379```  | ```port 6379```<br/>```active-replica yes```<br/>```multi-master yes```<br/>```replicaof 10.0.0.2 6379```<br/>```replicaof 10.0.0.3 6379```  |

### Example #3: bidirectional ring topology of 4 master nodes

![MM-3](/img/doc/MM3.png)

| Instance-A config file located at 127.0.0.1  | Instance-B config file located at 127.0.0.1 |
| ------------- | ------------- |
| ```port 5000```<br/>```active-replica yes```<br/>```multi-master yes```<br/>```replicaof 127.0.0.1 5001```<br/>```replicaof 127.0.0.1 6000```  | ```port 5001```<br/>```active-replica yes```<br/>```multi-master yes```<br/>```replicaof 127.0.0.1 5000```<br/>```replicaof 127.0.0.1 6001```  |

| Instance-C config file located at 127.0.0.1  | Instance-D config file located at 127.0.0.1 |
| ------------- | ------------- | 
| ```port 6000```<br/>```active-replica yes```<br/>```multi-master yes```<br/>```replicaof 127.0.0.1 5000```<br/>```replicaof 127.0.0.1 6001```  | ```port 6001```<br/>```active-replica yes```<br/>```multi-master yes```<br/>```replicaof 127.0.0.1 5001```<br/>```replicaof 127.0.0.1 6000```  |

### Example #4: mesh topology of 4 master nodes

![MM-4](/img/doc/MM4.png)

| Instance-A config file located at 127.0.0.1  | Instance-B config file located at 127.0.0.1 |
| ------------- | ------------- | 
| ```port 5000```<br/>```active-replica yes```<br/>```multi-master yes```<br/>```replicaof 127.0.0.1 5001```<br/>```replicaof 127.0.0.1 6000```<br/>```replicaof 127.0.0.1 6001```  | ```port 5001```<br/>```active-replica yes```<br/>```multi-master yes```<br/>```replicaof 127.0.0.1 5000```<br/>```replicaof 127.0.0.1 6000```<br/>```replicaof 127.0.0.1 6001```  |

| Instance-C config file located at 127.0.0.1  | Instance-D config file located at 127.0.0.1 |
| ------------- | ------------- | 
| ```port 6000```<br/>```active-replica yes```<br/>```multi-master yes```<br/>```replicaof 127.0.0.1 5000```<br/>```replicaof 127.0.0.1 5001```<br/>```replicaof 127.0.0.1 6001```  | ```port 6001```<br/>```active-replica yes```<br/>```multi-master yes```<br/>```replicaof 127.0.0.1 5000```<br/>```replicaof 127.0.0.1 5001```<br/>```replicaof 127.0.0.1 6000```  |


### Example #5: Append to configuration file through command line

`keydb-server keydb.conf --active-replica yes --multi-master yes --replicaof <ipaddress of master1> <port of master1> --replicaof <ipaddress of master2> <port of master2>`

## Removing a single master from a network topology

A single master may need to be removed for reasons as follows:

- Reduce a network topology’s complexity/resource usage
- Temporarily add a new master to feed its own data to all the other masters, then remove the master once data propagation completes

To remove a single master M from a network topology:  

1. For master **M**, execute `replicaof no one` 
2. For every other master that is a `replicaof` M, execute `replicaof remove <ip of M> <port of M>`

**ATTENTION** : Issuing `replicaof remove` will also trigger the master to generate a secondary replication ID.

### Example : Remove a single master D from 4 node mesh topology 

Before the removal : 4 node mesh topology

![MM-5](/img/doc/MM5.png)

| Instance-A config file | Instance-B config file |
| ------------- | ------------- |
| ```port 1000```<br/>```active-replica yes```<br/>```multi-master yes```<br/>```replicaof 127.0.0.1 2000```<br/>```replicaof 127.0.0.1 3000```<br/>```replicaof 127.0.0.1 4000```  | ```port 2000```<br/>```active-replica yes```<br/>```multi-master yes```<br/>```replicaof 127.0.0.1 1000```<br/>```replicaof 127.0.0.1 3000```<br/>```replicaof 127.0.0.1 4000```  |

| Instance-C config file | Instance-D config file |
| ------------- | ------------- |
| ```port 3000```<br/>```active-replica yes```<br/>```multi-master yes```<br/>```replicaof 127.0.0.1 1000```<br/>```replicaof 127.0.0.1 2000```<br/>```replicaof 127.0.0.1 4000```  | ```port 4000```<br/>```active-replica yes```<br/>```multi-master yes```<br/>```replicaof 127.0.0.1 1000```<br/>```replicaof 127.0.0.1 2000```<br/>```replicaof 127.0.0.1 3000```  |

Execute the following client commands at the 4 different master nodes to perform the removal: 

```
#1: Remove D’s connection with A, B, C
keydb-cli -p 4000 replicaof no one

#2: Remove A's connection to D 
keydb-cli -p 1000 replicaof remove 127.0.0.1 4000

#2: Remove B's connection to D 
keydb-cli -p 2000 replicaof remove 127.0.0.1 4000

#2: Remove C's connection to D 
keydb-cli -p 3000 replicaof remove 127.0.0.1 4000
```


After the removal: 3 node mesh or bidirectional ring topology

![MM-6](/img/doc/MM6.png)

| Instance-A config file | Instance-B config file | Instance-C config file |
| ------------- | ------------- | ------------- |
| ```port 1000```<br/>```active-replica yes```<br/>```multi-master yes```<br/>```replicaof 127.0.0.1 2000```<br/>```replicaof  127.0.0.1 3000```  | ```port 2000```<br/>```active-replica yes```<br/>```multi-master yes```<br/>```replicaof 127.0.0.1 1000```<br/>```replicaof 127.0.0.1 3000```  | ```port 3000```<br/>```active-replica yes```<br/>```multi-master yes```<br/>```replicaof 127.0.0.1 1000```<br/>```replicaof 127.0.0.1 2000```  |



