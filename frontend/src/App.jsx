import { RouterProvider } from 'react-router-dom';
import router from './router';
import { Toaster } from './components/ui';

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}

export default App;
