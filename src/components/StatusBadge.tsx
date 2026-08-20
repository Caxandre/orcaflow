import { CheckCircle2, Clock3, Send, XCircle } from 'lucide-react';
import { Badge } from '../design-system/Badge';
import type { BadgeTone } from '../design-system/Badge';
import type { QuoteStatus } from '../types';

const styles: Record<QuoteStatus, { label: string; tone: BadgeTone; Icon: typeof Clock3 }> = {
  draft: { label: 'Rascunho', tone: 'neutral', Icon: Clock3 },
  sent: { label: 'Enviado', tone: 'info', Icon: Send },
  approved: { label: 'Aprovado', tone: 'success', Icon: CheckCircle2 },
  rejected: { label: 'Recusado', tone: 'danger', Icon: XCircle },
};

export function StatusBadge({ status }: { status: QuoteStatus }) {
  const item = styles[status];
  return <Badge tone={item.tone} icon={<item.Icon size={13} />}>{item.label}</Badge>;
}
