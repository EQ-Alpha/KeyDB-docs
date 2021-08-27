---
id: armm-implementation-details
title: Implementation Details
sidebar_label: How It Works
---

## Introduction

In terms of technical implementation, compared to traditional replication, Active Replication/Multi-Master have some key differences. These differences actually change how a server instance may normally behave and could explain any potential unintended behaviour that the instance exhibits.

## Automatic Write Enable

When a server instance is set to be an active replica as compared to a normal replica, it will have the potential to also receive write commands (by default normal replicas cannot receive writes).

## UUID

Every time a KeyDB server instance initializes, it will compute a dynamic UUID. This UUID will exist only while the server is running and is not saved. When an active replica and master connect, they will exchange their own UUID with each other. 

The master will then use the active replica’s UUID to register a newly attached active replica for itself. The UUID is used as the active replica’s unique identifier (instead of IP address and port) as it helps the master identify if two incoming active-replica connections are coming from same KeyDB server instance (there could be two or more KeyDB server instances running on the same machine).

Whenever an active replica AR receives a new command, the UUID and timestamp will be checked. For the same UUID, if the new command’s timestamp is earlier than the last command’s timestamp, then the new command is discarded. If it is not, then the active replica AR will process the new command. It will then broadcast the same command to all of its (AR) own replicas. The command is not send back to the master through the new command's UUID.


## Multi-Master-Only : New `replicaof` Implementation 

When a master node M `replicaof` an additional master, M behaves differently compared to traditional replication:

- After a `replicaof` invocation, M’s existing database will not be dropped as `replicaof` normally does
- Each additional `replicaof` invocation will result in M appending (and not replace) a new master to the list of masters M have

## Multi-Master-Only: Data State Immediately After Full Synchronization 

After a master M has finished sync’ing up with every master, the following will be the M’s state:

- M will initially contain a superset of the data from all of M’s masters 
- If two or more masters of M share the same key with different values, M’s value for the same key will be undefined
- M will merge all incoming read/writes from any one of its masters with its own internal database ***FROM BOB : need to ask Ben/John what does this means***

## Multi-Master-Only: Write Conflict Resolution 

After a master M completes all the synchronizations with every master, two or more masters may then propagate conflicting writes to M. The following resolution will occur on M:

- M will default to last operation wins when it comes to multiple masters
- When one of M’s master deletes a key that also exists on another one of M's master, M will still delete the same key even if the key exists on another master.  Hence M will no longer contain a superset of all of M’s master’s data

