/**
 * Production Construction Management Domain Data
 * Specialized for Real Building Construction Projects (CPWD / FIDIC / NBC 2016)
 */

export interface DailySiteReport {
  id: string;
  projectId: string;
  date: string;
  shift: 'DAY' | 'NIGHT';
  weather: string;
  temperature: string;
  residentEngineer: string;
  shiftSupervisor: string;
  summary: string;
  activitiesCompleted: string[];
  equipmentDeployed: { name: string; hoursOperated: number; status: 'OPERATIONAL' | 'STANDBY' | 'MAINTENANCE' }[];
  safetyObservations: string;
  materialsReceivedSummary: string;
  delaysOrBottlenecks?: string;
  photoUrl?: string;
}

export interface ConstructionMilestone {
  id: string;
  projectId: string;
  code: string;
  name: string;
  stageId: string;
  plannedStartDate: string;
  plannedFinishDate: string;
  forecastFinishDate: string;
  plannedProgressPercent: number;
  actualProgressPercent: number;
  status: 'COMPLETED' | 'ON_TRACK' | 'AT_RISK' | 'DELAYED';
  assignedContractor: string;
  isCriticalPath: boolean;
  delayDays: number;
}

export interface LabourAttendanceRecord {
  id: string;
  projectId: string;
  date: string;
  trade: string;
  contractor: string;
  plannedCount: number;
  actualCount: number;
  shift: 'DAY' | 'NIGHT';
  notes?: string;
}

export interface MaterialInventoryItem {
  id: string;
  projectId: string;
  itemCode: string;
  name: string;
  specification: string;
  unit: string;
  boqQuantity: number;
  cumulativeConsumed: number;
  currentStock: number;
  minimumThreshold: number;
  dailyConsumption: number;
  lastDeliveryDate: string;
  qaCertificateStatus: 'NABL_TEST_PASSED' | 'PENDING_LAB_TEST' | 'MILL_TC_VERIFIED';
}

export interface ProjectFinancials {
  projectId: string;
  currency: string;
  totalContractValue: number; // in Lakhs / Crores
  certifiedMilestoneBilling: number;
  paidToDate: number;
  retentionWithheld: number;
  budgetUtilizationPercent: number;
  schedulePerformanceIndex: number; // SPI
  costPerformanceIndex: number; // CPI
  packages: {
    packageName: string;
    allocatedCost: number;
    spentToDate: number;
    progressPercent: number;
    status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  }[];
}

export interface SafetyIncidentItem {
  id: string;
  projectId: string;
  date: string;
  type: 'TOOLBOX_TALK' | 'NEAR_MISS' | 'PPE_NON_COMPLIANCE' | 'FIRST_AID' | 'HOUSEKEEPING';
  severity: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
  actionTaken: string;
  reportedBy: string;
  status: 'CLOSED' | 'OPEN' | 'UNDER_REVIEW';
}

export interface ProjectDocumentItem {
  id: string;
  projectId: string;
  docNumber: string;
  title: string;
  discipline: 'STRUCTURAL' | 'ARCHITECTURAL' | 'MEP' | 'GEOTECHNICAL' | 'CONTRACTUAL';
  revision: string;
  status: 'GFC_APPROVED' | 'FOR_REVIEW' | 'SUPERSEDED';
  issueDate: string;
  authorizingBody: string;
  fileSizeBytes: number;
}

