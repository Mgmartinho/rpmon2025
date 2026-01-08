import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// 📦 ANÁLISE DE BUILD - FRONTEND REACT
// ============================================

class BuildAnalyzer {
  constructor(buildPath) {
    this.buildPath = buildPath;
    this.results = {
      totalSize: 0,
      files: [],
      byType: {},
      byDirectory: {}
    };
  }

  // 📊 Analisar diretório recursivamente
  analyzeDirectory(dirPath, relativePath = '') {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(dirPath, item.name);
      const relPath = path.join(relativePath, item.name);

      if (item.isDirectory()) {
        this.analyzeDirectory(fullPath, relPath);
      } else {
        const stats = fs.statSync(fullPath);
        const ext = path.extname(item.name).toLowerCase();
        
        const fileInfo = {
          name: item.name,
          path: relPath,
          size: stats.size,
          sizeFormatted: this.formatBytes(stats.size),
          extension: ext || 'no-ext'
        };

        this.results.files.push(fileInfo);
        this.results.totalSize += stats.size;

        // Agrupar por tipo
        if (!this.results.byType[ext || 'other']) {
          this.results.byType[ext || 'other'] = {
            count: 0,
            totalSize: 0,
            files: []
          };
        }
        this.results.byType[ext || 'other'].count++;
        this.results.byType[ext || 'other'].totalSize += stats.size;
        this.results.byType[ext || 'other'].files.push(fileInfo);

        // Agrupar por diretório
        const dir = path.dirname(relPath) || 'root';
        if (!this.results.byDirectory[dir]) {
          this.results.byDirectory[dir] = {
            count: 0,
            totalSize: 0,
            files: []
          };
        }
        this.results.byDirectory[dir].count++;
        this.results.byDirectory[dir].totalSize += stats.size;
        this.results.byDirectory[dir].files.push(fileInfo);
      }
    }
  }

  // 📈 Gerar relatório
  generateReport() {
    console.log('\n' + '='.repeat(70));
    console.log('📦 ANÁLISE DE BUILD - FRONTEND REACT');
    console.log('='.repeat(70));

    if (!fs.existsSync(this.buildPath)) {
      console.log('\n❌ Pasta build/ não encontrada!');
      console.log('Execute "npm run build" antes de rodar esta análise.\n');
      return null;
    }

    this.analyzeDirectory(this.buildPath);

    // Resumo geral
    console.log('\n📊 RESUMO GERAL');
    console.log('-'.repeat(70));
    console.log(`Tamanho Total: ${this.formatBytes(this.results.totalSize)}`);
    console.log(`Total de Arquivos: ${this.results.files.length}`);

    // Por tipo de arquivo
    console.log('\n📋 ANÁLISE POR TIPO DE ARQUIVO');
    console.log('-'.repeat(70));
    
    const sortedTypes = Object.entries(this.results.byType)
      .sort((a, b) => b[1].totalSize - a[1].totalSize);

    sortedTypes.forEach(([ext, data]) => {
      const percentage = ((data.totalSize / this.results.totalSize) * 100).toFixed(2);
      console.log(`${ext.padEnd(15)} | ${data.count.toString().padStart(4)} arquivos | ${this.formatBytes(data.totalSize).padStart(10)} | ${percentage}%`);
    });

    // Maiores arquivos
    console.log('\n🔝 TOP 20 MAIORES ARQUIVOS');
    console.log('-'.repeat(70));
    
    const sortedFiles = [...this.results.files]
      .sort((a, b) => b.size - a.size)
      .slice(0, 20);

    sortedFiles.forEach((file, index) => {
      console.log(`${(index + 1).toString().padStart(2)}. ${file.sizeFormatted.padStart(10)} | ${file.path}`);
    });

    // Por diretório
    console.log('\n📁 ANÁLISE POR DIRETÓRIO');
    console.log('-'.repeat(70));
    
    const sortedDirs = Object.entries(this.results.byDirectory)
      .sort((a, b) => b[1].totalSize - a[1].totalSize)
      .slice(0, 15);

    sortedDirs.forEach(([dir, data]) => {
      console.log(`${this.formatBytes(data.totalSize).padStart(10)} | ${data.count.toString().padStart(4)} arquivos | ${dir}`);
    });

    // Análise específica de JavaScript
    if (this.results.byType['.js']) {
      console.log('\n📜 ANÁLISE DETALHADA - JAVASCRIPT');
      console.log('-'.repeat(70));
      
      const jsFiles = this.results.byType['.js'].files
        .sort((a, b) => b.size - a.size);

      let mainBundleSize = 0;
      let chunkTotalSize = 0;

      jsFiles.forEach(file => {
        if (file.name.includes('main.') || file.name.includes('bundle.')) {
          mainBundleSize += file.size;
          console.log(`📦 Bundle principal: ${file.name} - ${file.sizeFormatted}`);
        } else if (file.name.match(/\d+\.[a-f0-9]+\.chunk\.js/)) {
          chunkTotalSize += file.size;
        }
      });

      console.log(`\nBundle Principal: ${this.formatBytes(mainBundleSize)}`);
      console.log(`Chunks: ${this.formatBytes(chunkTotalSize)}`);
      console.log(`Total JS: ${this.formatBytes(this.results.byType['.js'].totalSize)}`);
    }

    // Análise específica de CSS
    if (this.results.byType['.css']) {
      console.log('\n🎨 ANÁLISE DETALHADA - CSS');
      console.log('-'.repeat(70));
      
      const cssFiles = this.results.byType['.css'].files
        .sort((a, b) => b.size - a.size);

      cssFiles.forEach(file => {
        console.log(`${file.sizeFormatted.padStart(10)} | ${file.name}`);
      });

      console.log(`\nTotal CSS: ${this.formatBytes(this.results.byType['.css'].totalSize)}`);
    }

    // Análise de imagens
    const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.ico', '.jfif'];
    const imageFiles = this.results.files.filter(f => 
      imageExts.includes(f.extension.toLowerCase())
    );

    if (imageFiles.length > 0) {
      console.log('\n🖼️  ANÁLISE DE IMAGENS');
      console.log('-'.repeat(70));
      
      const totalImageSize = imageFiles.reduce((sum, f) => sum + f.size, 0);
      console.log(`Total de Imagens: ${imageFiles.length}`);
      console.log(`Tamanho Total: ${this.formatBytes(totalImageSize)}`);
      console.log(`Percentual do Build: ${((totalImageSize / this.results.totalSize) * 100).toFixed(2)}%`);

      // Maiores imagens
      const largestImages = [...imageFiles]
        .sort((a, b) => b.size - a.size)
        .slice(0, 10);

      console.log('\n🔝 10 Maiores Imagens:');
      largestImages.forEach((img, i) => {
        console.log(`${(i + 1).toString().padStart(2)}. ${img.sizeFormatted.padStart(10)} | ${img.path}`);
      });
    }

    // Requisitos estimados
    console.log('\n💾 ESTIMATIVA DE REQUISITOS');
    console.log('-'.repeat(70));
    
    const buildSizeMB = this.results.totalSize / 1024 / 1024;
    const estimatedRAM = buildSizeMB * 3; // Fator de 3x para runtime
    const cacheSize = buildSizeMB * 1.5; // Cache do navegador

    console.log(`Tamanho do Build: ${buildSizeMB.toFixed(2)} MB`);
    console.log(`RAM Estimada (runtime): ${estimatedRAM.toFixed(2)} MB`);
    console.log(`Cache do Navegador: ${cacheSize.toFixed(2)} MB`);
    console.log(`Largura de Banda (download inicial): ${buildSizeMB.toFixed(2)} MB`);

    // Recomendações
    console.log('\n💡 RECOMENDAÇÕES DE OTIMIZAÇÃO');
    console.log('-'.repeat(70));

    const recommendations = [];

    if (buildSizeMB > 5) {
      recommendations.push('⚠️  Build muito grande (> 5 MB). Considere:');
      recommendations.push('   - Implementar code splitting');
      recommendations.push('   - Lazy loading de rotas');
      recommendations.push('   - Otimizar/comprimir imagens');
    }

    if (imageFiles.length > 0) {
      const avgImageSize = imageFiles.reduce((sum, f) => sum + f.size, 0) / imageFiles.length;
      if (avgImageSize > 100000) {
        recommendations.push('⚠️  Imagens grandes detectadas. Considere:');
        recommendations.push('   - Converter para WebP');
        recommendations.push('   - Implementar lazy loading');
        recommendations.push('   - Usar CDN para assets');
      }
    }

    const jsSize = this.results.byType['.js']?.totalSize || 0;
    if (jsSize > 1000000) {
      recommendations.push('⚠️  JavaScript grande (> 1 MB). Considere:');
      recommendations.push('   - Analisar dependências com webpack-bundle-analyzer');
      recommendations.push('   - Remover bibliotecas não utilizadas');
      recommendations.push('   - Code splitting por rota');
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ Build otimizado! Continue assim.');
    }

    recommendations.forEach(rec => console.log(rec));

    // Performance Score
    console.log('\n⭐ PONTUAÇÃO DE PERFORMANCE');
    console.log('-'.repeat(70));
    
    let score = 100;
    
    if (buildSizeMB > 5) score -= 20;
    else if (buildSizeMB > 3) score -= 10;
    else if (buildSizeMB > 1) score -= 5;

    if (jsSize > 1500000) score -= 15;
    else if (jsSize > 1000000) score -= 10;
    else if (jsSize > 500000) score -= 5;

    if (imageFiles.length > 0) {
      const avgImageSize = imageFiles.reduce((sum, f) => sum + f.size, 0) / imageFiles.length;
      if (avgImageSize > 200000) score -= 15;
      else if (avgImageSize > 100000) score -= 10;
    }

    const scoreEmoji = score >= 90 ? '🟢' : score >= 70 ? '🟡' : '🔴';
    console.log(`${scoreEmoji} Score: ${score}/100`);

    if (score >= 90) console.log('Excelente! Build altamente otimizado.');
    else if (score >= 70) console.log('Bom, mas há espaço para melhorias.');
    else console.log('Precisa de otimização significativa.');

    console.log('\n' + '='.repeat(70));
    console.log('✅ ANÁLISE CONCLUÍDA');
    console.log('='.repeat(70));

    return {
      ...this.results,
      buildSizeMB,
      estimatedRAM,
      score,
      recommendations
    };
  }

  // 🔧 Utilitários
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}

// 🏃 Executar análise
const buildPath = path.join(__dirname, 'build');
const analyzer = new BuildAnalyzer(buildPath);

try {
  const results = analyzer.generateReport();
  
  if (results) {
    // Salvar relatório
    const reportPath = path.join(__dirname, `build-analysis-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    console.log(`\n📄 Relatório detalhado salvo em: ${path.basename(reportPath)}\n`);
  }
} catch (error) {
  console.error('❌ Erro durante análise:', error.message);
}
