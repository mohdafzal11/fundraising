export type InvestorFormProps = {
  initialData?: Investor | null;
  onSuccess?: () => void;
}

export type ProjectFormProps = {
  initialData?: Project | null;
  onSuccess?: () => void;
}


export interface FormStep {
  id?: string;
  title: string;
  icon: React.ReactNode;
  description: string;
} 

export type Link = {
  type: "website" | "twitter" | "facebook" | "telegram" | "linkedin" | "discord" | "blog";
  url: string;
};

export interface Project {
  id?: string;
  slug: string;
  name: string;
  symbol?: string | null;
  title?: string | null;
  description?: string | null;
  category: string[];
  logo?: string | null;
  logoAltText?: string | null;
  links?: Link[];
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  metaImage?: string | null;
  status: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED";

  rounds: Round[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface Round {
  id?: string;
  title?: string | null;
  description?: string | null;
  date?: string | Date;
  amount?: string | null;
  type?: string ;
  projectId?: string;

  investments: Investment[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface Investor {
  id?: string;
  name: string;
  slug?: string | null;
  logo?: string | null;
  logoAltText?: string | null;
  description?: string | null;
  links?: Link[];
  status: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED";
  type?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  metaImage?: string | null;
  investments: Investment[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface Investment {
  id?: string;
  roundId: string;
  investorId: string;
  amount?: string;
  currency: string; 
  tokens?: string;
  investedAt: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;

  round?: Round;
  investor?: Investor;
}

export interface Page {
  id?: string;
  title?: string;
  content?: string;
  path: string;
  contents: PageContent[];
  faqs: PageFAQ[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface PageContent {
  id?: string;
  title?: string;
  content?: string;
  order: number;
  isActive: boolean;
  pageId: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface PageFAQ {
  id?: string;
  question: string;
  answer: string;
  isActive: boolean;
  order: number;
  pageId: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface Section {
  id?: string;
  title?: string;
  tableOfContent?: string;
  description?: string;
  isActive: boolean;
  isTableOfContentVisible: boolean;
  tables: Table[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface Table {
  id?: string;
  title: string;
  tableOfContent?: string;
  headers: string[];
  rows: Record<string, any>[]; 
  isActive: boolean;
  isTableOfContentVisible: boolean;
  sectionId: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface Pagination {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}