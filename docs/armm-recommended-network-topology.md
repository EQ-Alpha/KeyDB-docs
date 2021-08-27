---
id: armm-recommended-network-topology
title: Recommended Network Topology For Multi-Master
sidebar_label: Recommended Network Topology
---

## Introduction

Multi-master enables each master to replicate from any number of other master nodes. This configuration flexibility leads to many acceptable network topologies. 

We recommend using ring or mesh topology for most cases. These topologies are optimal for the intended design of active replication / multimaster.  In general, if minimal cost and resource efficiency is preferred, use ring topology. However, if availability and consistency are an absolute priority, then mesh topology. See the following comparison chart for the two types of network topology:


<table>
  <tr>
    <th>Ring Topology</th>
    <th>Mesh Topology</th>
  </tr>
  <tr>
    <td>
		<ul>
		<li>Less bandwidth due to lower intra-network traffic</li>
		<li>Lower cost</li>
		<li>Maintenance can be easier</li>
		<li>Usually used in Local Area Networks</li>
		<li>Easier to install, configure, manage</li>
		<li>Removing a node only requires configuration of two other nodes</li>
		<li>More nodes can be supported</li>
		<li>Faster speed transfers</li>
		<li>Less packet collisions</li>
		<li>Faster network throughput</li>		
		</ul>
	</td>
    <td>
		<ul>
		<li>Providing the best availability possible </li>
		<li>Much more robust than ring</li>
		<li>Easy to troubleshoot/identify faulty equipment</li>
		<li>Fault Tolerance (Minimal impact when one master node goes down)</li>
		<li>More resistant against split brain</li>
		<li>Propagation of writes happens much earlier</li>
		</ul>	
	</td>
  </tr>
</table>


## Ring Topology 

Ring topology is where every single master replicate from either one(unidirectional) or two(bidirectional) other masters. 

![RingTopology](/img/doc/RingTopology.png)

An Active Replica architecture would be equivalent to an unidirectional ring topology.

![Introduction-1](/img/doc/Introduction-1.png)

## Mesh Topology 

![MeshTopology](/img/doc/MeshTopology.png)

Mesh topology is where given N masters, each master will be replicating from N-1 other masters. In a network topology with only 3 masters, bidirectional ring and mesh network topology will be identical.

![Introduction-2](/img/doc/Introduction-2.png)

## Mixed Ring Topology and Partial Mesh Topology 

If there are specific masters with strong hardware or they have a strong connection between them, it is possible to setup a mixed ring topology or a partial mesh topology.

A mixed ring topology is a setup between unidirectional and bidirectional ring topology. While a partial mesh topology is a midway between bidirectional and mesh topology. In either case, these additional connections can balance tradeoffs between ring vs mesh topology.

![MixedRingPartialMesh](/img/doc/MixedRingPartialMesh.png)

## Hybrid and Other Topology

Although it is possible to configure additional topologies such as linear, tree, star topology, we recommend refrain from them. These topologies have a “central” point of failure that could create more problems (especially split-brain scenarios or latency decreases) than they’re worth. Other topologies are also possible but create an unneeded complexity as compared to ring/mesh topology. 


