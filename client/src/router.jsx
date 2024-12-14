import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import EditRooms from './pages/EditRooms/EditRooms';
import RegisterForm from './components/Auth/RegisterForm';
import SignInForm from './components/Auth/SignInForm';
import PropertyDetails from './pages/PropertyDetails/PropertyDetails';
import ListProperty from './pages/ListProperty/ListProperty';
import CreatePropertyWizard from './components/Property/CreatePropertyWizard';
import AdminEditProperty from './pages/AdminEditProperty/AdminEditProperty';
import AdminProperties from './pages/AdminProperties/AdminProperties';
import SearchResults from './pages/SearchResults/SearchResults';
import Home from './pages/Home/Home';

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <App />,
      children: [
        {
          path: '/',
          element: <Home />,
        },
        {
          path: 'register',
          element: <RegisterForm />,
        },
        {
          path: 'signin',
          element: <SignInForm />,
        },
        {
          path: 'list-property',
          element: <ListProperty />,
        },
        {
          path: 'create-property-wizard',
          element: <CreatePropertyWizard />,
        },
        {
          path: 'properties/:id',
          element: <PropertyDetails />,
        },
        {
          path: 'admin/properties',
          element: <AdminProperties />,
        },
        {
          path: 'admin/properties/:id/edit',
          element: <AdminEditProperty />,
        },
        {
          path: 'property/:propertyId/rooms',
          element: <EditRooms />,
        },
        {
          path: 'search',
          element: <SearchResults />,
        },
        {
          path: 'property/:id',
          element: <PropertyDetails />,
        },
      ],
    },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }
  }
);