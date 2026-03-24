-- Seed the 25-item decoration catalog
-- created_by is NULL for system-seeded items (allowed by schema)
INSERT INTO public.decoration_items (item_id, name, type, category, attachment_node, color_hex, emoji, price_carrots, created_by)
VALUES
  -- HEADWEAR (8–12 carrots)
  ('floral_wreath',     'Floral Wreath',      'other', 'headwear', 'Head_Top', '#E5E5FA', '🌸', 10, NULL),
  ('beret',             'Beret',              'other', 'headwear', 'Head_Top', '#FFB858', '🎩', 8,  NULL),
  ('ear_ribbons',       'Ear Ribbons',        'other', 'headwear', 'Ear_Tip',  '#8BFF98', '🎀', 8,  NULL),
  ('beanie',            'Beanie',             'other', 'headwear', 'Head_Top', '#46464F', '🧢', 10, NULL),
  ('top_hat',           'Top Hat',            'other', 'headwear', 'Head_Top', '#4160E1', '🎩', 12, NULL),

  -- TOPS (10–15 carrots)
  ('graphic_tee',       'Graphic Tee',        'dress', 'tops',     'MidSection', '#FFB000', '👕', 10, NULL),
  ('ear_stitch_hoodie', 'Ear-Stitch Hoodie',  'dress', 'tops',     'MidSection', '#FFD1DC', '🧥', 12, NULL),
  ('knit_sweater',      'Knit Sweater',       'dress', 'tops',     'MidSection', '#228B22', '🧶', 12, NULL),
  ('denim_vest',        'Denim Vest',         'dress', 'tops',     'MidSection', '#4B6CB7', '🦺', 13, NULL),
  ('rain_poncho',       'Rain Poncho',        'dress', 'tops',     'MidSection', '#00B0B0', '🌧️', 15, NULL),

  -- BOTTOMS (10–15 carrots)
  ('pleated_skirt',     'Pleated Skirt',      'dress', 'bottoms',  'Tail_Base',  '#DC143C', '👗', 12, NULL),
  ('cargo_shorts',      'Cargo Shorts',       'dress', 'bottoms',  'Tail_Base',  '#C3A882', '🩳', 10, NULL),
  ('frilly_tutu',       'Frilly Tutu',        'dress', 'bottoms',  'Tail_Base',  '#FFF0D0', '🩰', 15, NULL),
  ('track_pants',       'Track Pants',        'dress', 'bottoms',  'Tail_Base',  '#CC44CC', '🩳', 11, NULL),
  ('denim_overalls',    'Denim Overalls',     'dress', 'bottoms',  'Tail_Base',  '#6B8F71', '👖', 14, NULL),

  -- FOOTWEAR (8–12 carrots)
  ('chunky_sneakers',   'Chunky Sneakers',    'other', 'footwear', 'Paw_L',     '#FFB6C1', '👟', 10, NULL),
  ('mary_janes',        'Mary Janes',         'other', 'footwear', 'Paw_L',     '#191970', '👞', 10, NULL),
  ('rubber_wellies',    'Rubber Wellies',     'other', 'footwear', 'Paw_L',     '#87CEEB', '🥾', 8,  NULL),
  ('canvas_slips',      'Canvas Slips',       'other', 'footwear', 'Paw_L',     '#FFE001', '👟', 8,  NULL),
  ('hiking_boots',      'Hiking Boots',       'other', 'footwear', 'Paw_L',     '#8B4513', '🥾', 12, NULL),

  -- ACCESSORIES (5–10 carrots)
  ('carrot_satchel',    'Carrot Satchel',     'other', 'acc',      'MidSection', '#ED9121', '👜', 8,  NULL),
  ('silk_scarf',        'Silk Scarf',         'necklace', 'acc',   'Neck',       '#FFD700', '🧣', 7,  NULL),
  ('heart_glasses',     'Heart Glasses',      'other', 'acc',      'Head_Top',  '#FF69B4', '🕶️', 6,  NULL),
  ('tiny_backpack',     'Tiny Backpack',      'other', 'acc',      'MidSection', '#6B8E23', '🎒', 9,  NULL),
  ('jeweled_collar',    'Jeweled Collar',     'necklace', 'acc',   'Neck',       '#2DC87E', '📿', 10, NULL)

ON CONFLICT (item_id) DO NOTHING;
