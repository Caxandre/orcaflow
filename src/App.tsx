import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminLayout } from './layouts/AdminLayout';
import { ClientsPage } from './pages/ClientsPage';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProductsPage } from './pages/ProductsPage';
import { QuoteDetailsPage } from './pages/QuoteDetailsPage';
import { QuoteFormPage } from './pages/QuoteFormPage';
import { QuotesPage } from './pages/QuotesPage';
import { ProtectedRoute } from './routes/ProtectedRoute';

export default function App() { return <Routes><Route path="/login" element={<LoginPage />} /><Route element={<ProtectedRoute />}><Route element={<AdminLayout />}><Route index element={<DashboardPage />} /><Route path="clientes" element={<ClientsPage />} /><Route path="produtos" element={<ProductsPage />} /><Route path="orcamentos" element={<QuotesPage />} /><Route path="orcamentos/novo" element={<QuoteFormPage />} /><Route path="orcamentos/:id" element={<QuoteDetailsPage />} /><Route path="orcamentos/:id/editar" element={<QuoteFormPage />} /><Route path="404" element={<NotFoundPage />} /><Route path="*" element={<Navigate to="/404" replace />} /></Route></Route></Routes>; }
