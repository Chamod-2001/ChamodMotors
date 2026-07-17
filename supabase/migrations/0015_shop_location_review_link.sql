-- ============================================================
-- Migration 0015: Optional Google Review link per shop location,
-- shown alongside "Get Directions" instead of a separate review card.
-- ============================================================

alter table shop_locations add column if not exists google_review_url text;
