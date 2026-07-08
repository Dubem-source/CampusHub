export interface AgentApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  area: string;
  lodgesManaged: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedDate: string;
  documentPlaceholder: string;
  ninImage?: string;
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  verificationStatus: 'Verified' | 'Unverified' | 'Suspended';
  listingsCount: number;
  avgRating: number;
  joinedDate: string;
}

export interface Lodge {
  id: string;
  name: string;
  agentName: string;
  area: string;
  roomType: string;
  status: 'Active' | 'Hidden';
  createdDate: string;
  isOfficial?: boolean;
  availability?: 'available' | 'pending' | 'rented';
  price?: number;
  entryPrice?: number;
  description?: string;
  amenities?: string[];
  photos?: string[];
  viewsCount?: number;
}

export interface Report {
  id: string;
  reporter: string;
  entityType: 'Lodge' | 'Agent' | 'Review';
  entityId: string;
  entityName: string;
  reason: string;
  status: 'Pending' | 'Investigating' | 'Resolved' | 'Dismissed';
  date: string;
}

export const MOCK_AGENT_APPLICATIONS: AgentApplication[] = [
  {
    id: 'app-1',
    name: 'Sylvester Ibeh',
    email: 'sylvester@example.com',
    phone: '+2348077788899',
    area: 'Ihiagwa',
    lodgesManaged: 4,
    status: 'Pending',
    appliedDate: '2026-06-05',
    documentPlaceholder: 'NIN_Document_Sylvester.pdf',
  },
  {
    id: 'app-2',
    name: 'Joy Nnaji',
    email: 'joy.n@example.com',
    phone: '+2348088899900',
    area: 'Eziobodo',
    lodgesManaged: 2,
    status: 'Pending',
    appliedDate: '2026-06-06',
    documentPlaceholder: 'Utility_Bill_Joy.jpg',
  },
  {
    id: 'app-3',
    name: 'Emeka Obi',
    email: 'emeka.obi@example.com',
    phone: '+2348011122233',
    area: 'FUTO Backgate',
    lodgesManaged: 6,
    status: 'Approved',
    appliedDate: '2026-06-03',
    documentPlaceholder: 'License_Emeka.pdf',
  },
  {
    id: 'app-4',
    name: 'Chiamaka Okafor',
    email: 'chiamaka@example.com',
    phone: '+2348022233344',
    area: 'Umuchima',
    lodgesManaged: 1,
    status: 'Rejected',
    appliedDate: '2026-06-01',
    documentPlaceholder: 'ID_Card_Chiamaka.png',
  },
  {
    id: 'app-5',
    name: 'Kelechi Uche',
    email: 'kelechi.u@example.com',
    phone: '+2348033344455',
    area: 'Ihiagwa',
    lodgesManaged: 3,
    status: 'Pending',
    appliedDate: '2026-06-07',
    documentPlaceholder: 'Tax_Clearance_Kelechi.pdf',
  },
];

export const MOCK_AGENTS: Agent[] = [
  {
    id: 'agent-1',
    name: 'Sylvester Ibeh',
    email: 'sylvester@example.com',
    phone: '+2348077788899',
    verificationStatus: 'Verified',
    listingsCount: 4,
    avgRating: 4.8,
    joinedDate: '2026-01-15',
  },
  {
    id: 'agent-2',
    name: 'Emeka Obi',
    email: 'emeka.obi@example.com',
    phone: '+2348011122233',
    verificationStatus: 'Verified',
    listingsCount: 6,
    avgRating: 4.5,
    joinedDate: '2026-02-10',
  },
  {
    id: 'agent-3',
    name: 'Chinonso Evans',
    email: 'chinonso@example.com',
    phone: '+2348055566677',
    verificationStatus: 'Unverified',
    listingsCount: 2,
    avgRating: 3.9,
    joinedDate: '2026-05-20',
  },
  {
    id: 'agent-4',
    name: 'Blessing Udoh',
    email: 'blessing@example.com',
    phone: '+2348099900011',
    verificationStatus: 'Suspended',
    listingsCount: 0,
    avgRating: 0,
    joinedDate: '2026-03-05',
  },
  {
    id: 'agent-5',
    name: 'Official CampusHub',
    email: 'official@campushub.com',
    phone: '+2348111222333',
    verificationStatus: 'Verified',
    listingsCount: 12,
    avgRating: 5.0,
    joinedDate: '2025-12-01',
  },
  {
    id: 'agent-6',
    name: 'Tunde Bakare',
    email: 'tunde@example.com',
    phone: '+2348012345678',
    verificationStatus: 'Verified',
    listingsCount: 5,
    avgRating: 4.2,
    joinedDate: '2026-04-12',
  },
  {
    id: 'agent-7',
    name: 'Amina Yusuf',
    email: 'amina@example.com',
    phone: '+2348087654321',
    verificationStatus: 'Verified',
    listingsCount: 3,
    avgRating: 4.7,
    joinedDate: '2026-05-01',
  },
  {
    id: 'agent-8',
    name: 'Ifeanyi Okeke',
    email: 'ifeanyi@example.com',
    phone: '+2348099887766',
    verificationStatus: 'Unverified',
    listingsCount: 1,
    avgRating: 4.0,
    joinedDate: '2026-06-02',
  },
];