export const INITIAL_DAILY_REPORTS: DailySiteReport[] = [
  {
    id: 'dpr-blr-101',
    projectId: 'proj-blr-01',
    date: '2026-10-28',
    shift: 'DAY',
    weather: 'Clear / Dry',
    temperature: '28°C',
    residentEngineer: 'Er. Rajesh K. Sharma',
    shiftSupervisor: 'Er. M. Venkatesh (L&T)',
    summary: 'Concrete pouring for Level 4 suspended slab (Grid C3-G8) completed using mobile boom pump. Formwork strike-off for Level 2 interior walls inspected.',
    activitiesCompleted: [
      'Discharged 85 m³ M35 grade ready-mix concrete for slab pour',
      'Took 6 cube test specimens (3-day, 7-day, 28-day testing as per IS 516)',
      'Continued AAC masonry block laying on Level 2 east wing',
      'Conduit rough-in for fire alarm and electrical ceiling loops'
    ],
    equipmentDeployed: [
      { name: 'Potain Tower Crane TC-1', hoursOperated: 8.5, status: 'OPERATIONAL' },
      { name: 'Schwing Stetter Boom Pump 36m', hoursOperated: 5.0, status: 'OPERATIONAL' },
      { name: 'JCB 3DX Backhoe Loader', hoursOperated: 3.5, status: 'STANDBY' },
      { name: 'DG Set 250 kVA Backup', hoursOperated: 1.0, status: 'STANDBY' }
    ],
    safetyObservations: '100% hard hat and safety harness compliance observed during slab edge work. Edge protection railings installed on north perimeter.',
    materialsReceivedSummary: '3 transit mixers M35 RMC (21 m³), 25 MT Fe500D rebar bundle, 400 AAC blocks.',
    delaysOrBottlenecks: 'Minor 30-min pump line repositioning at 14:00; overall pour schedule maintained on critical path.',
    photoUrl: '/src/assets/images/construction_superstructure_stage_1792592933145.jpg'
  },
  {
    id: 'dpr-blr-102',
    projectId: 'proj-blr-01',
    date: '2026-10-27',
    shift: 'DAY',
    weather: 'Partly Cloudy',
    temperature: '27°C',
    residentEngineer: 'Er. Rajesh K. Sharma',
    shiftSupervisor: 'Er. M. Venkatesh (L&T)',
    summary: 'Rebar reinforcement checking and pre-pour shuttering inspection conducted with third-party consultant for Level 4 casting.',
    activitiesCompleted: [
      'Approved bar bending schedule verification for main span post-tensioned tendons',
      'Completed lean concrete bed curing under water ponding test',
      'Installed MEP drainage sleeves on bathroom shaft risers'
    ],
    equipmentDeployed: [
      { name: 'Potain Tower Crane TC-1', hoursOperated: 7.0, status: 'OPERATIONAL' },
      { name: 'Rebar Cutting & Bending Yard Machine', hoursOperated: 8.0, status: 'OPERATIONAL' }
    ],
    safetyObservations: 'Conducted morning toolbox briefing for 148 workers regarding lifting hazard exclusion zones under tower crane swing radius.',
    materialsReceivedSummary: '500 bags Ultratech OPC 53 cement, 12 rolls curing hessian cloth.',
    photoUrl: '/src/assets/images/construction_foundation_stage_1792592932880.jpg'
  },
  {
    id: 'dpr-pune-201',
    projectId: 'proj-pune-02',
    date: '2026-10-28',
    shift: 'DAY',
    weather: 'Mild Breeze',
    temperature: '26°C',
    residentEngineer: 'Er. Sunil Jadhav',
    shiftSupervisor: 'Er. Aniket Joshi (Tata-Siemens JV)',
    summary: 'Segmental box girder erection for Span P14-P15 completed using 160T launching gantry. High-tensile pre-stressing strands threaded.',
    activitiesCompleted: [
      'Positioned 8 precast segments with epoxy jointing compound',
      'Applied 25% initial prestressing force as per structural schedule',
      'Pier 16 reinforcement cage lowering and alignment verification'
    ],
    equipmentDeployed: [
      { name: 'Launching Gantry LG-160T', hoursOperated: 9.0, status: 'OPERATIONAL' },
      { name: 'Telescopic Crane 75T', hoursOperated: 6.5, status: 'OPERATIONAL' }
    ],
    safetyObservations: 'Traffic marshals deployed on Hinjawadi corridor under-deck lane. Zero safety incidents reported.',
    materialsReceivedSummary: '8 Precast segmental box girders from Urse casting yard, 50 cans Araldite epoxy bonding agent.',
    photoUrl: '/src/assets/images/construction_facade_finishing_1792592933719.jpg'
  }
];

