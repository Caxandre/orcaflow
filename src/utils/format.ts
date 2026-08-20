export const formatMoney = (value: number | string) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value));
export const formatDate = (value?: string) => value ? new Intl.DateTimeFormat('pt-BR').format(new Date(value.includes('T') ? value : `${value}T12:00:00`)) : '—';
export const phoneDigits = (value: string) => {
  const digits = value.replace(/\D/g, '');
  return digits.startsWith('55') ? digits : `55${digits}`;
};
export const whatsAppUrl = (quote: QuoteLike, pdfUrl: string) => {
  const message = `Olá, ${quote.client_name}!\n\nSegue o orçamento nº ${quote.quote_number}.\n\nValor total: ${formatMoney(quote.total)}\nValidade: ${formatDate(quote.valid_until)}\n\nAcesse o PDF:\n${pdfUrl}`;
  return `https://wa.me/${phoneDigits(quote.client_phone ?? '')}?text=${encodeURIComponent(message)}`;
};
interface QuoteLike { client_name?: string; client_phone?: string; quote_number: string; total: number; valid_until: string }
