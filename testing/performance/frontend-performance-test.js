// Frontend Performance Tests using Lighthouse and Web Vitals
// This script measures Core Web Vitals and overall performance

import lighthouse from 'lighthouse';
import chromeLauncher from 'chrome-launcher';
import { writeFileSync } from 'fs';
import { join } from 'path';

// Performance test configuration
const config = {
  baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3000',
  outputDir: './testing/reports',
  thresholds: {
    performance: 90,
    accessibility: 95,
    bestPractices: 90,
    seo: 80,
    // Core Web Vitals thresholds
    firstContentfulPaint: 1800,      // 1.8s
    largestContentfulPaint: 2500,    // 2.5s
    cumulativeLayoutShift: 0.1,      // 0.1
    totalBlockingTime: 200,          // 200ms
    speedIndex: 3000                 // 3s
  },
  pages: [
    { path: '/', name: 'landing' },
    { path: '/dashboard', name: 'dashboard' },
    { path: '/trades', name: 'trades' },
    { path: '/trades/new', name: 'trade-form' },
    { path: '/statistics', name: 'statistics' },
    { path: '/planning', name: 'planning' },
    { path: '/tradesage', name: 'tradesage' }
  ]
};

// Custom Lighthouse configuration
const lighthouseConfig = {
  extends: 'lighthouse:default',
  settings: {
    onlyAudits: [
      'first-contentful-paint',
      'largest-contentful-paint',
      'cumulative-layout-shift',
      'total-blocking-time',
      'speed-index',
      'interactive',
      'performance-score',
      'accessibility-score',
      'best-practices-score',
      'seo-score'
    ],
  },
};

class PerformanceTester {
  constructor() {
    this.results = [];
    this.chrome = null;
  }

  async setup() {
    console.log('🚀 Starting Frontend Performance Tests');
    console.log(`📍 Target URL: ${config.baseUrl}`);
    
    // Launch Chrome
    this.chrome = await chromeLauncher.launch({
      chromeFlags: [
        '--headless',
        '--disable-gpu',
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=TranslateUI'
      ]
    });
    
    console.log(`🔧 Chrome launched on port ${this.chrome.port}`);
  }

