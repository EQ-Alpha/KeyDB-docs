module.exports = {

	"docs": [
		// KeyDB Docs
		{type: 'category', label: 'KeyDB Docs', collapsed: false, items: ["intro", "coming-soon"]},
		//Getting Started
		{type: 'category', label: 'Getting Started', collapsed: true, items: [
			"using-keydb",
			// KeyDB Cloud
			{type: 'category', label: 'Cloud', collapsed: false, items:  [
				"cloud-about", "cloud-getting-started",
				{type: 'link', label: 'More...', href: 'cloud-using-gui'}
				]},
			// KeyDB Open Source
			{type: 'category', label: 'Open Source', collapsed: false, items:  [
				"open-source-getting-started", "ppa-deb", "rpm", "docker-basics", "build"
				]},
			// KeyDB Enterprise
			{type: 'category', label: 'Enterprise', collapsed: false, items:  [
				"enterprise-getting-started", "enterprise-ppa-deb", "enterprise-rpm", "enterprise-docker-basics",
				{type: 'link', label: 'More...', href: 'enterprise-intro'}
				]},
			// additional docs for getting started
			"first-test", "migration", "config-file", "intro-admin"
			]
		},
		// KeyDB Enterprise
		{type: 'category', label: 'KeyDB Enterprise', collapsed: true, items: ["enterprise-intro","enterprise-coming-soon", "enterprise-getting-started",
	                        {type: 'category', label: 'Features', collapsed: false, items:  ["enterprise-flash", "enterprise-flash-sizing", "enterprise-mvcc", "enterprise-non-blocking-queries"]},
			]
		},
		//KeyDB Cloud
                {type: 'category', label: 'KeyDB Cloud', collapsed: true, items: ["cloud-about", "cloud-getting-started", "cloud-using-gui", "cloud-spec",
                                {type: 'category', label: 'Features', collapsed: false, items:  ["enterprise-flash","enterprise-flash-sizing", "enterprise-mvcc", "enterprise-non-blocking-queries"]},
                        ]
                },
		{type: 'category', label: 'Benchmarking', items: ["benchmarking"]},
		{type: 'category', label: 'Server Infrastructure', items: ["comparison-of-a-c-s","replication", 
			{type: 'category', label: 'Active Replication & Multi-Master', collapsed: false, items:  
				["armm-introduction",
				"armm-implementation-details",
				"armm-recommended-network-topology",
				"armm-limitations",
				"armm-configurations-basic-setup",
				"armm-configurations-read-only-replica",
				"armm-configurations-advanced"
				]},
			{type: 'category', label : 'Clustering', collapsed: false, items: 
				["cluster-spec", "cluster-man", "cluster-create", "cluster-tutorial"]},
			{type: 'category', label : 'Sentinel', collapsed: false, items: 
				["sentinel", "sentinel-clients"]}]},
		{type: 'category', label: 'Data Types & Commands', items: ["commands", "pubsub", "transactions", "data-types-intro", "data-types", "indexes", "signals", "notifications", "pipelining", "streams-intro", "partitioning", "mass-insert"]},
		{type: 'category', label: 'Configuration', collapsed: true, items: ["persistence", "lru-cache", "config-file"]},
		{type: 'category', label: 'Docker', items: [
			{type: 'link', label: 'Advanced', href: 'https://hub.docker.com/r/eqalpha/keydb'},
			"docker-active-rep", "dockerfiles"]},
		{type: 'category', label: 'Load Balancers', items: ["haproxy"]},
		{type: 'category', label: 'Security', items: ["security", "acl", "encryption"]},
		{type: 'category', label: 'Troubleshooting', items: ["debugging", "ldb", "latency", "latency-monitor"]},
		{type: 'category', label: 'Clients/APIs/Protocols', items: ["clients", "keydbcli", "keydbdiagnostictool", "protocol", "gopher"]},
		{type: 'category', label: 'More', items: ["ARM", "faq", "memory-optimization", "license"]}
	],
};

