-- -----------------------------------------------------------------------------
-- Migration: 20260805_phase10_memories.sql
-- Description: Expand memories table and add memory_albums, memory_comments,
--              memory_reactions, and relationship_milestones tables with RLS.
-- -----------------------------------------------------------------------------

-- 1. Create memory_albums table
CREATE TABLE IF NOT EXISTS public.memory_albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Expand memories table
DO $$ 
BEGIN
  -- created_by column (link to uploaded_by if it exists)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'memories' AND column_name = 'created_by') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'memories' AND column_name = 'uploaded_by') THEN
      ALTER TABLE public.memories ADD COLUMN created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
      UPDATE public.memories SET created_by = uploaded_by WHERE created_by IS NULL;
    ELSE
      ALTER TABLE public.memories ADD COLUMN created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
  END IF;

  -- description
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'memories' AND column_name = 'description') THEN
    ALTER TABLE public.memories ADD COLUMN description TEXT;
  END IF;

  -- location
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'memories' AND column_name = 'location') THEN
    ALTER TABLE public.memories ADD COLUMN location TEXT;
  END IF;

  -- latitude
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'memories' AND column_name = 'latitude') THEN
    ALTER TABLE public.memories ADD COLUMN latitude DOUBLE PRECISION;
  END IF;

  -- longitude
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'memories' AND column_name = 'longitude') THEN
    ALTER TABLE public.memories ADD COLUMN longitude DOUBLE PRECISION;
  END IF;

  -- cover_image
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'memories' AND column_name = 'cover_image') THEN
    ALTER TABLE public.memories ADD COLUMN cover_image TEXT;
  END IF;

  -- media_urls
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'memories' AND column_name = 'media_urls') THEN
    ALTER TABLE public.memories ADD COLUMN media_urls TEXT[] DEFAULT '{}';
  END IF;

  -- album_id
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'memories' AND column_name = 'album_id') THEN
    ALTER TABLE public.memories ADD COLUMN album_id UUID REFERENCES public.memory_albums(id) ON DELETE SET NULL;
  END IF;

  -- is_favorite
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'memories' AND column_name = 'is_favorite') THEN
    ALTER TABLE public.memories ADD COLUMN is_favorite BOOLEAN NOT NULL DEFAULT FALSE;
  END IF;

  -- is_private
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'memories' AND column_name = 'is_private') THEN
    ALTER TABLE public.memories ADD COLUMN is_private BOOLEAN NOT NULL DEFAULT FALSE;
  END IF;

  -- visibility
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'memories' AND column_name = 'visibility') THEN
    ALTER TABLE public.memories ADD COLUMN visibility TEXT NOT NULL DEFAULT 'couple';
  END IF;

  -- weather
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'memories' AND column_name = 'weather') THEN
    ALTER TABLE public.memories ADD COLUMN weather TEXT;
  END IF;

  -- tags
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'memories' AND column_name = 'tags') THEN
    ALTER TABLE public.memories ADD COLUMN tags TEXT[] DEFAULT '{}';
  END IF;
END $$;

-- 3. Create memory_comments table
CREATE TABLE IF NOT EXISTS public.memory_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id UUID NOT NULL REFERENCES public.memories(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES public.memory_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  edited BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Create memory_reactions table
CREATE TABLE IF NOT EXISTS public.memory_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id UUID NOT NULL REFERENCES public.memories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT memory_user_reaction_unique UNIQUE(memory_id, user_id)
);

-- 5. Create relationship_milestones table
CREATE TABLE IF NOT EXISTS public.relationship_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  type TEXT NOT NULL DEFAULT 'custom',
  cover_image TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Triggers for updated_at
-- -----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS set_updated_at_memory_albums ON public.memory_albums;
CREATE TRIGGER set_updated_at_memory_albums BEFORE UPDATE ON public.memory_albums FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at_memory_comments ON public.memory_comments;
CREATE TRIGGER set_updated_at_memory_comments BEFORE UPDATE ON public.memory_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at_relationship_milestones ON public.relationship_milestones;
CREATE TRIGGER set_updated_at_relationship_milestones BEFORE UPDATE ON public.relationship_milestones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------------------------------
-- Enable RLS
-- -----------------------------------------------------------------------------
ALTER TABLE public.memory_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relationship_milestones ENABLE ROW LEVEL SECURITY;

-- Memory Albums RLS
CREATE POLICY "Couple members can select memory_albums"
  ON public.memory_albums FOR SELECT
  USING (public.is_member_of_couple(couple_id));

