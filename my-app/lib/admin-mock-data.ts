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
  phoneVerified?: boolean;
  emailVerified?: boolean;
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
