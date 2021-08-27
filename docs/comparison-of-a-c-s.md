---
id: comparison-of-a-c-s
title: Replication Architecture Comparisons
sidebar_label: Comparison of Replication Architectures
---

## Introduction

![A-C-S-1](/img/doc/A-C-S-1.png)

A standalone single KeyDB server instance may not be suitable for many use cases, as it is limited to only vertical scalability. It can become easily bottlenecked by a sufficiently high read/write load, leading to performance degradations.

![A-C-S-2](/img/doc/A-C-S-2.png)

Multiple KeyDB server instances can be used instead to distribute read/write loads. However, to ensure the read/written data is consistent between all server instances, some form of replication architecture is needed between the server instances.

![A-C-S-3](/img/doc/A-C-S-3.png)

KeyDB offers three different replication architectures that can significantly improve performance, availability, consistency, and horizontal scalability. The replication architectures are as follows:
- **Active Replication / Multi-Master**: Propagate writes to each KeyDB server instance to ensure each KeyDB server are identical to each other  
- **Clustering**: Sharding entire datasets over multiple KeyDB instances
- **Sentinel**: Using specialized KeyDB server instances to administrate the replication architecture

## Active Replication / Multi-Master Architecture

![A-C-S-MM](/img/doc/A-C-S-MM.png)

An active replication (also known as Active/Active) / multi-master architecture feature a configuration of at least two KeyDB server instance nodes. Every node can be connected to every other node to form an overall ring/mesh network topology. Every node in this system will have the same identical dataset, and hence every node will be a copy of every other node. Each node in this system can serve both read and write. Any write that is applied to one node will automatically be eventually propagated to every other node in the topology.

## Clustering Architecture

![A-C-S-Cluster](/img/doc/A-C-S-Cluster.png)

Clustering features a replication architecture of at least three master nodes with optional replica nodes. Each replica node can serve reads (but not writes) and could failover a master in case of master failure. KeyDB will use 16384 slots for key-value pairs for data sharding. Each master node in the cluster will contain a subset of the 16384 slots. Each master node in the cluster will contain a subset of the 16384 slots. From there, this allows each master node to serve both read and write, but only for the subset of the 16384 slots it contains. 


## Sentinel Architecture

![A-C-S-Sentinel](/img/doc/A-C-S-Sentinel.png)

Sentinel features a system of at least one master, one replica and at least three sentinel nodes. The master maintains a dataset while the replica act as a backup to the master. In the case of a possible master failure, the three sentinels will failover the failed master and promote the backup replica as the new master. When the old master reconnects, the old master will be demoted as a backup replica of the new master. 

## Comparison Chart

<table>
  <tr>
    <th></th>
    <th>Active-Rep</th>
    <th>Cluster</th>
    <th>Sentinel</th>
  </tr>
  <tr>
    <td>Minimum System Requirements</td>
    <td style={{color: "green"}}>Each node in the system must have near-identical memory </td>
    <td style={{color: "yellow"}}>At least 3 nodes</td>
    <td style={{color: "red"}}>At least 3 sentinels on 3 different physical machines</td>
  </tr>
  <tr>	
    <td>Additional System Requirements</td>
    <td style={{color: "red"}}>Powerful load balancer to accept and direct all incoming traffic</td>
    <td style={{color: "green"}}>At least 6 nodes better: 3 masters, 3 replicas</td>
    <td>N/A</td>
  </tr>
<tr>
	<td>Ongoing Savings/Cost</td>
	<td><span style={{color: "green"}}>Less management needed </span><br/><br/><span style={{color: "red"}}>High bandwidth with low latency for proper functioning</span></td>
	<td style={{color: "red"}}>Continuous communication between cluster nodes consumes network resources<br/><br/>Maintenance needed to monitor each cluster node</td>
	<td>N/A</td>
</tr>
<tr>
	<td>READ Scalability</td>
	<td style={{color: "green"}}>Add additional master nodes or read-only replicas to scale READS</td>
	<td style={{color: "yellow"}}>
	Add even more replica nodes to high-traffic master nodes to scale READS
	<br/><br/>Shard cluster further to accept more incoming client for specifc keys
	</td>
	<td style={{color: "red"}}>
	Add even more replica nodes to scale READS
	</td>