CREATE POLICY "Couple members can insert memory_albums"
  ON public.memory_albums FOR INSERT
  WITH CHECK (public.is_member_of_couple(couple_id) AND created_by = auth.uid());

CREATE POLICY "Couple members can update memory_albums"
  ON public.memory_albums FOR UPDATE
  USING (public.is_member_of_couple(couple_id));

CREATE POLICY "Couple members can delete memory_albums"
  ON public.memory_albums FOR DELETE
  USING (public.is_member_of_couple(couple_id) AND created_by = auth.uid());

-- Memories RLS (Update/Ensure)
DROP POLICY IF EXISTS "Couple members can select memories" ON public.memories;
CREATE POLICY "Couple members can select memories"
  ON public.memories FOR SELECT
  USING (
    created_by = auth.uid() OR
    uploaded_by = auth.uid() OR
    (COALESCE(is_private, FALSE) = FALSE AND COALESCE(visibility, 'couple') != 'private' AND public.is_member_of_couple(couple_id))
  );

DROP POLICY IF EXISTS "Couple members can insert memories" ON public.memories;
CREATE POLICY "Couple members can insert memories"
  ON public.memories FOR INSERT
  WITH CHECK (
    public.is_member_of_couple(couple_id) AND
    (created_by = auth.uid() OR uploaded_by = auth.uid())
  );

DROP POLICY IF EXISTS "Couple members can update memories" ON public.memories;
CREATE POLICY "Couple members can update memories"
  ON public.memories FOR UPDATE
  USING (
    public.is_member_of_couple(couple_id) AND
    (created_by = auth.uid() OR uploaded_by = auth.uid())
  );

DROP POLICY IF EXISTS "Couple members can delete memories" ON public.memories;
CREATE POLICY "Couple members can delete memories"
  ON public.memories FOR DELETE
  USING (
    public.is_member_of_couple(couple_id) AND
    (created_by = auth.uid() OR uploaded_by = auth.uid())
  );

-- Memory Comments RLS
CREATE POLICY "Couple members can select memory_comments"
  ON public.memory_comments FOR SELECT
  USING (memory_id IN (
    SELECT m.id FROM public.memories m
    WHERE m.created_by = auth.uid() OR m.uploaded_by = auth.uid() OR
          (COALESCE(m.is_private, FALSE) = FALSE AND COALESCE(m.visibility, 'couple') != 'private' AND public.is_member_of_couple(m.couple_id))
  ));

CREATE POLICY "Couple members can insert memory_comments"
  ON public.memory_comments FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    memory_id IN (SELECT m.id FROM public.memories m WHERE public.is_member_of_couple(m.couple_id))
  );

CREATE POLICY "Couple members can update memory_comments"
  ON public.memory_comments FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Couple members can delete memory_comments"
  ON public.memory_comments FOR DELETE
  USING (user_id = auth.uid());

-- Memory Reactions RLS
CREATE POLICY "Couple members can select memory_reactions"
  ON public.memory_reactions FOR SELECT
  USING (memory_id IN (
    SELECT m.id FROM public.memories m
    WHERE m.created_by = auth.uid() OR m.uploaded_by = auth.uid() OR
          (COALESCE(m.is_private, FALSE) = FALSE AND COALESCE(m.visibility, 'couple') != 'private' AND public.is_member_of_couple(m.couple_id))
  ));

CREATE POLICY "Couple members can insert memory_reactions"
  ON public.memory_reactions FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    memory_id IN (SELECT m.id FROM public.memories m WHERE public.is_member_of_couple(m.couple_id))
  );

CREATE POLICY "Couple members can delete memory_reactions"
  ON public.memory_reactions FOR DELETE
  USING (user_id = auth.uid());

-- Relationship Milestones RLS
CREATE POLICY "Couple members can select relationship_milestones"
  ON public.relationship_milestones FOR SELECT
  USING (public.is_member_of_couple(couple_id));

CREATE POLICY "Couple members can insert relationship_milestones"
  ON public.relationship_milestones FOR INSERT
  WITH CHECK (public.is_member_of_couple(couple_id) AND created_by = auth.uid());

CREATE POLICY "Couple members can update relationship_milestones"
  ON public.relationship_milestones FOR UPDATE
  USING (public.is_member_of_couple(couple_id));

CREATE POLICY "Couple members can delete relationship_milestones"
  ON public.relationship_milestones FOR DELETE
  USING (public.is_member_of_couple(couple_id) AND created_by = auth.uid());

-- Add to Realtime Publication if available
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.memories;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.memory_albums;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.memory_comments;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.memory_reactions;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.relationship_milestones;
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;
