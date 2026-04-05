-- Seed ~20 demo providers for local hackathon demo
-- Replace lat/lon with your demo city. These are San Francisco examples.

insert into public.providers (name, type, address, city, state, zip, lat, lon, phone, accepts_uninsured, sliding_scale, telehealth_only, languages, notes) values
-- Telehealth (always available)
('Teladoc Health', 'telehealth', 'Virtual', 'Nationwide', 'US', null, 37.7749, -122.4194, '1-800-835-2362', true, false, true, '{en,es}', 'Available 24/7'),
('MDLive', 'telehealth', 'Virtual', 'Nationwide', 'US', null, 37.7749, -122.4194, null, true, false, true, '{en,es}', 'Same-day appointments often available'),
('PlushCare', 'telehealth', 'Virtual', 'Nationwide', 'US', null, 37.7749, -122.4194, null, false, false, true, '{en}', 'Accepts most major insurance'),

-- SF community health centers (accepts uninsured)
('Tenderloin Health SF', 'clinic', '311 Jones St', 'San Francisco', 'CA', '94102', 37.7843, -122.4131, '(415) 292-6120', true, true, false, '{en,es,zh}', 'FQHC — sliding scale fees'),
('Mission Neighborhood Health Center', 'clinic', '240 Shotwell St', 'San Francisco', 'CA', '94110', 37.7638, -122.4174, '(415) 552-3870', true, true, false, '{en,es}', 'FQHC — sliding scale fees'),
('Southeast Health Center', 'clinic', '2401 Keith St', 'San Francisco', 'CA', '94124', 37.7268, -122.3890, '(415) 671-7000', true, true, false, '{en,es,zh}', 'FQHC'),

-- Urgent care
('CityMD Urgent Care - Castro', 'urgent_care', '4135 18th St', 'San Francisco', 'CA', '94114', 37.7610, -122.4349, '(415) 525-7400', false, false, false, '{en}', 'Walk-in, open 7 days'),
('Dignity Health GoHealth Urgent Care', 'urgent_care', '2299 Post St', 'San Francisco', 'CA', '94115', 37.7849, -122.4399, '(415) 771-4800', false, false, false, '{en}', 'Walk-in, extended hours'),
('Carbon Health - SoMa', 'urgent_care', '80 Bluxome St', 'San Francisco', 'CA', '94107', 37.7751, -122.3982, '(415) 483-2001', false, false, false, '{en,es}', 'Walk-in + telehealth'),

-- ERs
('UCSF Medical Center', 'er', '505 Parnassus Ave', 'San Francisco', 'CA', '94143', 37.7630, -122.4578, '(415) 476-1000', true, false, false, '{en,es,zh}', 'Level I Trauma Center'),
('Zuckerberg SF General Hospital', 'er', '1001 Potrero Ave', 'San Francisco', 'CA', '94110', 37.7555, -122.4059, '(415) 206-8000', true, false, false, '{en,es,zh}', 'Safety-net hospital — all patients accepted'),
('Kaiser Permanente San Francisco', 'er', '2425 Geary Blvd', 'San Francisco', 'CA', '94115', 37.7837, -122.4484, '(415) 833-2000', false, false, false, '{en,es,zh}', 'Kaiser members only'),

-- Pharmacies
('Walgreens - Castro', 'pharmacy', '498 Castro St', 'San Francisco', 'CA', '94114', 37.7619, -122.4351, '(415) 861-3136', true, false, false, '{en,es}', 'Pharmacy + MinuteClinic'),
('CVS Pharmacy - Market St', 'pharmacy', '995 Market St', 'San Francisco', 'CA', '94103', 37.7821, -122.4085, '(415) 552-4500', true, false, false, '{en}', 'MinuteClinic on-site'),
('Safeway Pharmacy', 'pharmacy', '2020 Market St', 'San Francisco', 'CA', '94114', 37.7681, -122.4342, '(415) 626-5250', true, false, false, '{en,es}', null),

-- Mental health
('RAMS Inc - Richmond Area Multi-Services', 'mental_health', '1080 Sutter St', 'San Francisco', 'CA', '94109', 37.7878, -122.4209, '(415) 567-4120', true, true, false, '{en,es,zh}', 'Sliding scale mental health services'),
('SF DPH Behavioral Health', 'mental_health', '1380 Howard St', 'San Francisco', 'CA', '94103', 37.7736, -122.4148, '(415) 255-3737', true, true, false, '{en,es,zh}', 'Public mental health — accepts Medi-Cal'),

-- Student health
('UCSF Student Health Services', 'clinic', '500 Parnassus Ave', 'San Francisco', 'CA', '94143', 37.7628, -122.4584, '(415) 476-1281', false, false, false, '{en}', 'UCSF students only');
