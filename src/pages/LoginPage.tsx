import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, CheckCircle2, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';
import { Logo } from '../components/Logo';
import { Button } from '../design-system/Button';
import { FieldError } from '../design-system/FieldError';
import { Input } from '../design-system/Input';
import { Label } from '../design-system/Label';
import { useAuth } from '../hooks/useAuth';
import { showApiError } from '../services/api';

const schema = z.object({ email: z.email('Informe um e-mail válido.'), password: z.string().min(6, 'Informe sua senha.') });
type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const { user, login } = useAuth();
  const [show, setShow] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { email: 'admin@crm.local', password: 'Admin@123' } });
  if (user) return <Navigate to="/" replace />;
  const submit = async (data: FormData) => {
    try { await login(data.email, data.password); toast.success('Bem-vindo de volta!'); }
    catch (error) { showApiError(error, 'Não foi possível entrar.'); }
  };
  return <main className="min-h-screen bg-navy p-4 sm:p-7">
    <div className="mx-auto grid min-h-[calc(100vh-3.5rem)] max-w-6xl overflow-hidden rounded-[28px] bg-white shadow-2xl lg:grid-cols-[1.05fr_.95fr]">
      <section className="relative hidden overflow-hidden bg-[#193561] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 top-24 size-72 rounded-full border-[52px] border-white/5" /><div className="absolute -bottom-28 -left-16 size-80 rounded-full bg-coral/20 blur-3xl" />
        <Logo />
        <div className="relative max-w-lg"><p className="mb-5 text-xs font-bold uppercase tracking-[.22em] text-orange-300">Venda com clareza</p><h1 className="font-serif text-5xl leading-[1.1]">Propostas bonitas.<br />Decisões mais rápidas.</h1><p className="mt-6 max-w-md text-base leading-7 text-blue-100">Do primeiro contato ao “aprovado”: clientes, serviços, orçamentos e PDFs profissionais em um só lugar.</p><div className="mt-9 space-y-3 text-sm text-blue-50">{['Totais seguros e calculados automaticamente', 'Histórico completo de cada negociação', 'Compartilhamento direto pelo WhatsApp'].map((item) => <p className="flex items-center gap-3" key={item}><CheckCircle2 className="text-orange-300" size={18} />{item}</p>)}</div></div>
        <p className="relative text-xs text-blue-300">Feito para pequenas equipes que querem vender melhor.</p>
      </section>
      <section className="flex items-center px-6 py-12 sm:px-14 lg:px-16"><div className="mx-auto w-full max-w-md">
        <div className="mb-10 lg:hidden"><Logo /></div><p className="text-xs font-bold uppercase tracking-[.18em] text-brand-600">Área segura</p><h2 className="mt-2 font-serif text-3xl text-navy">Acesse sua conta</h2><p className="mt-2 text-sm text-slate-500">Continue de onde parou e transforme oportunidades em negócios.</p>
        <form className="mt-8 space-y-5" onSubmit={handleSubmit(submit)}>
          <div><Label htmlFor="email">E-mail</Label><div className="relative"><Mail className="absolute left-3.5 top-3.5 text-slate-400" size={18} /><Input id="email" autoComplete="email" className="pl-11" placeholder="voce@empresa.com.br" aria-invalid={errors.email ? true : undefined} aria-describedby={errors.email ? 'email-error' : undefined} {...register('email')} /></div>{errors.email && <FieldError id="email-error">{errors.email.message}</FieldError>}</div>
          <div><Label htmlFor="password">Senha</Label><div className="relative"><LockKeyhole className="absolute left-3.5 top-3.5 text-slate-400" size={18} /><Input id="password" autoComplete="current-password" type={show ? 'text' : 'password'} className="px-11" placeholder="Sua senha" aria-invalid={errors.password ? true : undefined} aria-describedby={errors.password ? 'password-error' : undefined} {...register('password')} /><button type="button" className="absolute right-2 top-2 rounded-lg p-2 text-slate-400 hover:bg-slate-50" onClick={() => setShow(!show)} aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>{errors.password && <FieldError id="password-error">{errors.password.message}</FieldError>}</div>
          <Button type="submit" className="w-full py-3" loading={isSubmitting}>{isSubmitting ? 'Entrando...' : <>Entrar no OrçaFlow <ArrowRight size={18} /></>}</Button>
        </form>
        <div className="mt-7 rounded-xl bg-slate-50 p-4 text-xs leading-5 text-slate-500"><strong className="text-slate-700">Acesso inicial:</strong> admin@crm.local · Admin@123<br />Altere a senha após o primeiro acesso em produção.</div>
      </div></section>
    </div>
  </main>;
}
