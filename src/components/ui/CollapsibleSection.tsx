'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function CollapsibleSection({
  label,
  collapsedLabel,
  icon,
  defaultExpanded = false,
  children,
}: {
  label: string;
  /** Text shown on the toggle button while collapsed, if different from `label`. */
  collapsedLabel?: string;
  /** Pass an already-rendered element (e.g. `<UserPlus size={16} />`), not a bare
   * component reference — a bare component/function can't cross the Server-to-Client
   * boundary when this is used from a Server Component. */
  icon?: React.ReactNode;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        {icon}
        {expanded ? label : (collapsedLabel ?? label)}
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {expanded && <div className="mt-4 space-y-4">{children}</div>}
    </div>
  );
}
