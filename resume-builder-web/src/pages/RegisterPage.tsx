import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiFetch, parseApiError } from '../lib/api'
import { useAuth } from '../context/AuthContext'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [profileImageUrl, setProfileImageUrl] = useState<string | undefined>()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [uploading, setUploading] = useState(false)

  async function onPickImage(file: File | null) {
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append('image', file)
      const res = await apiFetch('/api/auth/upload-image', { method: 'POST', auth: false, body: fd })
      if (!res.ok) throw new Error(await parseApiError(res))
      const data = (await res.json()) as { imageUrl: string }
      setProfileImageUrl(data.imageUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : '이미지 업로드에 실패했습니다.')
    } finally {
      setUploading(false)
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setPending(true)
    try {
      await register({ email, name, password, profileImageUrl })
      navigate('/register/done', { state: { email } })
    } catch (err) {
      setError(err instanceof Error ? err.message : '가입에 실패했습니다.')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--wide">
        <Link to="/" className="auth-card__back">
          ← 홈
        </Link>
        <h1>회원가입</h1>
        <p className="muted">가입 후 이메일의 인증 링크를 눌러주세요.</p>
        <form className="form" onSubmit={onSubmit}>
          {error ? <div className="alert alert--error">{error}</div> : null}
          <label className="field">
            <span>이름 (2–15자)</span>
            <input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} maxLength={15} />
          </label>
          <label className="field">
            <span>이메일</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label className="field">
            <span>비밀번호 (6–15자)</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              maxLength={15}
            />
          </label>
          <div className="field">
            <span>프로필 이미지 (선택)</span>
            <div className="row row--gap">
              <input type="file" accept="image/*" onChange={(e) => void onPickImage(e.target.files?.[0] ?? null)} />
              {uploading ? <span className="muted">업로드 중…</span> : null}
            </div>
            {profileImageUrl ? (
              <img className="thumb-preview" src={profileImageUrl} alt="프로필 미리보기" />
            ) : null}
          </div>
          <button className="btn btn--primary btn--block" type="submit" disabled={pending}>
            {pending ? '처리 중…' : '가입하기'}
          </button>
        </form>
        <p className="auth-card__footer">
          이미 계정이 있나요? <Link to="/login">로그인</Link>
        </p>
      </div>
    </div>
  )
}
