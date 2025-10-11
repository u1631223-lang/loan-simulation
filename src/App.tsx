import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-primary mb-4">
          住宅ローン電卓
        </h1>
        <p className="text-gray-600 mb-4">
          プロジェクトセットアップ完了
        </p>
        <button
          onClick={() => setCount((count) => count + 1)}
          className="bg-secondary text-white px-6 py-2 rounded hover:bg-green-600 transition"
        >
          Count: {count}
        </button>
      </div>
    </div>
  )
}

export default App
