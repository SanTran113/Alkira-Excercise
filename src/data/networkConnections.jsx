export const CONNECTION_TYPES = {
  VPN: "VPN",
  DIRECT_CONNECT: "Direct Connect",
  CLOUD_EXCHANGE: "Cloud Exchange",
};
export const ConnectionTypesList = Object.values(CONNECTION_TYPES);

export const CONNECTION_STATUSES = {
  ACTIVE: "Active",
  PENDING: "Pending",
  DISABLED: "Disabled",
};
export const ConnectionStatusesList = Object.values(CONNECTION_STATUSES);

export const REGIONS = {
  "US-East": "US-East",
  "US-West": "US-West",
  "EU-West": "EU-West",
  "AP-South": "AP-South"
};
export const RegionsList = Object.values(REGIONS);

export const mockConnections = [
  {
    id: "conn-001",
    name: "Main Office - NYC",
    type: CONNECTION_TYPES.VPN,
    status: CONNECTION_STATUSES.ACTIVE,
    region: REGIONS["US-East"],
    enabled: true,
  },
  {
    id: "conn-002",
    name: "AWS Production",
    type: CONNECTION_TYPES.CLOUD_EXCHANGE,
    status: CONNECTION_STATUSES.ACTIVE,
    region: REGIONS["US-West"],
    enabled: true,
  },
  {
    id: "conn-003",
    name: "Azure Dev Environment",
    type: CONNECTION_TYPES.DIRECT_CONNECT,
    status: CONNECTION_STATUSES.PENDING,
    region: REGIONS["EU-West"],
    enabled: false,
  },
  {
    id: "conn-004",
    name: "London Branch Office",
    type: CONNECTION_TYPES.VPN,
    status: CONNECTION_STATUSES.ACTIVE,
    region: REGIONS["EU-West"],
    enabled: true,
  },
  {
    id: "conn-005",
    name: "GCP Analytics Cluster",
    type: CONNECTION_TYPES.CLOUD_EXCHANGE,
    status: CONNECTION_STATUSES.DISABLED,
    region: REGIONS["AP-South"],
    enabled: false,
  },
  {
    id: "conn-006",
    name: "Singapore Data Center",
    type: CONNECTION_TYPES.DIRECT_CONNECT,
    status: CONNECTION_STATUSES.ACTIVE,
    region: REGIONS["AP-South"],
    enabled: true,
  },
];
