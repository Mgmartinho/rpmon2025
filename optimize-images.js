import imagemin from 'imagemin';
import imageminWebp from 'imagemin-webp';
import imageminMozjpeg from 'imagemin-mozjpeg';
import imageminPngquant from 'imagemin-pngquant';
import imageminSvgo from 'imagemin-svgo';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================
// 🎨 SCRIPT DE OTIMIZAÇÃO DE IMAGENS
// ============================================

const sourceDir = join(__dirname, 'src', 'Imagens');
const outputDir = join(__dirname, 'src', 'Imagens-optimized');

console.log('\n🎨 Iniciando otimização de imagens...\n');
console.log(`📂 Origem: ${sourceDir}`);
console.log(`📂 Destino: ${outputDir}\n`);

// Criar diretório de saída se não existir
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function optimizeImages() {
  let totalOriginal = 0;
  let totalOptimized = 0;

  try {
    // 1. Converter PNG para WebP
    console.log('🔄 Convertendo PNG para WebP...');
    const pngFiles = await imagemin([`${sourceDir}/**/*.png`], {
      destination: outputDir,
      plugins: [
        imageminWebp({
          quality: 75,
          method: 6 // 0-6, quanto maior mais lento mas melhor qualidade
        })
      ],
      glob: true
    });
    console.log(`✅ ${pngFiles.length} arquivos PNG convertidos\n`);

    // 2. Otimizar e converter JPG para WebP
    console.log('🔄 Convertendo JPG/JPEG para WebP...');
    const jpgFiles = await imagemin([`${sourceDir}/**/*.{jpg,jpeg}`], {
      destination: outputDir,
      plugins: [
        imageminWebp({
          quality: 75
        })
      ],
      glob: true
    });
    console.log(`✅ ${jpgFiles.length} arquivos JPG convertidos\n`);

    // 3. Otimizar SVG
    console.log('🔄 Otimizando SVG...');
    const svgFiles = await imagemin([`${sourceDir}/**/*.svg`], {
      destination: outputDir,
      plugins: [
        imageminSvgo({
          plugins: [
            {
              name: 'removeViewBox',
              active: false
            },
            {
              name: 'cleanupIDs',
              active: true
            },
            {
              name: 'removeEmptyAttrs',
              active: true
            }
          ]
        })
      ],
      glob: true
    });
    console.log(`✅ ${svgFiles.length} arquivos SVG otimizados\n`);

    // Calcular economia
    [...pngFiles, ...jpgFiles, ...svgFiles].forEach(file => {
      const original = fs.statSync(file.sourcePath).size;
      const optimized = file.data.length;
      totalOriginal += original;
      totalOptimized += optimized;
    });

    const totalFiles = pngFiles.length + jpgFiles.length + svgFiles.length;
    const savings = totalOriginal - totalOptimized;
    const savingsPercent = ((savings / totalOriginal) * 100).toFixed(2);

    console.log('═'.repeat(60));
    console.log('📊 RESULTADOS DA OTIMIZAÇÃO');
    console.log('═'.repeat(60));
    console.log(`\n✅ Total de arquivos processados: ${totalFiles}`);
    console.log(`📦 Tamanho original: ${formatBytes(totalOriginal)}`);
    console.log(`📦 Tamanho otimizado: ${formatBytes(totalOptimized)}`);
    console.log(`💾 Economia: ${formatBytes(savings)} (${savingsPercent}%)`);
    console.log(`\n📂 Arquivos salvos em: ${outputDir}`);
    
    console.log('\n💡 PRÓXIMOS PASSOS:');
    console.log('1. Verifique as imagens otimizadas');
    console.log('2. Atualize os imports para usar as imagens otimizadas');
    console.log('3. Remova as imagens originais após validação');
    console.log('\nExemplo:');
    console.log('  // Antes: import img from "@/Imagens/foto.png"');
    console.log('  // Depois: import img from "@/Imagens-optimized/foto.webp"');

  } catch (error) {
    console.error('❌ Erro durante otimização:', error.message);
    process.exit(1);
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// Executar
optimizeImages().catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
