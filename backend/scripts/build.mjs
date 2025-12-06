import * as esbuild from 'esbuild';
import * as fs from 'fs';
import * as path from 'path';

const handlers = [
    { name: 'shuffle-handler', entry: 'src/infrastructure/handlers/shuffle-handler.ts' },
    { name: 'result-handler', entry: 'src/infrastructure/handlers/result-handler.ts' },
];

async function build() {
    // dist ディレクトリをクリーンアップ
    if (fs.existsSync('dist')) {
        fs.rmSync('dist', { recursive: true });
    }

    for (const handler of handlers) {
        const outdir = path.join('dist', handler.name);

        await esbuild.build({
            entryPoints: [handler.entry],
            bundle: true,
            platform: 'node',
            target: 'node22',
            outfile: path.join(outdir, 'index.js'),
            format: 'cjs', // Lambda は CommonJS の方が安定
            external: ['@aws-sdk/*'],
            sourcemap: false,
            minify: false,
        });

        console.log(`✓ Built ${handler.name}`);
    }

    console.log('\n✅ Build completed successfully!');
}

build().catch((err) => {
    console.error('Build failed:', err);
    process.exit(1);
});
