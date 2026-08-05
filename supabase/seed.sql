-- Seed Data for Development Testing (Step 17)
-- Note: Replace UUIDs with actual auth user IDs when testing locally or with real auth users.

-- 1. Example profile seed setup (guarded with ON CONFLICT)
-- DO NOT run in production with dummy auth IDs.

-- Commented template for seeding after auth user creation:
/*
INSERT INTO public.couples (id, relationship_name, anniversary, status, created_by)
VALUES ('11111111-1111-1111-1111-111111111111', 'Alex & Taylor', '2023-02-14', 'active', '00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.statuses (couple_id, user_id, status_text, emoji, visibility)
VALUES ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'Planning date night!', '❤️', 'couple');

INSERT INTO public.plans (couple_id, created_by, title, description, start_at, end_at, location, color, priority)
VALUES ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'Sunset Picnic', 'Bring wine and cheese', NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day 2 hours', 'Sunset Park', '#ec4899', 'high');

INSERT INTO public.proposals (couple_id, created_by, title, description, planned_date, status)
VALUES ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'Weekend Getaway to Beach', 'Let us go to Montauk this weekend', NOW() + INTERVAL '5 days', 'pending');

INSERT INTO public.memories (couple_id, uploaded_by, title, caption, image_url, memory_date)
VALUES ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'Our First Anniversary', 'Best day ever', 'https://images.unsplash.com/photo-1518199266791-5375a83190b7', '2024-02-14');
*/