export const INITIAL_MILESTONES: ConstructionMilestone[] = [
  {
    id: 'mls-01',
    projectId: 'proj-blr-01',
    code: 'MS-FND',
    name: 'Sub-Basement & Raft Foundation',
    stageId: 'STAGE_01_FOUNDATION',
    plannedStartDate: '2025-04-15',
    plannedFinishDate: '2025-07-30',
    forecastFinishDate: '2025-07-28',
    plannedProgressPercent: 100,
    actualProgressPercent: 100,
    status: 'COMPLETED',
    assignedContractor: 'L&T GeoStructure Division',
    isCriticalPath: true,
    delayDays: 0
  },
  {
    id: 'mls-02',
    projectId: 'proj-blr-01',
    code: 'MS-PLN',
    name: 'Plinth Beam & Ground Level Retaining Tie',
    stageId: 'STAGE_02_PLINTH',
    plannedStartDate: '2025-08-01',
    plannedFinishDate: '2025-09-30',
    forecastFinishDate: '2025-09-25',
    plannedProgressPercent: 100,
    actualProgressPercent: 100,
    status: 'COMPLETED',
    assignedContractor: 'L&T Civil Building Works',
    isCriticalPath: true,
    delayDays: 0
  },
  {
    id: 'mls-03',
    projectId: 'proj-blr-01',
    code: 'MS-STR-L1-6',
    name: 'RCC Superstructure Frame (Floors 1 to 6)',
    stageId: 'STAGE_03_SUPERSTRUCTURE',
    plannedStartDate: '2025-10-01',
    plannedFinishDate: '2026-04-30',
    forecastFinishDate: '2026-05-10',
    plannedProgressPercent: 80,
    actualProgressPercent: 74,
    status: 'AT_RISK',
    assignedContractor: 'Larsen & Toubro ECC Division',
    isCriticalPath: true,
    delayDays: 10
  },
  {
    id: 'mls-04',
    projectId: 'proj-blr-01',
    code: 'MS-MAS-L1-4',
    name: 'AAC Block Masonry & Perimeter Enclosure (Floors 1-4)',
    stageId: 'STAGE_04_MASONRY',
    plannedStartDate: '2026-01-15',
    plannedFinishDate: '2026-06-30',
    forecastFinishDate: '2026-06-25',
    plannedProgressPercent: 45,
    actualProgressPercent: 48,
    status: 'ON_TRACK',
    assignedContractor: 'Skyline Masonry Sub-contractors',
    isCriticalPath: false,
    delayDays: 0
  },
  {
    id: 'mls-05',
    projectId: 'proj-blr-01',
    code: 'MS-FAC-EXT',
    name: 'Unitized Curtain Wall & Glazing Facade',
    stageId: 'STAGE_05_FACADE',
    plannedStartDate: '2026-05-01',
    plannedFinishDate: '2026-11-30',
    forecastFinishDate: '2026-11-30',
    plannedProgressPercent: 10,
    actualProgressPercent: 8,
    status: 'ON_TRACK',
    assignedContractor: 'Permasteelisa India Glazing',
    isCriticalPath: false,
    delayDays: 0
  },
  {
    id: 'mls-06',
    projectId: 'proj-blr-01',
    code: 'MS-MEP-HVAC',
    name: 'HVAC Ducting, Firefighting & Electrical Trays',
    stageId: 'STAGE_07_MEP_SERVICES',
    plannedStartDate: '2026-03-01',
    plannedFinishDate: '2026-12-15',
    forecastFinishDate: '2026-12-15',
    plannedProgressPercent: 25,
    actualProgressPercent: 26,
    status: 'ON_TRACK',
    assignedContractor: 'Voltas MEP Systems',
    isCriticalPath: false,
    delayDays: 0
  }
];

