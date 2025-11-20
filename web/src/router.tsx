import { createBrowserRouter } from 'react-router-dom';
import { MainPage } from './pages/MainPage';
import { EventPage } from './pages/EventPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainPage />,
  },
  {
    path: '/events/:id',
    element: <EventPage />,
  },
]);
