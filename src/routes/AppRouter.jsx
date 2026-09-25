import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from '../layouts/AppLayout'
import HomePage from '../pages/HomePage'
import LoginPage from '../pages/LoginPage'
import MatchingPage from '../pages/MatchingPage'
import MyPage from '../pages/MyPage'
import NotFoundPage from '../pages/NotFoundPage'
import SchedulePage from '../pages/SchedulePage'
import { PATHS } from './paths'

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 헤더/네브바 없는 화면 */}
        <Route path={PATHS.login} element={<LoginPage />} />

        {/* 헤더 + 네브바가 붙는 화면 */}
        <Route element={<AppLayout />}>
          <Route path={PATHS.home} element={<HomePage />} />
          <Route path={PATHS.schedule} element={<SchedulePage />} />
          <Route path={PATHS.matching} element={<MatchingPage />} />
          <Route path={PATHS.my} element={<MyPage />} />
          <Route path="/404" element={<NotFoundPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
