-- ============================================================
-- Migration 0021: Let a finance officer/company be deleted even
-- after they have communication history — history rows are kept
-- (for audit purposes) but detached instead of blocking the delete.
-- Without this, deleting an officer/company fails outright once any
-- finance_communications row references it (the default FK behavior
-- is ON DELETE NO ACTION), which became much more likely now that
-- WhatsApp/Call quick actions auto-log a communication every time.
-- ============================================================

alter table finance_communications
  drop constraint finance_communications_finance_officer_id_fkey;

alter table finance_communications
  add constraint finance_communications_finance_officer_id_fkey
  foreign key (finance_officer_id) references finance_officers(id) on delete set null;
