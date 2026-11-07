import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import { ROUTES } from '../constants/routes';
import { ROLES } from '../constants/config';
import LoginPage from '../pages/Login/LoginPage';
import OverviewPage from '../pages/Overview/OverviewPage';
import AnalyticsPage from '../pages/Analytics/AnalyticsPage';
import CatalogPage from '../pages/Catalog/CatalogPage';
import CatalogEditPage from '../pages/Catalog/CatalogEditPage';
import OptionTemplatesPage from '../pages/OptionTemplates/OptionTemplatesPage';
import RequestsPage from '../pages/Requests/RequestsPage';
import MessagesPage from '../pages/Messages/MessagesPage';
import VideosListPage from '../pages/Videos/VideosListPage';
import VideoCreatePage from '../pages/Videos/VideoCreatePage';
import VideoEditPage from '../pages/Videos/VideoEditPage';
import PartnersPage from '../pages/Partners/PartnersPage';
import TestimonialsPage from '../pages/Testimonials/TestimonialsPage';
import StatsPage from '../pages/Stats/StatsPage';
import ThemeSettingsPage from '../pages/Theme/ThemeSettingsPage';
import HomeLayoutPage from '../pages/HomeLayout/HomeLayoutPage';
import ContentPage from '../pages/Content/ContentPage';
import SiteTextsPage from '../pages/Texts/SiteTextsPage';
import LegalPage from '../pages/Legal/LegalPage';
import SiteSettingsPage from '../pages/Settings/SiteSettingsPage';
import AdminsPage from '../pages/Admins/AdminsPage';
import ProfilePage from '../pages/Profile/ProfilePage';
import NotFoundPage from '../pages/NotFound/NotFoundPage';
import SubsidiariesPage from '../pages/Subsidiaries/SubsidiariesPage';
import BranchesPage from '../pages/Branches/BranchesPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route element={<AuthLayout />}>
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path={ROUTES.OVERVIEW} element={<OverviewPage />} />
          <Route path="/overview" element={<Navigate to={ROUTES.OVERVIEW} replace />} />
          <Route path={ROUTES.ANALYTICS} element={<AnalyticsPage />} />

          <Route path={ROUTES.CATALOG} element={<CatalogPage />} />
          <Route path={ROUTES.CATALOG_NEW} element={<CatalogEditPage key="new" />} />
          <Route path={ROUTES.CATALOG_EDIT} element={<CatalogEditPage key="edit" />} />
          <Route path={ROUTES.OPTION_TEMPLATES} element={<OptionTemplatesPage />} />

          <Route path={ROUTES.REQUESTS} element={<RequestsPage />} />
          <Route path={ROUTES.MESSAGES} element={<MessagesPage />} />

          <Route path={ROUTES.THEME} element={<ThemeSettingsPage />} />
          <Route path={ROUTES.HOME_LAYOUT} element={<HomeLayoutPage />} />
          <Route path={ROUTES.PARTNERS} element={<PartnersPage />} />
          <Route path={ROUTES.BRANCHES} element={<BranchesPage />} />
          <Route path={ROUTES.CONTENT} element={<ContentPage />} />
          <Route path={ROUTES.STATS} element={<StatsPage />} />
          <Route path={ROUTES.TEXTS} element={<SiteTextsPage />} />
          <Route path={ROUTES.TESTIMONIALS} element={<TestimonialsPage />} />
          <Route path={ROUTES.VIDEOS} element={<VideosListPage />} />
          <Route path={ROUTES.VIDEO_NEW} element={<VideoCreatePage />} />
          <Route path={ROUTES.VIDEO_EDIT} element={<VideoEditPage />} />
          <Route path={ROUTES.LEGAL} element={<LegalPage />} />
          <Route path="/subsidiaries" element={<SubsidiariesPage />} />
          <Route path={ROUTES.SETTINGS} element={<SiteSettingsPage />} />
          <Route path={ROUTES.PROFILE} element={<ProfilePage />} />

          <Route element={<ProtectedRoute roles={[ROLES.SUPER_ADMIN]} />}>
            <Route path={ROUTES.ADMINS} element={<AdminsPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
}