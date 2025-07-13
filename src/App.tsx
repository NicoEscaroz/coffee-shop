import { BrowserRouter } from 'react-router-dom';
import Header from './layout/header';
import SideBar from './layout/sideBar';
import AppRoutes from './routes';

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen max-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="w-64 min-h-screen">
          <SideBar />
        </div>
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          <div className="flex-1 overflow-auto p-6">
            <AppRoutes />
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