</tr>
<tr>
	<td>WRITE Scalability</td>
	<td style={{color: "yellow"}}>
	Writes scalable but performance decreases as number of nodes increase due to intra-communication broadcast traffic</td>
	<td style={{color: "green"}}>
	Writes are easily scalable by distributing them over multiple sharded cluster nodes
	</td>
	<td style={{color: "red"}}>
		Writes not scalable
	</td>
</tr>
<tr>
	<td>Large Datasets Limitations</td>
	<td style={{color: "yellow"}}>
	Writes limited by large datasets
	</td>
	<td style={{color: "red"}}>
	Large data sets (hashes, lists, sets, sorted sets) must be located on a single cluster node and cannot be sharded/distributed over multiple cluster nodes
	<br/><br/>
	No merge operations possible for large datasets 
	</td>
	<td>
	N/A
	</td>
</tr>
<tr>
	<td>Resource Optimization</td>
	<td style={{color: "green"}}>
	Access and uses the full computing capabilities of available hardware
	<br/><br/>
	Accepting both read AND write increases throughput
	</td>
	<td style={{color: "yellow"}}>
	Data sharding reduces each node's memory requirements
	</td>
	<td style={{color: "red"}}>
	Constant monitoring drains network resources continously
	</td>
</tr>
<tr>
	<td>Availability</td>
	<td style={{color: "green"}}>
		Multiple nodes eliminates/minimizes downtime during failover. 
	</td>
	<td style={{color: "yellow"}}>
		Can serve some read/writes when subset of all cluster nodes fails
		<br/><br/>
		Availability of all 16384 key slots at the same time decreases with every additional master node.  
	</td>
	<td style={{color: "red"}}>
		Brief downtime during failover by sentinels
	</td>
</tr>
<tr>
	<td>Failure and failover handling</td>
	<td style={{color: "yellow"}}>
		Lack of single point of failure 
	</td>
	<td style={{color: "red"}}>
		Replicas act as backup master to failed masters
	</td>
	<td style={{color: "green"}}>
		Multiple sentinels in failure detection prevents false positives 
		<br/><br/>
		Robust failure detection due to multiple sentinels
		<br/><br/>
		<span style={{color: "red"}}>Successful failovers need at least a majority of active sentinels</span>
	</td>
</tr>
<tr>
	<td>Consistency</td>
	<td style={{color: "red"}}>
		Potential data loss/corruption when there are simultaneous conflicting writes or split brains.
	</td>
	<td style={{color: "yellow"}}>
		Evenutal consistency 
	</td>
	<td style={{color: "green"}}>
		Maintains a single dataset for zero write conflicts
		<br/><br/>Eventual consistency under strong partitions
		<br/><br/><span style={{color: "red"}}> Acknowledged writes can still be lost during failure</span>
	</td>
</tr>
<tr>
	<td>Additional Support & Setup</td>
	<td style={{color: "green"}}>
	<b>Data Locality:</b> User can be configured to connect to nearest master node
	</td>
	<td>
		<span style={{color: "green"}}>Hot keys easier to manage by placing them in specific cluster nodes</span>
		<br/><br/>
		<span style={{color: "yellow"}}>Sharded clusters across multiple server instance machines enables higher throughput/volume, key balancing</span>
		<br/><br/>
		<span style={{color: "red"}}>Complexity increases as number of nodes increase</span>
	</td>
	<td style={{color: "green"}}>
		<span style={{color: "green"}}>
		Provides notifications (even more with PUB/SUB) to system administrators
		<br/><br/>
		Provides constant monitoring 
		<br/><br/>
		TILT mode ensures systems reliability
		</span>
		<br/><br/>
		<span style={{color: "red"}}>
		Additional customization needed with Docket, and NAT
		<br/><br/>
		Firewall customization needed for sentinel communications
		<br/><br/>
		For a single sentinel, monitor configuration changes of a master doesn’t automatically propagate the change to all other sentinels monitoring the same master. Must manually apply the same monitor configuration change of the same master to every other sentinel.
		</span>
	</td>
</tr>
<tr>
	<td>Disabled Features</td>
	<td>
		N/A
	</td>
	<td style={{color: "red"}}>
		Limited multi-key operations (transactions, multi-set) support. All keys must be on a single node sharded --> Can use hash tag to mitigate this
		<br/><br/>
		Supports only 1 database
	</td>
	<td>
		N/A
	</td>
</tr>

</table>