  async testPage(page) {
    const url = `${config.baseUrl}${page.path}`;
    console.log(`📊 Testing ${page.name}: ${url}`);
    
    try {
      // Run Lighthouse audit
      const result = await lighthouse(url, {
        port: this.chrome.port,
        disableDeviceEmulation: false,
        chromeFlags: ['--disable-mobile-emulation']
      }, lighthouseConfig);
      
      // Extract key metrics
      const metrics = this.extractMetrics(result.lhr);
      
      // Evaluate against thresholds
      const evaluation = this.evaluateMetrics(metrics, page.name);
      
      const pageResult = {
        page: page.name,
        url: url,
        timestamp: new Date().toISOString(),
        metrics: metrics,
        evaluation: evaluation,
        lighthouse: {
          performance: result.lhr.categories.performance.score * 100,
          accessibility: result.lhr.categories.accessibility.score * 100,
          bestPractices: result.lhr.categories['best-practices'].score * 100,
          seo: result.lhr.categories.seo.score * 100
        }
      };
      
      this.results.push(pageResult);
      
      // Save individual report
      const reportPath = join(config.outputDir, `lighthouse-${page.name}.html`);
      writeFileSync(reportPath, result.report);
      
      console.log(`✅ ${page.name} completed`);
      console.log(`   Performance: ${pageResult.lighthouse.performance.toFixed(1)}`);
      console.log(`   LCP: ${metrics.largestContentfulPaint}ms`);
      console.log(`   CLS: ${metrics.cumulativeLayoutShift}`);
      
      return pageResult;
      
    } catch (error) {
      console.error(`❌ Error testing ${page.name}: ${error.message}`);
      return {
        page: page.name,
        url: url,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  extractMetrics(lhr) {
    const audits = lhr.audits;
    
    return {
      firstContentfulPaint: Math.round(audits['first-contentful-paint'].numericValue),
      largestContentfulPaint: Math.round(audits['largest-contentful-paint'].numericValue),
      cumulativeLayoutShift: Math.round(audits['cumulative-layout-shift'].numericValue * 1000) / 1000,
      totalBlockingTime: Math.round(audits['total-blocking-time'].numericValue),
      speedIndex: Math.round(audits['speed-index'].numericValue),
      timeToInteractive: Math.round(audits['interactive'].numericValue),
      // Additional metrics
      domSize: audits['dom-size']?.numericValue || 0,
      resourceSummary: this.extractResourceSummary(lhr),
      networkRequests: audits['network-requests']?.details?.items?.length || 0
    };
  }

  extractResourceSummary(lhr) {
    const networkRequests = lhr.audits['network-requests']?.details?.items || [];
    
    const summary = {
      totalRequests: networkRequests.length,
      totalTransferSize: 0,
      totalResourceSize: 0,
      byType: {}
    };
    
    networkRequests.forEach(request => {
      const resourceType = request.resourceType || 'other';
      
      if (!summary.byType[resourceType]) {
        summary.byType[resourceType] = {
          count: 0,
          transferSize: 0,
          resourceSize: 0
        };
      }
      
      summary.byType[resourceType].count++;
      summary.byType[resourceType].transferSize += request.transferSize || 0;
      summary.byType[resourceType].resourceSize += request.resourceSize || 0;
      
      summary.totalTransferSize += request.transferSize || 0;
      summary.totalResourceSize += request.resourceSize || 0;
    });
    
    return summary;
  }

  evaluateMetrics(metrics, pageName) {
    const evaluation = {
      passed: 0,
      failed: 0,
      warnings: 0,
      details: []
    };
    
    // Check each threshold
    const checks = [
      {
        name: 'First Contentful Paint',
        value: metrics.firstContentfulPaint,
        threshold: config.thresholds.firstContentfulPaint,
        unit: 'ms',
        comparison: 'less'
      },
      {
        name: 'Largest Contentful Paint',
        value: metrics.largestContentfulPaint,
        threshold: config.thresholds.largestContentfulPaint,
        unit: 'ms',
        comparison: 'less'
      },
      {
        name: 'Cumulative Layout Shift',
        value: metrics.cumulativeLayoutShift,
        threshold: config.thresholds.cumulativeLayoutShift,
        unit: '',
        comparison: 'less'
      },
      {
        name: 'Total Blocking Time',
        value: metrics.totalBlockingTime,
        threshold: config.thresholds.totalBlockingTime,
        unit: 'ms',
        comparison: 'less'
      },
      {
        name: 'Speed Index',
        value: metrics.speedIndex,
        threshold: config.thresholds.speedIndex,
        unit: 'ms',
        comparison: 'less'
      }
    ];
    
    checks.forEach(check => {
      const passed = check.comparison === 'less' 
        ? check.value <= check.threshold
        : check.value >= check.threshold;
      
      if (passed) {
        evaluation.passed++;
      } else {
        evaluation.failed++;
      }
      
      evaluation.details.push({
        metric: check.name,
        value: check.value,
        threshold: check.threshold,
        unit: check.unit,
        passed: passed,
        difference: check.comparison === 'less' 
          ? check.value - check.threshold
          : check.threshold - check.value
      });
    });
    
    return evaluation;
  }

  async runAllTests() {
    await this.setup();
    
    console.log(`📝 Testing ${config.pages.length} pages`);
    
    for (const page of config.pages) {
      await this.testPage(page);
      
      // Brief pause between tests
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    await this.generateSummaryReport();
    await this.cleanup();
  }

  async generateSummaryReport() {
    console.log('📋 Generating performance summary report');
    
    const summary = {
      testRun: {
        timestamp: new Date().toISOString(),
        totalPages: config.pages.length,
        baseUrl: config.baseUrl,
        thresholds: config.thresholds
      },
      overallMetrics: this.calculateOverallMetrics(),
      pageResults: this.results,
      recommendations: this.generateRecommendations()
    };
    
    // Save summary as JSON
    const summaryPath = join(config.outputDir, 'performance-summary.json');
    writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    
    // Generate HTML report
    const htmlReport = this.generateHtmlReport(summary);
    const htmlPath = join(config.outputDir, 'performance-report.html');
    writeFileSync(htmlPath, htmlReport);
    
    // Console summary
    this.printConsoleSummary(summary);
    
    console.log(`📁 Reports saved to:`);
    console.log(`   JSON: ${summaryPath}`);
    console.log(`   HTML: ${htmlPath}`);
  }

  calculateOverallMetrics() {
    const validResults = this.results.filter(r => !r.error);
    
    if (validResults.length === 0) {
      return null;
    }
    
    const averages = {
      performance: validResults.reduce((sum, r) => sum + r.lighthouse.performance, 0) / validResults.length,
      accessibility: validResults.reduce((sum, r) => sum + r.lighthouse.accessibility, 0) / validResults.length,
      bestPractices: validResults.reduce((sum, r) => sum + r.lighthouse.bestPractices, 0) / validResults.length,
      seo: validResults.reduce((sum, r) => sum + r.lighthouse.seo, 0) / validResults.length,
      firstContentfulPaint: validResults.reduce((sum, r) => sum + r.metrics.firstContentfulPaint, 0) / validResults.length,
      largestContentfulPaint: validResults.reduce((sum, r) => sum + r.metrics.largestContentfulPaint, 0) / validResults.length,
      cumulativeLayoutShift: validResults.reduce((sum, r) => sum + r.metrics.cumulativeLayoutShift, 0) / validResults.length,
      totalBlockingTime: validResults.reduce((sum, r) => sum + r.metrics.totalBlockingTime, 0) / validResults.length,
      speedIndex: validResults.reduce((sum, r) => sum + r.metrics.speedIndex, 0) / validResults.length
    };
    
    const thresholdsPassed = validResults.reduce((sum, r) => {
      return sum + r.evaluation.passed;
    }, 0);
    
    const totalThresholds = validResults.reduce((sum, r) => {
      return sum + r.evaluation.passed + r.evaluation.failed;
    }, 0);
    
    return {
      ...averages,
      thresholdPassRate: totalThresholds > 0 ? (thresholdsPassed / totalThresholds) * 100 : 0,
      worstPerformingPage: validResults.reduce((worst, current) => 
        current.lighthouse.performance < worst.lighthouse.performance ? current : worst
      ).page,
      bestPerformingPage: validResults.reduce((best, current) => 
        current.lighthouse.performance > best.lighthouse.performance ? current : best
      ).page
    };
  }

  generateRecommendations() {
    const recommendations = [];
    const validResults = this.results.filter(r => !r.error);
    
    // Check for common issues
    const avgLCP = validResults.reduce((sum, r) => sum + r.metrics.largestContentfulPaint, 0) / validResults.length;
    if (avgLCP > config.thresholds.largestContentfulPaint) {
      recommendations.push({
        priority: 'high',
        metric: 'Largest Contentful Paint',
        issue: `Average LCP (${Math.round(avgLCP)}ms) exceeds threshold (${config.thresholds.largestContentfulPaint}ms)`,
        suggestions: [
          'Optimize largest content elements (images, videos)',
          'Implement lazy loading for non-critical resources',
          'Use next-gen image formats (WebP, AVIF)',
          'Optimize server response times',
          'Implement resource preloading for critical assets'
        ]
      });
    }
    
    const avgCLS = validResults.reduce((sum, r) => sum + r.metrics.cumulativeLayoutShift, 0) / validResults.length;
    if (avgCLS > config.thresholds.cumulativeLayoutShift) {
      recommendations.push({
        priority: 'medium',
        metric: 'Cumulative Layout Shift',
        issue: `Average CLS (${avgCLS.toFixed(3)}) exceeds threshold (${config.thresholds.cumulativeLayoutShift})`,
        suggestions: [
          'Set explicit dimensions for images and videos',
          'Reserve space for dynamic content',
          'Avoid inserting content above existing content',
          'Use CSS containment for layout-heavy components'
        ]
      });
    }
    
    const avgTBT = validResults.reduce((sum, r) => sum + r.metrics.totalBlockingTime, 0) / validResults.length;
    if (avgTBT > config.thresholds.totalBlockingTime) {
      recommendations.push({
        priority: 'high',
        metric: 'Total Blocking Time',
        issue: `Average TBT (${Math.round(avgTBT)}ms) exceeds threshold (${config.thresholds.totalBlockingTime}ms)`,
        suggestions: [
          'Split large JavaScript bundles',
          'Implement code splitting and lazy loading',
          'Minimize main thread work',
          'Remove unused JavaScript',
          'Optimize third-party scripts'
        ]
      });
    }
    
    return recommendations;
  }

  generateHtmlReport(summary) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Trading Journal - Performance Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric-card { background: #f8f9fa; padding: 15px; border-radius: 6px; border-left: 4px solid #007bff; }
        .metric-value { font-size: 24px; font-weight: bold; color: #007bff; }
        .metric-label { color: #666; font-size: 14px; }
        .page-results { margin: 30px 0; }
        .page-result { margin: 15px 0; padding: 15px; border: 1px solid #ddd; border-radius: 6px; }
        .recommendations { background: #fff3cd; padding: 15px; border-radius: 6px; margin: 20px 0; }
        .recommendation { margin: 10px 0; }
        .priority-high { border-left: 4px solid #dc3545; }
        .priority-medium { border-left: 4px solid #ffc107; }
        .priority-low { border-left: 4px solid #28a745; }
        .pass { color: #28a745; }
        .fail { color: #dc3545; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f8f9fa; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Trading Journal Performance Report</h1>
            <p>Generated: ${summary.testRun.timestamp}</p>
            <p>Base URL: ${summary.testRun.baseUrl}</p>
        </div>
        
        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-value">${Math.round(summary.overallMetrics.performance)}</div>
                <div class="metric-label">Performance Score</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${Math.round(summary.overallMetrics.largestContentfulPaint)}ms</div>
                <div class="metric-label">Avg LCP</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${summary.overallMetrics.cumulativeLayoutShift.toFixed(3)}</div>
                <div class="metric-label">Avg CLS</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${Math.round(summary.overallMetrics.thresholdPassRate)}%</div>
                <div class="metric-label">Thresholds Passed</div>
            </div>
        </div>
        
        <div class="page-results">
            <h2>Page Results</h2>
            ${summary.pageResults.map(page => `
                <div class="page-result">
                    <h3>${page.page}</h3>
                    <p><strong>URL:</strong> ${page.url}</p>
                    ${page.error ? `<p class="fail">Error: ${page.error}</p>` : `
                        <table>
                            <tr><th>Metric</th><th>Value</th><th>Threshold</th><th>Status</th></tr>
                            ${page.evaluation.details.map(detail => `
                                <tr>
                                    <td>${detail.metric}</td>
                                    <td>${detail.value}${detail.unit}</td>
                                    <td>${detail.threshold}${detail.unit}</td>
                                    <td class="${detail.passed ? 'pass' : 'fail'}">${detail.passed ? 'PASS' : 'FAIL'}</td>
                                </tr>
                            `).join('')}
                        </table>
                    `}
                </div>
            `).join('')}
        </div>
        
        <div class="recommendations">
            <h2>Recommendations</h2>
            ${summary.recommendations.map(rec => `
                <div class="recommendation priority-${rec.priority}">
                    <h3>${rec.metric}</h3>
                    <p><strong>Issue:</strong> ${rec.issue}</p>
                    <p><strong>Suggestions:</strong></p>
                    <ul>
                        ${rec.suggestions.map(suggestion => `<li>${suggestion}</li>`).join('')}
                    </ul>
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>`;
  }

  printConsoleSummary(summary) {
    console.log('\n📊 Performance Test Summary');
    console.log('═══════════════════════════════');
    console.log(`🎯 Overall Performance Score: ${Math.round(summary.overallMetrics.performance)}/100`);
    console.log(`📈 Threshold Pass Rate: ${Math.round(summary.overallMetrics.thresholdPassRate)}%`);
    console.log(`🏆 Best Page: ${summary.overallMetrics.bestPerformingPage}`);
    console.log(`⚠️  Worst Page: ${summary.overallMetrics.worstPerformingPage}`);
    console.log('\n🎯 Core Web Vitals Averages:');
    console.log(`   LCP: ${Math.round(summary.overallMetrics.largestContentfulPaint)}ms`);
    console.log(`   CLS: ${summary.overallMetrics.cumulativeLayoutShift.toFixed(3)}`);
    console.log(`   TBT: ${Math.round(summary.overallMetrics.totalBlockingTime)}ms`);
    
    if (summary.recommendations.length > 0) {
      console.log(`\n⚠️  ${summary.recommendations.length} Recommendations Generated`);
      summary.recommendations.forEach(rec => {
        console.log(`   ${rec.priority.toUpperCase()}: ${rec.metric}`);
      });
    }
    
    console.log('\n✅ Performance testing completed');
  }

  async cleanup() {
    if (this.chrome) {
      await this.chrome.kill();
      console.log('🔧 Chrome instance closed');
    }
  }
}

// Run the performance test
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new PerformanceTester();
  
  tester.runAllTests()
    .then(() => {
      console.log('✅ All performance tests completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Performance test failed:', error);
      process.exit(1);
    });
}

export default PerformanceTester;
