import { DepartmentConfig, DepartmentId } from './types';

export const DEPARTMENTS: Record<DepartmentId, DepartmentConfig> = {
  building: {
    id: 'building',
    name: 'Building Department',
    shortName: 'Building',
    colorPrimary: '#1D4ED8',
    colorDark: '#1E3A8A',
    colorLight: '#EFF6FF',
    colorBorder: '#BFDBFE',
    codeAuthorities: ['IBC 2021', 'IECC 2021', 'DC Construction Codes 2020'],
    jurisdiction: 'DC DCRA',
  },
  fire: {
    id: 'fire',
    name: 'Fire Marshal',
    shortName: 'Fire',
    colorPrimary: '#DC2626',
    colorDark: '#991B1B',
    colorLight: '#FEF2F2',
    colorBorder: '#FECACA',
    codeAuthorities: ['IFC 2021', 'NFPA 101', 'NFPA 96', 'DC Fire Prevention Code'],
    jurisdiction: 'DC Fire and EMS',
  },
  ada: {
    id: 'ada',
    name: 'Accessibility Office',
    shortName: 'ADA',
    colorPrimary: '#059669',
    colorDark: '#065F46',
    colorLight: '#ECFDF5',
    colorBorder: '#A7F3D0',
    codeAuthorities: ['ADA 2010 Standards', 'ANSI A117.1', 'DC Accessibility Code'],
    jurisdiction: 'DC OHR / DCRA',
  },
  zoning: {
    id: 'zoning',
    name: 'Zoning Administration',
    shortName: 'Zoning',
    colorPrimary: '#7C3AED',
    colorDark: '#4C1D95',
    colorLight: '#F5F3FF',
    colorBorder: '#DDD6FE',
    codeAuthorities: ['DC Zoning Regulations 2016', 'DC Municipal Regulations Title 11'],
    jurisdiction: 'DC DCRA Zoning',
  },
  health: {
    id: 'health',
    name: 'Health Department',
    shortName: 'Health',
    colorPrimary: '#EA580C',
    colorDark: '#9A3412',
    colorLight: '#FFF7ED',
    colorBorder: '#FED7AA',
    codeAuthorities: ['FDA Food Code 2022', 'DC Health Code Title 25'],
    jurisdiction: 'DC DOH',
  },
  mep: {
    id: 'mep',
    name: 'MEP Review',
    shortName: 'MEP',
    colorPrimary: '#D97706',
    colorDark: '#92400E',
    colorLight: '#FFFBEB',
    colorBorder: '#FDE68A',
    codeAuthorities: ['IPC 2021', 'IMC 2021', 'NFPA 70', 'DC Mechanical Code'],
    jurisdiction: 'DC DCRA MEP',
  },
};

export const DEMO_APP_ID = 'APP-2026-4471';
export const DEMO_ADDRESS = '2247 18th St NW, Washington, DC 20009';
export const DEMO_DEPARTMENTS: DepartmentId[] = ['building', 'fire', 'ada', 'zoning'];

export const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  ai_reviewing: 'AI Review Running',
  dept_review: 'Under Departmental Review',
  approved: 'Approved',
  conditional: 'Conditional Approval',
  rejected: 'Rejected',
  resubmission_required: 'Resubmission Required',
};

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
