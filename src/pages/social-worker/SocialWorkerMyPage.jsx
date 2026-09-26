import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getErrorMessage } from "../../api/client";
import { logout, updateMe, withdraw } from "../../api/endpoints/auth";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { ChevronRightIcon } from "../../components/ui/Icons";
import { useAuth } from "../../features/auth/useAuth";
import { PATHS, SOCIAL_WORKER_PATHS } from "../../constants/paths";
import styles from "./SocialWorkerMyPage.module.css";

const PHONE_HINT = "숫자만 입력해 주세요 (9~11자리, 하이픈 없이)";
const NAME_HINT = "한글 또는 영문만 입력할 수 있어요.";

/**
 * 사회복지사 마이페이지
 *
 * 이름/연락처/소속 지역 확인 및 수정과
 * 비밀번호 변경, 로그아웃, 회원 탈퇴 기능을 제공한다.
 */
function SocialWorkerMyPage() {
  const navigate = useNavigate();
  const me = useAuth();

  const [editing, setEditing] = useState(null);
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const openTextEdit = (field) => {
    setEditing(field);
    setValue(field === "name" ? me.data.name : me.data.phone);
    setError("");
  };

  /**
   * 서버에서는 시/도와 시/군/구를 각각 수정하지 않고
   * regionId 단위로 소속 지역을 변경한다.
   */
  const openRegionEdit = () => {
    setEditing("region");
    setError("");
  };

  const cancelEdit = () => {
    setEditing(null);
    setValue("");
    setError("");
  };

  const saveText = async () => {
    setSubmitting(true);
    setError("");

    try {
      await updateMe({ [editing]: value });
      await me.reload();
      setEditing(null);
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      setSubmitting(false);
    }
  };

  const signOut = async () => {
    await logout().catch(() => {});
    navigate(PATHS.login, { replace: true });
  };

  // 서버 탈퇴 API에서 현재 비밀번호 확인이 필요해 기존 Provider 흐름과 동일하게 처리한다.
  const removeAccount = async () => {
    const currentPassword = window.prompt(
      "본인 확인을 위해 현재 비밀번호를 입력해 주세요.",
    );

    if (!currentPassword) return;

    try {
      await withdraw({ currentPassword });
      navigate(PATHS.login, { replace: true });
    } catch (caught) {
      window.alert(getErrorMessage(caught));
    }
  };

  if (me.status !== "success") {
    return (
      <p className={styles.state} role="status">
        {me.status === "error"
          ? getErrorMessage(me.error)
          : "내 정보를 불러오는 중이에요"}
      </p>
    );
  }

  return (
    <section className={styles.page}>
      <section className={styles.section}>
        <h2 className={styles.heading}>내 정보</h2>

        <div className={styles.infoCard}>
          <div className={styles.infoRow}>
            <div className={styles.infoText}>
              <span className={styles.label}>이름</span>
              <strong className={styles.value}>{me.data.name}</strong>
            </div>

            <Button
              size="sm"
              variant="secondary"
              block={false}
              className={styles.editButton}
              onClick={() => openTextEdit("name")}
            >
              수정
            </Button>
          </div>

          <div className={styles.infoRow}>
            <div className={styles.infoText}>
              <span className={styles.label}>연락처</span>
              <strong className={styles.value}>{me.data.phone}</strong>
            </div>

            <Button
              size="sm"
              variant="secondary"
              block={false}
              className={styles.editButton}
              onClick={() => openTextEdit("phone")}
            >
              수정
            </Button>
          </div>

          <div className={styles.infoRow}>
            <div className={styles.infoText}>
              <span className={styles.label}>시/도</span>
              <strong className={styles.value}>
                {me.data.province || "-"}
              </strong>
            </div>

            <Button
              size="sm"
              variant="secondary"
              block={false}
              className={styles.editButton}
              onClick={openRegionEdit}
            >
              수정
            </Button>
          </div>

          <div className={styles.infoRow}>
            <div className={styles.infoText}>
              <span className={styles.label}>시/군/구</span>
              <strong className={styles.value}>
                {me.data.district || "-"}
              </strong>
            </div>

            <Button
              size="sm"
              variant="secondary"
              block={false}
              className={styles.editButton}
              onClick={openRegionEdit}
            >
              수정
            </Button>
          </div>
        </div>

        {(editing === "name" || editing === "phone") && (
          <div className={styles.editCard}>
            <Input
              label={editing === "name" ? "이름" : "연락처"}
              value={value}
              error={error}
              hint={editing === "name" ? NAME_HINT : PHONE_HINT}
              onChange={(event) => setValue(event.target.value)}
            />

            <div className={styles.editActions}>
              <Button variant="outline" onClick={cancelEdit}>
                취소
              </Button>

              <Button loading={submitting} onClick={saveText}>
                저장하기
              </Button>
            </div>
          </div>
        )}
        {editing === "region" && (
          <div className={styles.editCard}>
            <div className={styles.notice}>
              <strong className={styles.noticeTitle}>
                소속 지역 변경 기능은 추후 제공될 예정입니다.
              </strong>

              <p className={styles.noticeDescription}>
                현재는 등록된 소속 지역 정보만 확인할 수 있어요.
              </p>
            </div>

            <div className={styles.noticeActions}>
              <Button variant="outline" onClick={cancelEdit}>
                확인
              </Button>
            </div>
          </div>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>계정 관리</h2>

        <button
          type="button"
          className={styles.passwordButton}
          onClick={() => navigate(SOCIAL_WORKER_PATHS.password)}
        >
          <span>비밀번호 변경</span>
          <ChevronRightIcon className={styles.chevron} />
        </button>

        <div className={styles.accountActions}>
          <button
            type="button"
            className={styles.logoutButton}
            onClick={signOut}
          >
            로그아웃
          </button>

          <button
            type="button"
            className={styles.withdrawButton}
            onClick={removeAccount}
          >
            탈퇴하기
          </button>
        </div>
      </section>
    </section>
  );
}

export default SocialWorkerMyPage;
