import { ConstructionStage, ConstructionStageId } from '../types';

export const CONSTRUCTION_STAGES: ConstructionStage[] = [
  {
    id: 'STAGE_01_FOUNDATION',
    code: 'STG-01',
    name: 'Foundation & Earthworks',
    description: 'Sub-surface ground excavation, trenching, soil retention, mud mat/lean concrete, pile caps, raft foundations, and isolated footings with dense steel rebar cages.',
    keyIndicators: [
      'Excavation pits, earth moving equipment (JCB, excavators)',
      'Steel rebar cages for columns and footings',
      'Timber or steel shuttering/formwork below ground level',
      'Poured footings, raft slabs, blinding concrete layer'
    ],
    defaultMilestoneWeight: 10,
    sequenceOrder: 1,
  },
  {
    id: 'STAGE_02_PLINTH',
    code: 'STG-02',
    name: 'Plinth & Ground Preparation',
    description: 'Plinth beam construction, tie beams, damp-proof course (DPC), sub-base compaction, backfilling within foundation trenches, and ground slab preparation.',
    keyIndicators: [
      'Continuous horizontal plinth beams cast at ground level',
      'Backfilled compacted gravel or earth within plinth perimeter',
      'Damp proof membrane or bituminous coating application',
      'Ground floor slab sub-base rebar reinforcement'
    ],
    defaultMilestoneWeight: 8,
    sequenceOrder: 2,
  },
  {
    id: 'STAGE_03_SUPERSTRUCTURE',
    code: 'STG-03',
    name: 'Structural Frame / Superstructure',
    description: 'Erection of load-bearing structural skeletons: reinforced concrete (RCC) columns, beams, floor slabs, shear walls, structural steel trusses, and staging props.',
    keyIndicators: [
      'Vertical RCC columns rising across multiple levels',
      'Suspended horizontal beams and slab shuttering/props',
      'Tower cranes, concrete pump booms, and pouring buckets',
      'Open skeleton without perimeter wall enclosures'
    ],
    defaultMilestoneWeight: 22,
    sequenceOrder: 3,
  },
  {
    id: 'STAGE_04_MASONRY',
    code: 'STG-04',
    name: 'Masonry & Enclosure Walls',
    description: 'Laying of external perimeter walls and internal partition walls using autoclave aerated concrete (AAC) blocks, red clay burnt bricks, fly-ash bricks, or concrete blocks.',
    keyIndicators: [
      'Infill blockwork or brickwork between RCC structural frames',
      'Window and door opening voids with precast lintels',
      'Mortar mixing troughs, masons at work on perimeter scaffolding',
      'Course lines, plumb-bob lines, wall ties into columns'
    ],
    defaultMilestoneWeight: 14,
    sequenceOrder: 4,
  },
  {
    id: 'STAGE_05_FACADE',
    code: 'STG-05',
    name: 'Facade & Exterior Finishing',
    description: 'Application of external cladding, unitized curtain wall glazing, structural silicone glazing, exterior cement plastering, aluminum composite panels (ACP), and louvers.',
    keyIndicators: [
      'Suspended cradle scaffolding / mast climbers on exterior',
      'Glass curtain wall panels, spandrel glass, mullions and transoms',
      'External rough-cast or sponge plaster finish',
      'Exterior weather-shield primer/paint or composite panels'
    ],
    defaultMilestoneWeight: 12,
    sequenceOrder: 5,
  },
  {
    id: 'STAGE_06_ROOFING',
    code: 'STG-06',
    name: 'Roofing & Waterproofing',
    description: 'Construction of the topmost roof structure, parapet walls, terrace waterproofing membranes, screed slope laying, rainwater drainage sumps, and skylights.',
    keyIndicators: [
      'Terrace perimeter parapet walls and coping stones',
      'Bituminous waterproofing sheets, elastomeric liquid membranes',
      'Slope screed concrete to drainage spouts',
      'Overhead tank foundations, elevator motor room roof slabs'
    ],
    defaultMilestoneWeight: 8,
    sequenceOrder: 6,
  },
  {
    id: 'STAGE_07_MEP_SERVICES',
    code: 'STG-07',
    name: 'Electrical, Plumbing & HVAC (MEP)',
    description: 'First and second fix building utility services: conduit piping, sanitary plumbing stacks, HVAC ductwork, fire sprinkler loops, electrical cable trays, and risers.',
    keyIndicators: [
      'Ceiling-suspended galvanized steel ductwork and cable trays',
      'Red fire sprinkler distribution pipes with pendant dropheads',
      'UPVC/CPVC drainage and water supply pipe risers',
      'Embedded wall conduits, junction boxes, and distribution boards'
    ],
    defaultMilestoneWeight: 10,
    sequenceOrder: 7,
  },
  {
    id: 'STAGE_08_INTERIOR',
    code: 'STG-08',
    name: 'Interior Finishing & Partitioning',
    description: 'Gypsum board false ceilings, wall putty, internal plastering, vitrified tile / granite flooring, door frame installation, and bathroom tiling.',
    keyIndicators: [
      'Lightweight metal frame drywall studs and gypsum boards',
      'Floor screeding, vitrified floor tile adhesive and spacers',
      'White cement wall putty application, smooth plastered surfaces',
      'Concealed plumbing fixtures and electrical faceplate cutouts'
    ],
    defaultMilestoneWeight: 10,
    sequenceOrder: 8,
  },
  {
    id: 'STAGE_09_COMPLETION',
    code: 'STG-09',
    name: 'Final Finishing / Apparent Completion',
    description: 'Final coat of paint, architectural light fittings, sanitaryware installation, glass railings, clean flooring, site clearance, landscaping, and pre-handover readiness.',
    keyIndicators: [
      'Fully installed light fixtures, switches, architectural hardware',
      'Polished floor finish, painted walls without bare patches',
      'Site debris cleared, temporary scaffolding removed',
      'Paved driveways, entrance lobby finishing, external landscaping'
    ],
    defaultMilestoneWeight: 6,
    sequenceOrder: 9,
  },
  {
    id: 'STAGE_10_UNCLEAR',
    code: 'STG-10',
    name: 'Unknown / Insufficient Visual Evidence',
    description: 'Image lacks identifiable structural elements, exhibits extreme blur, occlusion, non-construction subject matter, or inadequate field of view for reliable classification.',
    keyIndicators: [
      'Extreme blur, excessive lens flare, night-time darkness',
      'Off-site non-construction imagery (office desks, pets, landscapes)',
      'Severe foreground occlusion blocking entire building view',
      'Macro close-up of a single detached screw or unlabelled material'
    ],
    defaultMilestoneWeight: 0,
    sequenceOrder: 10,
  },
];

export const STAGE_MAP = new Map<ConstructionStageId, ConstructionStage>(
  CONSTRUCTION_STAGES.map((s) => [s.id, s])
);

export function getStageById(id: ConstructionStageId): ConstructionStage {
  return STAGE_MAP.get(id) || CONSTRUCTION_STAGES[9];
}
