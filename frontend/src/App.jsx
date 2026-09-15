import { RouterProvider } from 'react-router-dom';
import router from './router';
import { Toaster, ConfirmProvider } from './components/ui';

function App() {
  return (
    <ConfirmProvider>
      <RouterProvider router={router} />
      <Toaster />
    </ConfirmProvider>
  );
}

export default App;

