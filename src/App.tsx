import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppProvider';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { RoomiesPage } from './pages/RoomiesPage';
import { AddExpensePage } from './pages/AddExpensePage';
import { SettleUpPage } from './pages/SettleUpPage';
import { HistoryPage } from './pages/HistoryPage';

function App() {
    return (
        <AppProvider>
            <BrowserRouter>
                <Layout>
                    <Routes>
                        <Route path="/" element={<DashboardPage />} />
                        <Route path="/roomies" element={<RoomiesPage />} />
                        <Route path="/add-expense" element={<AddExpensePage />} />
                        <Route path="/settle-up" element={<SettleUpPage />} />
                        <Route path="/history" element={<HistoryPage />} />
                    </Routes>
                </Layout>
            </BrowserRouter>
        </AppProvider>
    );
}

export default App;
