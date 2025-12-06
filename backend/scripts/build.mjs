import * as esbuild from 'esbuild';
import * as fs from 'fs';

const handlers = [
    { name: 'shuffle-handler', entry: 'src/infrastructure/handlers/shuffle-handler.ts' },
    { name: 'result-handler', entry: 'src/infrastructure/handlers/result-handler.ts' },
    { name: 'save-handler', entry: 'src/infrastructure/handlers/save-handler.ts' },
];

async function build() {
    // dist ディレクトリをクリーンアップ
    if (fs.existsSync('dist')) {
        fs.rmSync('dist', { recursive: true });
    }
    fs.mkdirSync('dist');

    for (const handler of handlers) {
        await esbuild.build({
            entryPoints: [handler.entry],
            bundle: true,
            platform: 'node',
            target: 'node22',
            outfile: `dist/${handler.name}.js`,
            format: 'cjs',
            external: ['@aws-sdk/*'],
            sourcemap: false,
            minify: false,
        });

        console.log(`✓ Built ${handler.name}.js`);
    }

    console.log('\n✅ Build completed successfully!');
}

build().catch((err) => {
    console.error('Build failed:', err);
    process.exit(1);
});
