import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [needVerification, setNeedVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resendMsg, setResendMsg] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNeedVerification(false);
    setResendMsg('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      if (err.response?.data?.need_verification) {
        setNeedVerification(true);
      }
      setError(err.response?.data?.error || '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await api.post('/auth/resend-verification', { email: form.email });
      setResendMsg('인증 메일을 재발송했어요. 메일함을 확인해주세요.');
    } catch {
      setResendMsg('재발송에 실패했어요. 잠시 후 다시 시도해주세요.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">로그인</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 pr-16 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-indigo-600"
              >
                {showPassword ? '숨기기' : '보기'}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">
              <p>{error}</p>
              {needVerification && (
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-indigo-600 hover:underline mt-1"
                >
                  인증 메일 다시 받기
                </button>
              )}
            </div>
          )}

          {resendMsg && (
            <p className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">{resendMsg}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-4 text-center">
          계정이 없으신가요?{' '}
          <Link to="/register" className="text-indigo-600 hover:underline">회원가입</Link>
        </p>
      </div>
    </div>
  );
}