export const INITIAL_LABOUR_ATTENDANCE: LabourAttendanceRecord[] = [
  { id: 'lab-01', projectId: 'proj-blr-01', date: '2026-10-28', trade: 'Steel Fixers & Barbenders', contractor: 'L&T Reinforcement', plannedCount: 38, actualCount: 36, shift: 'DAY', notes: 'Active on Level 4 post-tensioning zone' },
  { id: 'lab-02', projectId: 'proj-blr-01', date: '2026-10-28', trade: 'Shuttering Carpenters', contractor: 'L&T Formwork', plannedCount: 32, actualCount: 30, shift: 'DAY', notes: 'Level 5 slab shuttering preparation' },
  { id: 'lab-03', projectId: 'proj-blr-01', date: '2026-10-28', trade: 'Masons & Helpers', contractor: 'Skyline Contractors', plannedCount: 45, actualCount: 42, shift: 'DAY', notes: 'Level 2 & 3 AAC block infill' },
  { id: 'lab-04', projectId: 'proj-blr-01', date: '2026-10-28', trade: 'Concreting Gang (RMC)', contractor: 'L&T Pours', plannedCount: 20, actualCount: 20, shift: 'DAY', notes: 'Slab pour & surface screed leveling' },
  { id: 'lab-05', projectId: 'proj-blr-01', date: '2026-10-28', trade: 'MEP Technicians & Electricians', contractor: 'Voltas MEP', plannedCount: 16, actualCount: 14, shift: 'DAY', notes: 'Conduit laying & plumbing sleeves' },
  { id: 'lab-06', projectId: 'proj-blr-01', date: '2026-10-28', trade: 'QA/QC & HSE Safety Marshals', contractor: 'BuildSight PMC', plannedCount: 8, actualCount: 8, shift: 'DAY', notes: 'Continuous site safety audit & sampling' }
];

export const INITIAL_MATERIALS_INVENTORY: MaterialInventoryItem[] = [
  {
    id: 'mat-01',
    projectId: 'proj-blr-01',
    itemCode: 'TMT-FE500D',
    name: 'TMT High-Yield Rebar (Fe500D)',
    specification: 'IS 1786 Certified Primary Steel (Tata Tiscon / JSW)',
    unit: 'Metric Tonnes (MT)',
    boqQuantity: 2850,
    cumulativeConsumed: 1240,
    currentStock: 145,
    minimumThreshold: 40,
    dailyConsumption: 12.5,
    lastDeliveryDate: '2026-10-26',
    qaCertificateStatus: 'NABL_TEST_PASSED'
  },
  {
    id: 'mat-02',
    projectId: 'proj-blr-01',
    itemCode: 'CEM-OPC53',
    name: 'Ordinary Portland Cement (OPC 53)',
    specification: 'IS 12269 Grade (Ultratech / ACC)',
    unit: '50kg Bags',
    boqQuantity: 65000,
    cumulativeConsumed: 26800,
    currentStock: 1250,
    minimumThreshold: 400,
    dailyConsumption: 180,
    lastDeliveryDate: '2026-10-27',
    qaCertificateStatus: 'NABL_TEST_PASSED'
  },
  {
    id: 'mat-03',
    projectId: 'proj-blr-01',
    itemCode: 'RMC-M35',
    name: 'Ready-Mix Concrete Grade M35',
    specification: 'IS 456 Design Mix with microsilica for durability',
    unit: 'Cubic Meters (m³)',
    boqQuantity: 14200,
    cumulativeConsumed: 5980,
    currentStock: 85,
    minimumThreshold: 20,
    dailyConsumption: 85,
    lastDeliveryDate: '2026-10-28',
    qaCertificateStatus: 'NABL_TEST_PASSED'
  },
  {
    id: 'mat-04',
    projectId: 'proj-blr-01',
    itemCode: 'BLK-AAC-150',
    name: 'AAC Blocks (600 x 200 x 150mm)',
    specification: 'Grade 1 Autoclaved Aerated Concrete IS 2185 Part 3',
    unit: 'Blocks (Nos)',
    boqQuantity: 120000,
    cumulativeConsumed: 48500,
    currentStock: 6800,
    minimumThreshold: 2000,
    dailyConsumption: 650,
    lastDeliveryDate: '2026-10-25',
    qaCertificateStatus: 'MILL_TC_VERIFIED'
  },
  {
    id: 'mat-05',
    projectId: 'proj-blr-01',
    itemCode: 'GLZ-DGU-CURT',
    name: 'Double Glazed Unit (DGU) Glass Panels',
    specification: 'Low-E Acoustic Spectrally Selective Toughened Glazing',
    unit: 'Sq. Meters (m²)',
    boqQuantity: 18500,
    cumulativeConsumed: 1200,
    currentStock: 850,
    minimumThreshold: 300,
    dailyConsumption: 40,
    lastDeliveryDate: '2026-10-20',
    qaCertificateStatus: 'MILL_TC_VERIFIED'
  }
];

