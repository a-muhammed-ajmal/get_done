-- SQL Migration for v1.1.0 Updates
-- Run this in your Supabase SQL Editor to add the new fields to your existing `tasks` table.

ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS reminder JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS assignee TEXT DEFAULT NULL;
