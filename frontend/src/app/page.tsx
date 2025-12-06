import Link from "next/link";
import Image from "next/image";
import { Users, LayoutGrid, MousePointerClick, Settings, Shuffle, Link2, ArrowRight, CheckCircle2, ChevronRight } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative flex items-center justify-center min-h-[85vh] overflow-hidden">
        {/* Background Image - Clear and Sharp */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-bg-clear.png"
            alt="Table setting background"
            fill
            className="object-cover opacity-80 pointer-events-none"
            priority
          />
          {/* Gradients for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-background/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>

        <div className="container relative z-10 px-4 md:px-6 flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in-95 duration-700">
          <div className="space-y-6 max-w-4xl mx-auto">
            {/* <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-accent-muted)]/50 text-[var(--color-accent)] text-sm font-medium mb-4 border border-[var(--color-accent)]/20 backdrop-blur-sm animate-in slide-in-from-top-4 delay-200">
              <span className="flex h-2 w-2 rounded-full bg-[var(--color-accent)]"></span>
              New: スマホでの操作性が向上しました
            </div> */}

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground drop-shadow-sm leading-tight">
              席決めを、
              <span className="block mt-2 bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-secondary)] bg-clip-text text-transparent pb-2">
                もっとスマートに
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-lg md:text-xl text-muted-foreground font-medium leading-relaxed">
              飲み会、会議、イベントの席順を自動で最適化。<br className="hidden md:inline" />
              面倒な調整はすべて SeatCraft にお任せください。
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-6 mx-auto">
            <Button size="lg" className="h-14 px-10 text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all w-full sm:w-auto rounded-full font-bold" asChild>
              <Link href="/members">
                今すぐ始める <ChevronRight className="ml-1 w-5 h-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="h-14 px-10 text-lg bg-background/60 backdrop-blur-md border border-[var(--color-border)] hover:bg-background/80 w-full sm:w-auto rounded-full" asChild>
              <Link href="#features">
                機能を見る
              </Link>
            </Button>
          </div>

          <div className="pt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm font-medium text-foreground/80 animate-in fade-in delay-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[var(--color-accent-secondary)]" />
              <span>完全無料</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[var(--color-accent-secondary)]" />
              <span>登録不要</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[var(--color-accent-secondary)]" />
              <span>Web完結</span>
            </div>
            {/* <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[var(--color-accent-secondary)]" />
              <span>スマホ対応</span>
            </div> */}
          </div>
        </div>
      </section>

      {/* Visual Feature Section with Photos */}
      <section id="features" className="py-24 bg-background relative z-10">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              あらゆるシーンに対応
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              小規模な飲み会から大規模なイベントまで。<br />直感的な操作で、誰でも簡単に美しい席次表を作成できます。
            </p>
          </div>

          <div className="space-y-24">
            {/* Feature 1: Members */}
            <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
              <div className="w-full md:w-1/2 relative h-[300px] md:h-[400px] rounded-2xl overflow-hidden shadow-2xl group">
                <Image
                  src="/feature-members.png"
                  alt="Happy group dining"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
              </div>
              <div className="w-full md:w-1/2 space-y-6 text-center md:text-left">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--color-accent-muted)]/50 text-[var(--color-accent)] mx-auto md:mx-0">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                  メンバー管理を<br />もっと自由に
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  参加者の名前、ニックネーム、性別を簡単登録。
                  「あの人とあの人は離したい」「このグループは固めたい」といった細かい条件も設定可能です。
                </p>
                <div className="pt-2">
                  <Button variant="link" className="text-[var(--color-accent)] p-0 h-auto font-semibold group" asChild>
                    <Link href="/members">
                      メンバー登録へ <ArrowRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Feature 2: Layout */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-20">
              <div className="w-full md:w-1/2 relative h-[300px] md:h-[400px] rounded-2xl overflow-hidden shadow-2xl group">
                <Image
                  src="/feature-venue.png"
                  alt="Venue layout"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
              </div>
              <div className="w-full md:w-1/2 space-y-6 text-center md:text-left">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--color-accent-secondary-muted)]/50 text-[var(--color-accent-secondary)] mx-auto md:mx-0">
                  <LayoutGrid className="w-6 h-6" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                  直感的な<br />レイアウト作成
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  テンプレートから選ぶだけではありません。
                  キャンバスモードでは、ドラッグ＆ドロップで席を自由に配置。会場の形に合わせた柔軟なレイアウトが可能です。
                </p>
                <div className="pt-2">
                  <Button variant="link" className="text-[var(--color-accent-secondary)] p-0 h-auto font-semibold group" asChild>
                    <Link href="/layouts/templates">
                      テンプレートを見る <ArrowRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Feature 3: Smart Shuffle */}
            <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
              <div className="w-full md:w-1/2 relative h-[300px] md:h-[400px] rounded-2xl overflow-hidden shadow-2xl group">
                <Image
                  src="/feature-digital.png"
                  alt="Smart planning"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
              </div>
              <div className="w-full md:w-1/2 space-y-6 text-center md:text-left">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--color-accent-muted)]/50 text-[var(--color-accent)] mx-auto md:mx-0">
                  <Shuffle className="w-6 h-6" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                  一瞬で完了する<br />スマート配置
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  設定した複雑な条件を考慮し、AIのような賢さで最適な席順を自動生成。
                  気に入らなければ何度でもシャッフルできます。
                </p>
                <div className="pt-2">
                  <Button variant="link" className="text-[var(--color-accent)] p-0 h-auto font-semibold group" asChild>
                    <Link href="/craft">
                      キャンバスで試す <ArrowRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Grid Feature List */}
      <section className="py-24 bg-[var(--color-bg-secondary)]/50">
        <div className="container px-4 md:px-6 mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-16">その他の便利な機能</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <SimpleFeatureCard
              icon={<Settings className="w-6 h-6" />}
              title="詳細設定"
              description="男女比の調整や、特定のタグを持つ人同士の距離など、細かいルールを設定できます。"
            />
            <SimpleFeatureCard
              icon={<MousePointerClick className="w-6 h-6" />}
              title="ドラッグ＆ドロップ"
              description="直感的な操作で、誰でも迷わず理想の配置を実現できます。"
            />
            <SimpleFeatureCard
              icon={<Link2 className="w-6 h-6" />}
              title="URL共有"
              description="作成した席次表はURLで共有。アプリのインストールなしで閲覧できます。"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden bg-background">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent)]/5 to-[var(--color-accent-secondary)]/5" />
        <div className="container relative px-4 md:px-6 mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
            さあ、始めましょう
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            アカウント登録なしで、今すぐ無料で利用できます。<br />
            まずはメンバー登録から。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button size="lg" className="h-14 px-12 text-xl rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all" asChild>
              <Link href="/members">
                無料で始める
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t bg-background">
        <div className="container px-4 md:px-6 mx-auto flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <span className="text-lg font-bold text-foreground">SeatCraft</span>
            <p>© 2025 SeatCraft. All rights reserved.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            <Link href="#" className="hover:text-[var(--color-accent)] transition-colors">利用規約</Link>
            <Link href="#" className="hover:text-[var(--color-accent)] transition-colors">プライバシーポリシー</Link>
            <a
              href="https://github.com/TaiyoYamada"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--color-accent)] transition-colors"
            >
              運営会社
            </a>
            <a
              href="https://forms.gle/SzFwmxeZJA9JnPPe6"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--color-accent)] transition-colors"
            >
              お問い合わせ
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SimpleFeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-background p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
      <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4 text-foreground">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-foreground">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}
