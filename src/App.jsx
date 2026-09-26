import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import ProviderLayout from './layouts/ProviderLayout'
import ConsentPage from './pages/user/ConsentPage'
import HomePage from './pages/patient/HomePage'
import LoginPage from './pages/LoginPage'
import MatchingPage from './pages/patient/MatchingPage'
import MyPage from './pages/patient/MyPage'
import NotFoundPage from './pages/NotFoundPage'
import ProviderHomePage from './pages/provider/HomePage'
import SchedulePage from './pages/patient/SchedulePage'
import SignupPage from './pages/user/SignupPage'
import SocialWorkerHomePage from './pages/social-worker/SocialWorkerHomePage'
import { PATHS, PROVIDER_PATHS } from './constants/paths'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 헤더/네브바 없는 화면 */}
        <Route path={PATHS.login} element={<LoginPage />} />
        <Route path={PATHS.signup} element={<SignupPage />} />
        <Route path={PATHS.signupConsent} element={<ConsentPage />} />

        {/* 헤더 + 네브바가 붙는 화면 */}
        <Route element={<AppLayout />}>
          <Route path={PATHS.home} element={<HomePage />} />
          <Route path={PATHS.schedule} element={<SchedulePage />} />
          <Route path={PATHS.matching} element={<MatchingPage />} />
          <Route path={PATHS.my} element={<MyPage />} />

          <Route path="/social-worker" element={<SocialWorkerHomePage />} />

          <Route path="/404" element={<NotFoundPage />} />
        </Route>

        {/* 서비스 제공자 — 헤더 + 네브바가 붙는 화면 */}
        <Route element={<ProviderLayout />}>
          <Route path={PROVIDER_PATHS.home} element={<ProviderHomePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
