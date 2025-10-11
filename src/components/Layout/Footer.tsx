/**
 * Footer コンポーネント
 * アプリケーションのフッター
 */

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="text-center text-sm text-gray-600">
          <p>© {currentYear} 住宅ローン電卓. All rights reserved.</p>
          <p className="mt-1 text-xs">
            本アプリケーションの計算結果は参考値です。実際の金額は金融機関にご確認ください。
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
