---
id: armm-configurations-read-only-replica
title: Attaching Read-Only Replicas 
sidebar_label: Configurations-Read-Only Replicas
---

Read-only replicas can be attached to masters within a multi-master network topology. While write operations are still sent to masters, read operations can be now served by both masters and read-only replicas. These replicas offer the ability to significantly increase the amount of read load that can be handled by the multi-master configuration. Overall, this configuration can vastly increase availability.

## Read Only Replicas Basic Usage

![ReadOnlyReplica-1](/img/doc/ReadOnlyReplica-1.png)

Any master M within a multi-master topology may have as many read-only replicas R as desired. A read-only replica node may `replicaof` a single master.

## Read Only Replicas Advanced Usage: Connected to multiple masters

![ReadOnlyReplica-2](/img/doc/ReadOnlyReplica-2.png)

However, it is possible for a read-only replica node to connect to multiple masters within the same network topology or to multiple topologies. For a read-only replica node to connect to more than one master, `--multi-master yes --active-replica yes` must able be enabled. However, doing so will grant the replica node write privileges to change its own copy of the data. So, the replica must be also configured with `--replica-read-only yes`

## Star/Tree Topology Considerations 1: Possible Lost Writes 

If a read-only replica node R becomes a replica of a master within a topology and R has write permissions, it can temporarily change its own key values. However, once R’s master updates the same key value, it will change R’s key value, hence R could lose the write operations it receives. 

## Master – Read Only Replica Synchronization Memory Requirements

When a replica is attached to a master for the first time, the master and the replica will perform a full synchronization. If there are a lot of replicas attached to a single master, the master will perform a synchronization for all of them concurrently. This full synchronization will require some memory per read-only-replica.

Restarting a master within a multi-master network topology will reset its replication ID. Hence all read-only replicas of the restarted master will have to perform a full resynchronization. A partial synchronization is not possible.

To prevent the master’s memory from being overwhelmed, try reconnecting a subset of all read-only replica to the master rather than all of them at once.

## Maintaining Master – Read Only Replica Connection Memory Requirements

While the master is connected to a read-only replica, some amount of memory on the master (output and query buffers) is allocated to maintain the connection.  Each single master-replica connection will use some memory on the master. Then when a master undergoes heavy write traffic, this memory will also increase proportionally (per write and per attached replica) to propagate the writes.

Ensure that the master has the memory to maintain and propagate writes for each read-only replica connection.

