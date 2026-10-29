-- Seed data for Construction Activity Stages
INSERT OR IGNORE INTO construction_stages (id, code, name, description, default_milestone_weight, sequence_order) VALUES
('STAGE_01_FOUNDATION', 'STG-01', 'Foundation & Earthworks', 'Sub-surface ground excavation, trenching, soil retention, lean concrete, pile caps, raft foundations, and footings with rebar cages.', 10, 1),
('STAGE_02_PLINTH', 'STG-02', 'Plinth & Ground Preparation', 'Plinth beam construction, tie beams, damp-proof course (DPC), sub-base compaction, backfilling within foundation trenches.', 8, 2),
('STAGE_03_SUPERSTRUCTURE', 'STG-03', 'Structural Frame / Superstructure', 'Erection of load-bearing skeletons: RCC columns, beams, floor slabs, shear walls, structural steel trusses, and staging props.', 22, 3),
('STAGE_04_MASONRY', 'STG-04', 'Masonry & Enclosure Walls', 'External perimeter and internal partition walls using AAC blocks, clay bricks, or concrete blocks with mortar joints.', 14, 4),
('STAGE_05_FACADE', 'STG-05', 'Facade & Exterior Finishing', 'External cladding, curtain wall glazing, structural silicone glazing, exterior cement plastering, ACP panels, and louvers.', 12, 5),
('STAGE_06_ROOFING', 'STG-06', 'Roofing & Waterproofing', 'Topmost roof structure, parapet walls, terrace waterproofing membranes, screed slope laying, rainwater drainage sumps.', 8, 6),
('STAGE_07_MEP_SERVICES', 'STG-07', 'Electrical, Plumbing & HVAC (MEP)', 'Utility services: conduit piping, sanitary plumbing stacks, HVAC ductwork, fire sprinkler loops, cable trays, and risers.', 10, 7),
('STAGE_08_INTERIOR', 'STG-08', 'Interior Finishing & Partitioning', 'Gypsum board false ceilings, wall putty, internal plastering, vitrified tile flooring, door frames, and bathroom tiling.', 10, 8),
('STAGE_09_COMPLETION', 'STG-09', 'Final Finishing / Apparent Completion', 'Final coat of paint, light fittings, sanitaryware installation, glass railings, clean flooring, site clearance, landscaping.', 6, 9),
('STAGE_10_UNCLEAR', 'STG-10', 'Unknown / Insufficient Visual Evidence', 'Image lacks identifiable structural elements, exhibits extreme blur, occlusion, or non-construction subject matter.', 0, 10);
