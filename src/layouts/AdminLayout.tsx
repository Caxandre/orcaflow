import { useState } from 'react';
import { FilePlus2, LayoutDashboard, LogOut, Menu, Package, ScrollText, Users, X } from 'lucide-react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { useAuth } from '../hooks/useAuth';

const navigation = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/produtos', label: 'Produtos e serviços', icon: Package },
  { to: '/orcamentos', label: 'Orçamentos', icon: ScrollText },
  { to: '/orcamentos/novo', label: 'Novo orçamento', icon: FilePlus2 },
];

export function AdminLayout() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const page = navigation.find((item) => item.end ? location.pathname === '/' : location.pathname.startsWith(item.to))?.label ?? 'OrçaFlow';
  return <div className="min-h-screen">
    {open && <button className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden" onClick={() => setOpen(false)} aria-label="Fechar menu" />}
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-[276px] flex-col bg-navy p-5 text-white transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex items-center justify-between"><Logo /><button onClick={() => setOpen(false)} className="rounded-lg p-2 text-blue-100 lg:hidden" aria-label="Fechar menu"><X /></button></div>
      <div className="mt-10 flex-1"><p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.2em] text-blue-300">Navegação</p><nav className="space-y-1.5">{navigation.map((item) => <NavLink key={item.to} to={item.to} end={item.end} onClick={() => setOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition ${isActive ? 'bg-white text-navy shadow-lg' : 'text-blue-100 hover:bg-white/10 hover:text-white'}`}><item.icon size={19} />{item.label}</NavLink>)}</nav></div>
      <div className="rounded-2xl bg-white/8 p-3"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-coral font-bold">{user?.name.slice(0, 1).toUpperCase()}</span><span className="min-w-0 flex-1"><strong className="block truncate text-sm">{user?.name}</strong><small className="block truncate text-blue-200">{user?.email}</small></span><button onClick={() => void logout()} className="rounded-lg p-2 text-blue-200 hover:bg-white/10 hover:text-white" aria-label="Sair"><LogOut size={18} /></button></div></div>
    </aside>
    <div className="lg:pl-[276px]">
      <header className="sticky top-0 z-20 flex h-18 items-center justify-between border-b border-slate-200/70 bg-white/90 px-4 backdrop-blur-xl sm:px-7"><div className="flex items-center gap-3"><button className="rounded-xl border border-slate-200 p-2.5 text-slate-600 lg:hidden" onClick={() => setOpen(true)} aria-label="Abrir menu"><Menu size={20} /></button><span className="text-sm font-semibold text-slate-700">{page}</span></div><div className="text-right"><p className="text-sm font-semibold text-slate-700">Olá, {user?.name.split(' ')[0]}</p><p className="text-xs text-slate-400">Boas vendas hoje</p></div></header>
      <main className="mx-auto max-w-[1500px] p-4 sm:p-7 lg:p-9"><Outlet /></main>
    </div>
  </div>;
}
