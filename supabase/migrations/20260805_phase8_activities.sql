-- Phase 8 Migration: Activities Table, User Activity Views, RLS, Triggers & Realtime

-- 1. Create Activities Table
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'status_updated',
    'plan_created',
    'plan_completed',
    'proposal_created',
    'proposal_accepted',
    'proposal_declined',
    'memory_added',
    'memory_liked',
    'relationship_created',
    'relationship_ended',
    'system'
  )),
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create User Activity Views Table for per-user read tracking
CREATE TABLE IF NOT EXISTS public.user_activity_views (
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (activity_id, user_id)
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_activities_couple_id ON public.activities(couple_id);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON public.activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON public.activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_views_user_id ON public.user_activity_views(user_id);

-- 4. Enable Row Level Security
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_views ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
DROP POLICY IF EXISTS "Users can access activities for their couple" ON public.activities;
CREATE POLICY "Users can access activities for their couple" ON public.activities
  FOR ALL USING (
    public.is_member_of_couple(couple_id)
  )
  WITH CHECK (
    public.is_member_of_couple(couple_id)
  );

DROP POLICY IF EXISTS "Users can access own activity views" ON public.user_activity_views;
CREATE POLICY "Users can access own activity views" ON public.user_activity_views
  FOR ALL USING (
    auth.uid() = user_id
  )
  WITH CHECK (
    auth.uid() = user_id
  );

-- 6. Realtime Publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.activities;

-- 7. Database Triggers for Automated Activity Generation

-- 7.1 Status Insert Trigger
CREATE OR REPLACE FUNCTION public.log_status_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.couple_id IS NOT NULL THEN
    INSERT INTO public.activities (couple_id, user_id, type, title, description, metadata, created_at)
    VALUES (
      NEW.couple_id,
      NEW.user_id,
      'status_updated',
      'updated status',
      NEW.status_text,
      jsonb_build_object('emoji', NEW.emoji, 'expires_at', NEW.expires_at),
      NEW.created_at
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_status_activity ON public.statuses;
CREATE TRIGGER trg_status_activity
  AFTER INSERT ON public.statuses
  FOR EACH ROW EXECUTE FUNCTION public.log_status_activity();

-- 7.2 Plan Insert/Update Trigger
CREATE OR REPLACE FUNCTION public.log_plan_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.activities (couple_id, user_id, type, title, description, metadata, created_at)
    VALUES (
      NEW.couple_id,
      NEW.created_by,
      'plan_created',
      'created plan "' || NEW.title || '"',
      NEW.description,
      jsonb_build_object('plan_id', NEW.id, 'start_at', NEW.start_at, 'location', NEW.location),
      NEW.created_at
    );
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.completed = TRUE AND OLD.completed = FALSE THEN
      INSERT INTO public.activities (couple_id, user_id, type, title, description, metadata, created_at)
      VALUES (
        NEW.couple_id,
        NEW.created_by,
        'plan_completed',
        'completed plan "' || NEW.title || '"',
        NEW.description,
        jsonb_build_object('plan_id', NEW.id),
        NOW()
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_plan_activity ON public.plans;
CREATE TRIGGER trg_plan_activity
  AFTER INSERT OR UPDATE ON public.plans
  FOR EACH ROW EXECUTE FUNCTION public.log_plan_activity();

-- 7.3 Proposal Insert/Update Trigger
CREATE OR REPLACE FUNCTION public.log_proposal_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.activities (couple_id, user_id, type, title, description, metadata, created_at)
    VALUES (
      NEW.couple_id,
      NEW.created_by,
      'proposal_created',
      'created proposal "' || NEW.title || '"',
      NEW.description,
      jsonb_build_object('proposal_id', NEW.id, 'planned_date', NEW.planned_date),
      NEW.created_at
    );
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

DROP TRIGGER IF EXISTS trg_proposal_activity ON public.proposals;
CREATE TRIGGER trg_proposal_activity
  AFTER INSERT OR UPDATE ON public.proposals
  FOR EACH ROW EXECUTE FUNCTION public.log_proposal_activity();

-- 7.4 Memory Insert Trigger
CREATE OR REPLACE FUNCTION public.log_memory_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.activities (couple_id, user_id, type, title, description, metadata, created_at)
  VALUES (
    NEW.couple_id,
    NEW.uploaded_by,
    'memory_added',
    'added memory "' || NEW.title || '"',
    NEW.caption,
    jsonb_build_object('memory_id', NEW.id, 'image_url', NEW.image_url, 'memory_date', NEW.memory_date),
    NEW.created_at
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_memory_activity ON public.memories;
CREATE TRIGGER trg_memory_activity
  AFTER INSERT ON public.memories
  FOR EACH ROW EXECUTE FUNCTION public.log_memory_activity();