export const MOCK_LODGES: Lodge[] = [
  {
    id: 'listing-1',
    name: 'Ihiagwa Gardens',
    agentName: 'Sylvester Ibeh',
    area: 'Ihiagwa',
    roomType: 'Self-contain',
    status: 'Active',
    createdDate: '2026-06-12',
    availability: 'available',
  },
  {
    id: 'listing-2',
    name: 'Ihiagwa Gardens',
    agentName: 'Sylvester Ibeh',
    area: 'Ihiagwa',
    roomType: 'Mini-flat',
    status: 'Active',
    createdDate: '2026-06-10',
    availability: 'pending',
  },
  {
    id: 'listing-3',
    name: 'Eziobodo Suites',
    agentName: 'Official CampusHub',
    area: 'Eziobodo',
    roomType: 'One-bedroom',
    status: 'Active',
    createdDate: '2026-06-15',
    isOfficial: true,
    availability: 'available',
  },
  {
    id: 'listing-4',
    name: 'Eziobodo Suites',
    agentName: 'Official CampusHub',
    area: 'Eziobodo',
    roomType: 'Self-contain',
    status: 'Active',
    createdDate: '2026-06-14',
    isOfficial: true,
    availability: 'rented',
  },
  {
    id: 'listing-5',
    name: 'Aladinma Terrace',
    agentName: 'Emeka Obi',
    area: 'Aladinma',
    roomType: 'Self-contain',
    status: 'Active',
    createdDate: '2026-06-05',
    availability: 'available',
  },
  {
    id: 'listing-6',
    name: 'Umuchima Villas',
    agentName: 'Sylvester Ibeh',
    area: 'Umuchima',
    roomType: 'Single room',
    status: 'Hidden',
    createdDate: '2026-06-11',
    availability: 'pending',
  },
  {
    id: 'listing-7',
    name: 'Backgate Plaza',
    agentName: 'Tunde Bakare',
    area: 'FUTO Backgate',
    roomType: 'Self-contain',
    status: 'Active',
    createdDate: '2026-06-08',
    availability: 'rented',
  },
  {
    id: 'listing-8',
    name: 'Campus View Lodge',
    agentName: 'Official CampusHub',
    area: 'Ihiagwa',
    roomType: 'Mini-flat',
    status: 'Active',
    createdDate: '2026-06-09',
    isOfficial: true,
    availability: 'available',
  },
  {
    id: 'listing-9',
    name: 'Green Field Lodge',
    agentName: 'Amina Yusuf',
    area: 'Eziobodo',
    roomType: 'Single room',
    status: 'Active',
    createdDate: '2026-06-07',
    availability: 'available',
  },
  {
    id: 'listing-10',
    name: 'Sunny Side Apartments',
    agentName: 'Emeka Obi',
    area: 'Umuchima',
    roomType: 'One-bedroom',
    status: 'Active',
    createdDate: '2026-06-04',
    availability: 'pending',
  },
  {
    id: 'listing-11',
    name: 'Official Hub 1',
    agentName: 'Official CampusHub',
    area: 'Ihiagwa',
    roomType: 'Self-contain',
    status: 'Active',
    createdDate: '2026-06-13',
    isOfficial: true,
    availability: 'available',
  },
  {
    id: 'listing-12',
    name: 'Official Hub 2',
    agentName: 'Official CampusHub',
    area: 'Eziobodo',
    roomType: 'Mini-flat',
    status: 'Active',
    createdDate: '2026-06-06',
    isOfficial: true,
    availability: 'rented',
  },
  {
    id: 'listing-13',
    name: 'Royal Oaks',
    agentName: 'Tunde Bakare',
    area: 'Aladinma',
    roomType: 'Self-contain',
    status: 'Active',
    createdDate: '2026-06-02',
    availability: 'available',
  },
  {
    id: 'listing-14',
    name: 'Pine Crest',
    agentName: 'Amina Yusuf',
    area: 'Umuchima',
    roomType: 'Single room',
    status: 'Active',
    createdDate: '2026-06-01',
    availability: 'pending',
  },
];

export const MOCK_REPORTS: Report[] = [
  {
    id: 'rep-1',
    reporter: 'Chiamaka Okafor',
    entityType: 'Lodge',
    entityId: 'lodge-1',
    entityName: 'Ihiagwa Gardens',
    reason: 'Scam / fake listing. The agent is claiming there is 24/7 solar light, but residents say the solar panels have been broken for two months.',
    status: 'Pending',
    date: '2026-06-06',
  },
  {
    id: 'rep-2',
    reporter: 'Kelechi Uche',
    entityType: 'Agent',
    entityId: 'agent-2',
    entityName: 'Emeka Obi',
    reason: 'Wrong pricing. Listed for 240k but the agent Chiagozie is insisting on 290k inspection-day price.',
    status: 'Investigating',
    date: '2026-06-07',
  },
  {
    id: 'rep-3',
    reporter: 'Tobi Alao',
    entityType: 'Lodge',
    entityId: 'lodge-3',
    entityName: 'Eziobodo Suites',
    reason: 'Bad photos / misleading info. Photos show a brand new kitchen, but the actual room has an old wooden counter with leaks.',
    status: 'Resolved',
    date: '2026-06-04',
  },
  {
    id: 'rep-4',
    reporter: 'Musa Ibrahim',
    entityType: 'Review',
    entityId: 'rev-102',
    entityName: 'Review for Backgate Plaza',
    reason: 'Inappropriate language used in the review comment.',
    status: 'Pending',
    date: '2026-06-05',
  },
  {
    id: 'rep-5',
    reporter: 'Janet Doe',
    entityType: 'Lodge',
    entityId: 'lodge-5',
    entityName: 'Backgate Plaza',
    reason: 'Lodge does not exist at the specified location.',
    status: 'Pending',
    date: '2026-06-06',
  },
  {
    id: 'rep-6',
    reporter: 'Sam Wilson',
    entityType: 'Agent',
    entityId: 'agent-3',
    entityName: 'Chinonso Evans',
    reason: 'Agent was rude and unprofessional during the tour.',
    status: 'Dismissed',
    date: '2026-06-02',
  },
];
