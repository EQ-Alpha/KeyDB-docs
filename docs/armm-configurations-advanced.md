---
id: armm-configurations-advanced
title: Advanced Configurations
sidebar_label: Configurations-Advanced
---

## Introduction

The default configuration of masters within a network topology and their read-only replicas could be overwhelmed with 
sufficiently large data or a frequent enough read/write load. In these cases, a master or replica could crash, and/or performance may degrade significantly. 

Furthermore, the default configuration also disables some existing features and adds some unintended features. This may present issues depending on how a multi-master with potentially attached read replicas are used. 

In this section, changes to the server configuration keydb.conf will be recommended to optimize a setup.

## General Optimization

The following configuration settings applies to setting up both masters and read-only replicas.

### Performance Optimizations

On smaller machines, `server-threads 4` will boost performance. On larger machines, up to `server-threads 8` (`16` with TLS encrypt) could also boost performance. The threads can still be further increased up to the number of cores the machine has, but there may not be any significant performance gains.

Set `server-threads-affinity True` to pin threads to CPUs to achieve additional performance gains. 

### Guaranteed Replication 	

During replication, when a master sends its own data to another master or to a replica, the master must initialize a buffer to send the data. If the buffer limit gets exceeded as in the case of a massive data transfer, the connection between the master and the recipient will be forcibly disconnected.  Set `client-output-buffer-limit replica 0 0 0` to prevent the premature disconnection. 

## Network Topology Configurations

The following configuration applies to Active Replicas(masters) within a multi-master setup. They are intended to optimize the proper setup functioning of the masters. Although the contents of this section could still apply to a master to a read only replica, it is not as relevant to a master-to-master connection.

### Ring Network Topology-Only Configurations

For each master, configure it to replicate the master(s) with the shortest physical distance to minimize latency.

### Mesh Network Topology-Only Configurations

The high resource utilizations of mesh network topology can lead to failed commands and syncs. Consider the following to optimize setup:
- Reduce intra-network traffic by setting the configuration parameter `multi-master-no-forward no` for every master node

### Other Network Topology Considerations

If not, all masters are synced, consider failure scenarios, and ensure that one break won’t cause others to lose their connections.

### Rename-Command Not Propagated to Other Masters

It is possible to `rename-command` (or even kill) certain dangerous commands to prevent malicious users in a shared setting. However, a renamed/killed command only applies for the master it is configured for. It will not be propagated to all other masters.

### Enable Data WRITES While LOADING Data

For use case where a master added to a network topology is expected to serve writes immediately and data consistency is not an issue, it is possible to enable the new master to `allow-write-during-load no` to enable serve writes while loading the data.

Normally when a new master node is added to a network topology, it must first replicate(load) the entire data from another master. During this loading phase, the master cannot accept any incoming write commands. This is done to prevent those write commands from conflicting with the data being loaded.

**Warning** : This is currently an experimental feature. During loading, write commands to data also existing in the loaded data will have an undefined final value once loading finishes. 

### Write-Disabled Masters

If it’s needed to halt a master from executing writes, as to transform it to a read-only replica or to reduce its traffic, it is possible to temporarily (or even permanently) disable write privileges for a master. Although `active-replica yes` automatically sets `replica-read-only no`, `replica-read-only no` is not a requirement for a functioning active replication/multi-master server instance.  Hence `replica-read-only yes` can be set to stop all write traffic.

### Restricting Data READ/WRITES and Split Brain Mitigation

For any master in a multi-master network topology, `replica-serve-stale-data no` should be used with `replica-quorum`. When enabling `replica-serve-stale-data no` (without `replica-quorum`) for any master M, if M loses its connection with even a single master, M will be restricted from serving read/writes. This can become a problem if all masters in a network topology are configured the same way. When even one master fails, then the whole network topology will become unavailable. 

For a certain master node M, the configuration parameter `replica-quorum` (with `replica-serve-stale-data no`) refers to the least number of other reachable masters required for M to continue to serve reads and writes. In a split-brain scenario, where master M is only able to replicate a subset of all other masters, M can be configured to halt all incoming read and writes. The default value of -1 means that a master node will always serve all incoming read/writes regardless of the number of other masters it is replicating from.  


## Master-Read-Only-Replica Configurations

The following configuration is tailored to the connection between a master and a read only replica. The content here could also relate to master-master only connections but will provide more benefit in a master-to-read-only replica situation.	

### Full Synchronization: Disk vs Diskless Replication

For a master with multiple attached read-only replicas, using diskless replication can significantly decrease the amount of memory needed by the master for the synchronization. It works ideally in when the disk is slow, a fast network bandwidth.

Normally, when a master sends its own data to another master or a read-only replica, it first saves its own data (as `dump.rdb`) to the disk to perform the transfer. This form of replication is perfect when there are a lot of incoming or queued server instances to replicate to. However, this form of replication will also increase the replication time. Furthermore, it will increase the master’s memory usage for each connected read-only replica. 

For the master, set `repl-diskless-sync no` to decrease the replication speed and reduce memory usage. Increase `repl-diskless-sync-delay` to allow the master to queue up multiple replicas for a diskless replication.  

Then for the master’s recipient, set `repl-diskless-load on-empty-db` or `repl-diskless-load swapdb` to also decrease replication speed and reduce memory usage for the replicas. 

**ATTENTION**: It is possible during a diskless load, that a failover of a data-transmitter master M1 to a data-receiver master M2 may occur. Data loss will appear to have occurred on the data-receiver master as it has not loaded all the data from M1 yet. Similarly, during a diskless load, a read-only replica or a data-receiver master may receive non-read I/O operations. These operations can cause the read-only replica or data-receiver master to crash.  In both cases, any server instance undergoing a diskless load should be blocked from receiving commands. 
