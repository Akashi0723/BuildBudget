export type Finish = 'basic' | 'standard' | 'premium';
export type ProjectType = 'new-house' | 'renovation';
export type ProjectInput = {
  name: string;
  type: ProjectType;
  province: string;
  city: string;
  floors: number[];
  finish: Finish;
  budget: number | null;
  contingency: number;
  allowance: number;
};
export type Estimate = {
  id: string;
  createdAt: string;
  input: ProjectInput;
  area: number;
  rate: number;
  rateVersion: string;
  rateDate: string;
  locationFactor: number;
  base: number;
  contingencyAmount: number;
  total: number;
  low: number;
  high: number;
  categories: { name: string; amount: number; color: string; note: string }[];
  assumptions: string[];
  exclusions: string[];
};
export type SavedProject = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  estimate: Estimate;
};
export type User = { id: string; name: string; email: string };
