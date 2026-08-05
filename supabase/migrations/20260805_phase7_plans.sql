-- Phase 7 Migration: Expand Plans Table for Categories, Recurring Plans & Reminders

ALTER TABLE public.plans
  ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'custom',
  ADD COLUMN IF NOT EXISTS repeat TEXT NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS reminder_minutes INTEGER DEFAULT NULL;

-- Add check constraint for repeat values if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_plans_repeat'
  ) THEN
    ALTER TABLE public.plans
      ADD CONSTRAINT chk_plans_repeat CHECK (repeat IN ('none', 'daily', 'weekly', 'monthly', 'yearly'));
  END IF;
END $$;

-- Add performance indexes for couple plans querying
CREATE INDEX IF NOT EXISTS idx_plans_couple_start ON public.plans(couple_id, start_at);
CREATE INDEX IF NOT EXISTS idx_plans_category ON public.plans(category);
