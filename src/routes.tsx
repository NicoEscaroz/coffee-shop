
import { Routes, Route } from 'react-router-dom';
import Menu from './components/menu';
import Sales from './components/sales';
import Inventory from './components/inventory';
import SalesTable from './components/salesTable';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Menu />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/sales" element={<Sales/>}/>
            <Route path="/inventory" element={<Inventory/>}/>
            <Route path="/salesRecord" element={<SalesTable/>}/>
        </Routes>
    );
};
export default AppRoutes;