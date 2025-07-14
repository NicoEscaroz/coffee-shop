
import { Routes, Route } from 'react-router-dom';
import Menu from './components/menu';
import Sales from './components/sales';
import Inventory from './components/inventory';
import SalesTable from './components/salesTable';
import DeletedProducts from './components/deletedProducts';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Menu />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/sales" element={<Sales/>}/>
            <Route path="/inventory" element={<Inventory/>}/>
            <Route path="/salesRecord" element={<SalesTable/>}/>
            <Route path="/deleted-products" element={<DeletedProducts/>}/>
        </Routes>
    );
};
export default AppRoutes;