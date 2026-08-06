-- =============================================================================
-- SEED DATA FOR LOCAL DEVELOPMENT & DEMO TESTING ONLY
-- WARNING: NEVER RUN THIS SEED IN PRODUCTION ENVIRONMENTS.
-- Contains hardcoded mock credentials, default passwords, and sample test profiles.
-- =============================================================================

-- 1. Insert auth users
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, aud, role, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change_token_current, reauthentication_token, email_change
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000000',
  'alex@example.com',
  crypt('Password123!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"display_name":"Alex Rivera"}',
  'authenticated',
  'authenticated',
  NOW(),
  NOW(),
  '', '', '', '', '', ''
), (
  '22222222-2222-2222-2222-222222222222',
  '00000000-0000-0000-0000-000000000000',
  'taylor@example.com',
  crypt('Password123!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"display_name":"Taylor Reed"}',
  'authenticated',
  'authenticated',
  NOW(),
  NOW(),
  '', '', '', '', '', ''
) ON CONFLICT (id) DO NOTHING;

-- 1b. Insert auth identities (required for GoTrue Auth)
INSERT INTO auth.identities (
  id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
) VALUES 
(
  '11111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  jsonb_build_object('sub', '11111111-1111-1111-1111-111111111111', 'email', 'alex@example.com', 'email_verified', true, 'phone_verified', false),
  'email',
  NOW(),
  NOW(),
  NOW()
),
(
  '22222222-2222-2222-2222-222222222222',
  '22222222-2222-2222-2222-222222222222',
  '22222222-2222-2222-2222-222222222222',
  jsonb_build_object('sub', '22222222-2222-2222-2222-222222222222', 'email', 'taylor@example.com', 'email_verified', true, 'phone_verified', false),
  'email',
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- 2. Update profiles
UPDATE public.profiles
SET 
  avatar_url = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  relationship_status = 'coupled',
  partner_id = '22222222-2222-2222-2222-222222222222'
WHERE id = '11111111-1111-1111-1111-111111111111';

UPDATE public.profiles
SET 
  avatar_url = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
  relationship_status = 'coupled',
  partner_id = '11111111-1111-1111-1111-111111111111'
WHERE id = '22222222-2222-2222-2222-222222222222';

-- 3. Create couple
INSERT INTO public.couples (id, relationship_name, anniversary, status, created_by)
VALUES (
  'c0000000-0000-0000-0000-000000000001',
  'Alex & Taylor',
  '2023-02-14',
  'active',
  '11111111-1111-1111-1111-111111111111'
) ON CONFLICT (id) DO NOTHING;

-- 4. Insert statuses
INSERT INTO public.statuses (user_id, couple_id, status_text, emoji, visibility)
VALUES 
(
  '11111111-1111-1111-1111-111111111111',
  'c0000000-0000-0000-0000-000000000001',
  'Excited for our weekend getaway! 🧳✨',
  '🎉',
  'couple'
),
(
  '22222222-2222-2222-2222-222222222222',
  'c0000000-0000-0000-0000-000000000001',
  'Counting down the days till dinner tonight ❤️',
  '🍷',
  'couple'
);

-- 5. Insert plans
INSERT INTO public.plans (couple_id, created_by, title, description, start_at, end_at, location, color, priority, completed)
VALUES 
(
  'c0000000-0000-0000-0000-000000000001',
  '11111111-1111-1111-1111-111111111111',
  'Sunset Picnic & Wine',
  'Pack cheese board, sparkling wine, and warm blanket.',
  NOW() + INTERVAL '1 day',
  NOW() + INTERVAL '1 day 3 hours',
  'Sunset Ridge Park',
  '#ec4899',
  'high',
  false
),
(
  'c0000000-0000-0000-0000-000000000001',
  '22222222-2222-2222-2222-222222222222',
  'Weekly Grocery & Meal Prep',
  'Buy fresh pasta, basil, tomatoes, and gelato.',
  NOW() + INTERVAL '3 days',
  NOW() + INTERVAL '3 days 2 hours',
  'Trader Joe''s',
  '#8b5cf6',
  'medium',
  false
),
(
  'c0000000-0000-0000-0000-000000000001',
  '11111111-1111-1111-1111-111111111111',
  'Movie Night - Studio Ghibli',
  'Watch Spirited Away with homemade popcorn.',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days' + INTERVAL '2 hours',
  'Living Room',
  '#10b981',
  'low',
  true
);

-- 6. Insert proposals
INSERT INTO public.proposals (couple_id, created_by, title, description, planned_date, status, response_message)
VALUES 
(
  'c0000000-0000-0000-0000-000000000001',
  '11111111-1111-1111-1111-111111111111',
  'Weekend Cabin Trip to Lake Tahoe',
  'How about renting a cozy lakeside cabin for next weekend? We can hike and roast marshmallows.',
  NOW() + INTERVAL '10 days',
  'pending',
  NULL
),
(
  'c0000000-0000-0000-0000-000000000001',
  '22222222-2222-2222-2222-222222222222',
  'Pottery Workshop Class',
  'Beginner ceramic making class on Saturday afternoon.',
  NOW() + INTERVAL '4 days',
  'accepted',
  'I would love to! Sounds super fun 😊'
);

-- 7. Insert memories
INSERT INTO public.memories (couple_id, uploaded_by, title, caption, image_url, memory_date)
VALUES 
(
  'c0000000-0000-0000-0000-000000000001',
  '11111111-1111-1111-1111-111111111111',
  'Our 1st Anniversary Trip',
  'Walking on the coast under the golden hour sunset.',
  'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&auto=format&fit=crop&q=80',
  '2024-02-14'
),
(
  'c0000000-0000-0000-0000-000000000001',
  '22222222-2222-2222-2222-222222222222',
  'Stargazing at Yosemite',
  'Clear skies and thousands of stars above our tent.',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
  '2024-07-20'
);

-- 8. Insert notifications
INSERT INTO public.notifications (recipient_id, sender_id, type, title, body, read)
VALUES 
(
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'proposal',
  'New Proposal from Alex',
  'Alex proposed: Weekend Cabin Trip to Lake Tahoe',
  false
),
(
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  'proposal',
  'Proposal Accepted!',
  'Taylor accepted your proposal: Proposal Accepted!',
  true
);