export const INITIAL_PROJECT_FINANCIALS: Record<string, ProjectFinancials> = {
  'proj-blr-01': {
    projectId: 'proj-blr-01',
    currency: 'INR (₹ Crores)',
    totalContractValue: 48.50,
    certifiedMilestoneBilling: 20.37,
    paidToDate: 19.12,
    retentionWithheld: 1.02,
    budgetUtilizationPercent: 42.0,
    schedulePerformanceIndex: 0.96, // slight schedule variance
    costPerformanceIndex: 1.02, // slightly under budget (favorable)
    packages: [
      { packageName: 'Piling, Deep Excavation & Substructure', allocatedCost: 9.80, spentToDate: 9.65, progressPercent: 100, status: 'HEALTHY' },
      { packageName: 'RCC Structural Frame & Post-Tensioning', allocatedCost: 17.50, spentToDate: 8.20, progressPercent: 48, status: 'HEALTHY' },
      { packageName: 'AAC Blockwork & Interior Masonry', allocatedCost: 4.80, spentToDate: 1.50, progressPercent: 32, status: 'HEALTHY' },
      { packageName: 'Curtain Wall Facade & Exterior Louvers', allocatedCost: 8.20, spentToDate: 0.85, progressPercent: 10, status: 'HEALTHY' },
      { packageName: 'Electrical, Plumbing & Fire MEP Systems', allocatedCost: 8.20, spentToDate: 1.17, progressPercent: 14, status: 'HEALTHY' }
    ]
  },
  'proj-pune-02': {
    projectId: 'proj-pune-02',
    currency: 'INR (₹ Crores)',
    totalContractValue: 124.00,
    certifiedMilestoneBilling: 79.36,
    paidToDate: 75.20,
    retentionWithheld: 3.96,
    budgetUtilizationPercent: 64.0,
    schedulePerformanceIndex: 1.01,
    costPerformanceIndex: 1.00,
    packages: [
      { packageName: 'Foundation Piles & Pier Caps', allocatedCost: 35.00, spentToDate: 35.00, progressPercent: 100, status: 'HEALTHY' },
      { packageName: 'Precast Segment Erection & Post-Tensioning', allocatedCost: 55.00, spentToDate: 34.10, progressPercent: 62, status: 'HEALTHY' },
      { packageName: 'Station Structural Steel Roof Trusses', allocatedCost: 20.00, spentToDate: 7.20, progressPercent: 36, status: 'HEALTHY' },
      { packageName: 'Traction Power & Overhead Signaling', allocatedCost: 14.00, spentToDate: 3.06, progressPercent: 22, status: 'HEALTHY' }
    ]
  }
};

