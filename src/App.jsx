import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import CarePlanReviewPage from './pages/patient/CarePlanReviewPage'
import CarePlanServiceAddPage from './pages/patient/CarePlanServiceAddPage'
import CarePlanServicePage from './pages/patient/CarePlanServicePage'
import ProviderLayout from './layouts/ProviderLayout'
import ConsentPage from './pages/user/ConsentPage'
import HomeEntry from './pages/HomeEntry'
import LoginPage from './pages/LoginPage'
import MatchingPage from './pages/patient/MatchingPage'
import MyPage from './pages/patient/MyPage'
import NotFoundPage from './pages/NotFoundPage'
import ProviderHomePage from './pages/provider/HomePage'
import ProviderSchedulePage from './pages/provider/SchedulePage'
import ProvideWorkFormPage from './pages/provider/ProvideWorkFormPage'
import SchedulePage from './pages/patient/SchedulePage'
import SignupPage from './pages/user/SignupPage'
import SignupFormPage from './pages/user/SignupFormPage'
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
        <Route path={PATHS.signupForm} element={<SignupFormPage />} />

        {/* 헤더 + 네브바가 붙는 화면 */}
        <Route element={<AppLayout />}>
          <Route path={PATHS.home} element={<HomeEntry />} />
          <Route path={PATHS.schedule} element={<SchedulePage />} />
          <Route path={PATHS.matching} element={<MatchingPage />} />
          <Route path={PATHS.my} element={<MyPage />} />

          <Route path="/social-worker" element={<SocialWorkerHomePage />} />

          <Route path="/404" element={<NotFoundPage />} />
        </Route>

        {/* 퇴원 예정자 — 케어플랜 검토·확정 (뒤로가기 헤더만 있는 화면) */}
        <Route path={PATHS.carePlan} element={<CarePlanReviewPage />} />
        <Route path={PATHS.carePlanServiceNew} element={<CarePlanServiceAddPage />} />
        <Route path={PATHS.carePlanService} element={<CarePlanServicePage />} />

        {/* 서비스 제공자 — 뒤로가기 헤더만 있는 화면 */}
        <Route path={PROVIDER_PATHS.scheduleNew} element={<ProvideWorkFormPage />} />
        <Route path={PROVIDER_PATHS.scheduleEdit} element={<ProvideWorkFormPage />} />

        {/* 서비스 제공자 — 헤더 + 네브바가 붙는 화면 */}
        <Route element={<ProviderLayout />}>
          <Route path={PROVIDER_PATHS.home} element={<ProviderHomePage />} />
          <Route path={PROVIDER_PATHS.schedule} element={<ProviderSchedulePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
