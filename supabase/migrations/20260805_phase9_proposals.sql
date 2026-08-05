-- Phase 9 Migration: Trip & Date Proposals, Counter Proposals, Comments, Reactions & Calendar Linkage

-- 1. Expand Proposals Table Columns
ALTER TABLE public.proposals
  ADD COLUMN IF NOT EXISTS location TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS cover_image TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS start_datetime TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS end_datetime TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS declined_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS responded_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS parent_proposal_id UUID REFERENCES public.proposals(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'couple',
  ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'date',
  ADD COLUMN IF NOT EXISTS estimated_cost NUMERIC(10, 2) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS dress_code TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS weather_required TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS is_surprise BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS auto_add_to_calendar BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS reminder_minutes INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'medium';

-- Populate start_datetime from legacy planned_date if null
UPDATE public.proposals
SET start_datetime = planned_date
WHERE start_datetime IS NULL;

-- Make start_datetime NOT NULL once populated
ALTER TABLE public.proposals
  ALTER COLUMN start_datetime SET NOT NULL;

-- Update check constraints on proposals table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'proposals_status_check'
  ) THEN
    ALTER TABLE public.proposals DROP CONSTRAINT proposals_status_check;
  END IF;
END $$;

ALTER TABLE public.proposals
  ADD CONSTRAINT chk_proposals_status CHECK (status IN (
    'pending',
    'accepted',
    'declined',
    'maybe',
    'countered',
    'expired',
    'cancelled',
    'completed'
  ));

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_proposals_category'
  ) THEN
    ALTER TABLE public.proposals
      ADD CONSTRAINT chk_proposals_category CHECK (category IN (
        'date',
        'trip',
        'activity',
        'dining',
        'getaway',
        'movie',
        'staycation',
        'custom'
      ));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_proposals_priority'
  ) THEN
    ALTER TABLE public.proposals
      ADD CONSTRAINT chk_proposals_priority CHECK (priority IN ('low', 'medium', 'high'));
  END IF;
END $$;

-- 2. Proposal Comments Table
CREATE TABLE IF NOT EXISTS public.proposal_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.proposal_comments(id) ON DELETE CASCADE,
  is_edited BOOLEAN NOT NULL DEFAULT FALSE,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for auto updated_at on proposal_comments
DROP TRIGGER IF EXISTS set_updated_at_proposal_comments ON public.proposal_comments;
CREATE TRIGGER set_updated_at_proposal_comments
  BEFORE UPDATE ON public.proposal_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. Proposal Reactions Table
CREATE TABLE IF NOT EXISTS public.proposal_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_proposal_reactions_user UNIQUE (proposal_id, user_id)
);

-- 4. Add source_proposal_id to Plans Table
ALTER TABLE public.plans
  ADD COLUMN IF NOT EXISTS source_proposal_id UUID REFERENCES public.proposals(id) ON DELETE SET NULL;

-- 5. Indexes for Performance & Data Access
CREATE INDEX IF NOT EXISTS idx_proposals_parent_id ON public.proposals(parent_proposal_id);
CREATE INDEX IF NOT EXISTS idx_proposals_start_datetime ON public.proposals(start_datetime);
CREATE INDEX IF NOT EXISTS idx_proposals_category ON public.proposals(category);
CREATE INDEX IF NOT EXISTS idx_proposal_comments_proposal_id ON public.proposal_comments(proposal_id);
CREATE INDEX IF NOT EXISTS idx_proposal_comments_user_id ON public.proposal_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_proposal_reactions_proposal_id ON public.proposal_reactions(proposal_id);
CREATE INDEX IF NOT EXISTS idx_plans_source_proposal ON public.plans(source_proposal_id);

-- 6. Row Level Security (RLS)
ALTER TABLE public.proposal_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_reactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can access proposal comments for their couple" ON public.proposal_comments;
CREATE POLICY "Users can access proposal comments for their couple" ON public.proposal_comments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.proposals p
      WHERE p.id = proposal_id AND public.is_member_of_couple(p.couple_id)
    )
  );

DROP POLICY IF EXISTS "Users can access proposal reactions for their couple" ON public.proposal_reactions;
CREATE POLICY "Users can access proposal reactions for their couple" ON public.proposal_reactions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.proposals p
      WHERE p.id = proposal_id AND public.is_member_of_couple(p.couple_id)
    )
  );

-- 7. Realtime Publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.proposals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.proposal_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.proposal_reactions;

-- 8. Updated Activity Trigger for Proposals
CREATE OR REPLACE FUNCTION public.log_proposal_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.parent_proposal_id IS NOT NULL THEN
      INSERT INTO public.activities (couple_id, user_id, type, title, description, metadata, created_at)
      VALUES (
        NEW.couple_id,
        NEW.created_by,
        'proposal_created',
        'counter-proposed "' || NEW.title || '"',
        NEW.description,
        jsonb_build_object('proposal_id', NEW.id, 'parent_proposal_id', NEW.parent_proposal_id, 'start_datetime', NEW.start_datetime),
        NEW.created_at
      );
    ELSE
      INSERT INTO public.activities (couple_id, user_id, type, title, description, metadata, created_at)
      VALUES (
        NEW.couple_id,
        NEW.created_by,
        'proposal_created',
        'created proposal "' || NEW.title || '"',
        NEW.description,
        jsonb_build_object('proposal_id', NEW.id, 'start_datetime', NEW.start_datetime, 'category', NEW.category),
        NEW.created_at
      );
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.status = 'accepted' AND OLD.status <> 'accepted' THEN
      INSERT INTO public.activities (couple_id, user_id, type, title, description, metadata, created_at)
      VALUES (
        NEW.couple_id,
        NEW.created_by,
        'proposal_accepted',
        'accepted proposal "' || NEW.title || '"',
        NEW.response_message,
        jsonb_build_object('proposal_id', NEW.id),
        NOW()
      );
    ELSIF NEW.status = 'declined' AND OLD.status <> 'declined' THEN
      INSERT INTO public.activities (couple_id, user_id, type, title, description, metadata, created_at)
      VALUES (
        NEW.couple_id,
        NEW.created_by,
        'proposal_declined',
        'declined proposal "' || NEW.title || '"',
        NEW.response_message,
        jsonb_build_object('proposal_id', NEW.id),
        NOW()
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
