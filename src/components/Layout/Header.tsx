/**
 * Header コンポーネント
 * アプリケーションのヘッダー
 */

const Header: React.FC = () => {
  return (
    <header className="bg-primary text-white shadow-lg">
      <div className="container mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold sm:text-3xl">
            🏠 住宅ローン電卓
          </h1>
          <nav className="hidden sm:flex space-x-4">
            <button className="text-white hover:text-gray-200 transition">
              計算
            </button>
            <button className="text-white hover:text-gray-200 transition">
              履歴
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
