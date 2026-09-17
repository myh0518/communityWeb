import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.post(`/auth/verify-email/${token}`)
      .then((res) => {
        setStatus('success');
        setMessage(res.data.message);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.error || '인증에 실패했습니다.');
      });
  }, [token]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
        {status === 'loading' && <p className="text-gray-600">인증 확인 중...</p>}

        {status === 'success' && (
          <>
            <h1 className="text-xl font-bold text-gray-900 mb-3">인증 완료 ✅</h1>
            <p className="text-sm text-gray-600 mb-6">{message}</p>
            <Link to="/login" className="text-indigo-600 hover:underline text-sm">
              로그인하러 가기
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <h1 className="text-xl font-bold text-gray-900 mb-3">인증 실패 ❌</h1>
            <p className="text-sm text-gray-600 mb-6">{message}</p>
            <Link to="/login" className="text-indigo-600 hover:underline text-sm">
              로그인 페이지로
            </Link>
          </>
        )}
      </div>
    </div>
  );
}