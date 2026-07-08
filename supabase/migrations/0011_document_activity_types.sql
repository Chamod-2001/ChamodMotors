-- ============================================================
-- Migration 0011: Activity log entries for the Documents feature
-- (NIC / electricity bill / other document uploads against a
-- vehicle or customer record)
-- ============================================================

alter type activity_type add value if not exists 'document_uploaded';
alter type activity_type add value if not exists 'document_deleted';
