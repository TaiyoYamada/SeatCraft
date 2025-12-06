import Link from "next/link";
import { Users, LayoutGrid, MousePointerClick, Settings, Shuffle, Link2 } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">

        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent-muted)] via-[var(--color-bg)] to-[var(--color-accent-secondary-muted)]" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, var(--color-seat-border) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground animate-slide-up">
            席決めを、
            <span className="bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-secondary)] bg-clip-text text-transparent">
              もっとスマートに
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in">
            飲み会や会議の席順を自動で最適化。
            男女バランス、NG ペア、固定席などの制約を考慮して理想の席配置を生成します。
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
            <Link
              href="/members"
              className="inline-flex items-center justify-center px-8 py-3 text-lg font-medium rounded-lg bg-primary text-primary-foreground shadow-md hover:shadow-lg hover:translate-y-[-1px] transition-all active:scale-[0.97]"
            >
              今すぐ始める
            </Link>
            <a
              href="#features"
              className="inline-flex items-center justify-center px-8 py-3 text-lg font-medium rounded-lg border border-border bg-background text-foreground shadow-sm hover:shadow-md hover:bg-secondary/50 transition-all"
            >
              機能を見る
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">主な機能</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Users className="w-8 h-8" />}
              title="メンバー管理"
              description="名前、ニックネーム、性別、タグを設定してメンバーを登録。グループ分けも簡単。"
            />
            <FeatureCard
              icon={<LayoutGrid className="w-8 h-8" />}
              title="テンプレート選択"
              description="直線型、円卓型、島型など、様々なレイアウトテンプレートから選択できます。"
            />
            <FeatureCard
              icon={<MousePointerClick className="w-8 h-8" />}
              title="自由レイアウト"
              description="キャンバス上で席や人を自由にドラッグ＆ドロップ。Pan & Zoom で快適操作。"
            />
            <FeatureCard
              icon={<Settings className="w-8 h-8" />}
              title="制約設定"
              description="男女バランス、固定席、NG ペアなど、様々な制約条件を設定可能。"
            />
            <FeatureCard
              icon={<Shuffle className="w-8 h-8" />}
              title="自動配置"
              description="設定した制約を考慮しながら、最適な席配置を自動生成します。"
            />
            <FeatureCard
              icon={<Link2 className="w-8 h-8" />}
              title="URL 共有"
              description="生成した結果は URL で簡単に共有。参加者全員に配布できます。"
            />
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
          <p>© 2025 SeatCraft. All rights reserved.</p>
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
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 rounded-xl border border-border bg-background shadow-sm hover:shadow-md transition-shadow">
      <div className="w-12 h-12 rounded-lg bg-[var(--color-accent-muted)] text-[var(--color-accent)] flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2 text-foreground">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
