import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, var(--border) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight animate-slide-up">
            席決めを、
            <span className="bg-gradient-to-r from-indigo-500 to-emerald-500 bg-clip-text text-transparent">
              もっとスマートに
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-[var(--text-muted)] max-w-2xl mx-auto animate-fade-in">
            飲み会や会議の席順を自動で最適化。
            男女バランス、NG ペア、固定席などの制約を考慮して理想の席配置を生成します。
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
            <Link
              href="/members"
              className="btn btn-primary text-lg px-8 py-3"
            >
              今すぐ始める
            </Link>
            <a
              href="#features"
              className="btn btn-secondary text-lg px-8 py-3"
            >
              機能を見る
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-[var(--secondary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">主な機能</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon="👥"
              title="メンバー管理"
              description="名前、ニックネーム、性別、タグを設定してメンバーを登録。グループ分けも簡単。"
            />
            <FeatureCard
              icon="🪑"
              title="テンプレート選択"
              description="直線型、円卓型、島型など、様々なレイアウトテンプレートから選択できます。"
            />
            <FeatureCard
              icon="🎨"
              title="自由レイアウト"
              description="キャンバス上で席や人を自由にドラッグ＆ドロップ。Pan & Zoom で快適操作。"
            />
            <FeatureCard
              icon="⚙️"
              title="制約設定"
              description="男女バランス、固定席、NG ペアなど、様々な制約条件を設定可能。"
            />
            <FeatureCard
              icon="🔄"
              title="自動配置"
              description="設定した制約を考慮しながら、最適な席配置を自動生成します。"
            />
            <FeatureCard
              icon="🔗"
              title="URL 共有"
              description="生成した結果は URL で簡単に共有。参加者全員に配布できます。"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">使い方</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <StepCard
              step={1}
              title="メンバー登録"
              description="参加者の名前と情報を入力"
            />
            <StepCard
              step={2}
              title="テンプレート選択"
              description="席のレイアウトを選択"
            />
            <StepCard
              step={3}
              title="制約設定"
              description="希望する条件を設定"
            />
            <StepCard
              step={4}
              title="シャッフル"
              description="最適な席配置を生成"
            />
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/members"
              className="btn btn-primary text-lg px-8 py-3"
            >
              始めてみる
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-[var(--text-muted)]">
          <p>© 2024 SeatCraft. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-[var(--text-muted)]">{description}</p>
    </div>
  );
}

function StepCard({
  step,
  title,
  description,
}: {
  step: number;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 rounded-full bg-[var(--primary)] text-white font-bold text-xl flex items-center justify-center mx-auto mb-4">
        {step}
      </div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-[var(--text-muted)]">{description}</p>
    </div>
  );
}
