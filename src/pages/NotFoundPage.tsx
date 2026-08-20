import { ArrowLeft } from 'lucide-react';
import { ButtonLink } from '../design-system/ButtonLink';

export function NotFoundPage() { return <div className="grid min-h-[65vh] place-items-center text-center"><div><p className="font-serif text-8xl text-blue-100">404</p><h1 className="mt-4 text-2xl font-bold text-navy">Página não encontrada</h1><p className="mt-2 text-sm text-slate-500">O endereço pode ter mudado ou não existir.</p><ButtonLink className="mt-6" to="/" variant="primary"><ArrowLeft size={17} />Voltar ao dashboard</ButtonLink></div></div>; }
