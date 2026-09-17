import { useAuth } from '../context/AuthContext';

const dummyPosts = [
  { id: 1, author: '익명1', title: '첫 게시글입니다', content: '커뮤니티 오픈을 환영해요!', createdAt: '방금 전' },
  { id: 2, author: '익명2', title: '반갑습니다', content: '잘 부탁드려요 :)', createdAt: '10분 전' },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-gray-900">게시글</h1>
        {user && (
          <button className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700">
            글쓰기
          </button>
        )}
      </div>

      <div className="space-y-4">
        {dummyPosts.map((post) => (
          <div
            key={post.id}
            className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <h2 className="font-semibold text-gray-900 mb-1">{post.title}</h2>
            <p className="text-sm text-gray-600 mb-3">{post.content}</p>
            <div className="text-xs text-gray-400">
              {post.author} · {post.createdAt}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}