export const INITIAL_SAFETY_INCIDENTS: SafetyIncidentItem[] = [
  {
    id: 'sft-01',
    projectId: 'proj-blr-01',
    date: '2026-10-28',
    type: 'TOOLBOX_TALK',
    severity: 'INFO',
    description: 'Conducted mandatory working-at-heights briefing and checked double-lanyard full body harnesses for 32 shuttering carpenters.',
    actionTaken: 'All 32 workers signed safety attendance sheet. 2 worn lanyards replaced immediately.',
    reportedBy: 'HSE Safety Officer K. Ramanathan',
    status: 'CLOSED'
  },
  {
    id: 'sft-02',
    projectId: 'proj-blr-01',
    date: '2026-10-27',
    type: 'HOUSEKEEPING',
    severity: 'LOW',
    description: 'Protruding rebar binding wires and timber scrap noted near Tower Crane stair access way on Level 3.',
    actionTaken: 'Housekeeping squad deployed to clear passage within 45 minutes. Rebar safety caps fitted on exposed starters.',
    reportedBy: 'Er. Rajesh K. Sharma',
    status: 'CLOSED'
  },
  {
    id: 'sft-03',
    projectId: 'proj-blr-01',
    date: '2026-10-24',
    type: 'PPE_NON_COMPLIANCE',
    severity: 'LOW',
    description: 'Two subcontractor masonry helpers observed without protective safety goggles during block cutting operation.',
    actionTaken: 'Work paused. Anti-fog safety goggles issued. Verbal warning issued to subcontractor lead with penalty log.',
    reportedBy: 'HSE Safety Officer K. Ramanathan',
    status: 'CLOSED'
  }
];

export const INITIAL_DOCUMENTS: ProjectDocumentItem[] = [
  {
    id: 'doc-01',
    projectId: 'proj-blr-01',
    docNumber: 'STR-BLR-DWG-L4-012-R3',
    title: 'Good for Construction (GFC) Level 4 Floor Slab & Beam Rebar Details',
    discipline: 'STRUCTURAL',
    revision: 'Rev 03 (Approved)',
    status: 'GFC_APPROVED',
    issueDate: '2026-10-15',
    authorizingBody: 'Sterling Structural Engineering Consultants',
    fileSizeBytes: 14850000
  },
  {
    id: 'doc-02',
    projectId: 'proj-blr-01',
    docNumber: 'ARC-BLR-FAC-008-R2',
    title: 'Unitized Curtain Wall Facade Mullion Anchor Layout & Spandrel Details',
    discipline: 'ARCHITECTURAL',
    revision: 'Rev 02 (Approved)',
    status: 'GFC_APPROVED',
    issueDate: '2026-10-02',
    authorizingBody: 'Morphogenesis Architecture Studio',
    fileSizeBytes: 22400000
  },
  {
    id: 'doc-03',
    projectId: 'proj-blr-01',
    docNumber: 'MEP-BLR-FP-L1-L6-R1',
    title: 'Fire Protection Sprinkler Distribution & Wet Riser Schematics',
    discipline: 'MEP',
    revision: 'Rev 01 (Approved)',
    status: 'GFC_APPROVED',
    issueDate: '2026-09-18',
    authorizingBody: 'Encon MEP Services Pvt Ltd',
    fileSizeBytes: 8750000
  },
  {
    id: 'doc-04',
    projectId: 'proj-blr-01',
    docNumber: 'GEO-BLR-SOIL-REPT-FINAL',
    title: 'Geotechnical Soil Investigation & Standard Penetration Test (SPT) Logs',
    discipline: 'GEOTECHNICAL',
    revision: 'Final',
    status: 'GFC_APPROVED',
    issueDate: '2025-03-20',
    authorizingBody: 'IIT Madras Geotech Laboratory',
    fileSizeBytes: 6200000
  }
];
