import { createBrowserRouter } from 'react-router-dom';
import { MainPage } from './pages/MainPage';
import { EventPage } from './pages/EventPage';
import { TermsAndConditionsPage } from './pages/TermsAndConditionsPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { DataDeletionPage } from './pages/DataDeletionPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainPage />,
  },
  {
    path: '/events/:id',
    element: <EventPage />,
  },
  {
    path: '/terms',
    element: <TermsAndConditionsPage />,
  },
  {
    path: '/privacy',
    element: <PrivacyPolicyPage />,
  },
  {
    path: '/data-deletion',
    element: <DataDeletionPage />,
  },
]);
