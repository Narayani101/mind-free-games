import { Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Home } from '@/pages/Home';
import { GamesHub } from '@/pages/GamesHub';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { GamePage } from '@/pages/GamePage';
import { Scores } from '@/pages/Scores';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/arcade" element={<GamesHub mode="arcade" />} />
        <Route path="/puzzle" element={<GamesHub mode="puzzle" />} />
        <Route path="/action" element={<GamesHub mode="action" />} />
        <Route path="/runner" element={<GamesHub mode="runner" />} />
        <Route path="/match" element={<GamesHub mode="match" />} />
        <Route path="/scores" element={<Scores />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/play/:gameId" element={<GamePage />} />
      </Route>
    </Routes>
  );
}
