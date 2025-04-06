import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

interface FileCheck {
    path: string;
    minSize?: number;  // 最小大小（字节）
    maxSize?: number;  // 最大大小（字节）
    required: boolean; // 是否必需
}

interface ManifestJson {
    manifest_version: number;
    name: string;
    version: string;
    description: string;
    icons?: { [key: string]: string };
    background?: { service_worker: string };
    action?: { default_popup: string };
    options_page?: string;
    content_scripts?: Array<{
        matches: string[];
        css?: string[];
        js?: string[];
    }>;
    permissions?: string[];
    host_permissions?: string[];
}

// 定义需要检查的文件列表
const filesToCheck: FileCheck[] = [
    // 主要JS文件
    { path: 'dist/background/background.js', required: true },
    { path: 'dist/options/options.js', required: true },
    { path: 'dist/content/content.js', required: true },
    { path: 'dist/popup/popup.js', required: true },
    
    // HTML文件
    { path: 'dist/options/options.html', required: true },
    { path: 'dist/popup/popup.html', required: true },
    
    // CSS文件
    { path: 'dist/options/options.css', required: true },
    { path: 'dist/content/styles/index.css', required: true },
    { path: 'dist/popup/popup.css', required: true },
    
    // 图标文件
    { path: 'dist/assets/icon16.png', required: true },
    { path: 'dist/assets/icon48.png', required: true },
    { path: 'dist/assets/icon128.png', required: true },
    { path: 'dist/assets/icon.svg', required: true },
    
    // manifest文件
    { path: 'dist/manifest.json', required: true },
];

// 计算文件哈希值
function calculateFileHash(filePath: string): string {
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
}

// 检查文件大小是否在合理范围内
function checkFileSize(filePath: string, minSize?: number, maxSize?: number): boolean {
    const stats = fs.statSync(filePath);
    if (minSize && stats.size < minSize) {
        console.error(`❌ ${filePath} 文件太小: ${stats.size} bytes (最小应为 ${minSize} bytes)`);
        return false;
    }
    if (maxSize && stats.size > maxSize) {
        console.error(`❌ ${filePath} 文件太大: ${stats.size} bytes (最大应为 ${maxSize} bytes)`);
        return false;
    }
    console.log(`✅ ${filePath} 大小正常: ${stats.size} bytes`);
    return true;
}

// 检查manifest中引用的文件是否都存在
function checkManifestReferences(manifestPath: string): boolean {
    const manifest: ManifestJson = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    let allFilesExist = true;

    // 检查图标文件
    if (manifest.icons) {
        Object.values(manifest.icons).forEach(iconPath => {
            const fullPath = path.join('dist', iconPath);
            if (!fs.existsSync(fullPath)) {
                console.error(`❌ Manifest引用的图标文件不存在: ${fullPath}`);
                allFilesExist = false;
            }
        });
    }

    // 检查background脚本
    if (manifest.background?.service_worker) {
        const fullPath = path.join('dist', manifest.background.service_worker);
        if (!fs.existsSync(fullPath)) {
            console.error(`❌ Manifest引用的background脚本不存在: ${fullPath}`);
            allFilesExist = false;
        }
    }

    // 检查popup文件
    if (manifest.action?.default_popup) {
        const fullPath = path.join('dist', manifest.action.default_popup);
        if (!fs.existsSync(fullPath)) {
            console.error(`❌ Manifest引用的popup文件不存在: ${fullPath}`);
            allFilesExist = false;
        }
    }

    // 检查options页面
    if (manifest.options_page) {
        const fullPath = path.join('dist', manifest.options_page);
        if (!fs.existsSync(fullPath)) {
            console.error(`❌ Manifest引用的options页面不存在: ${fullPath}`);
            allFilesExist = false;
        }
    }

    // 检查content scripts
    if (manifest.content_scripts) {
        manifest.content_scripts.forEach(script => {
            if (script.js) {
                script.js.forEach(jsPath => {
                    const fullPath = path.join('dist', jsPath);
                    if (!fs.existsSync(fullPath)) {
                        console.error(`❌ Manifest引用的content script不存在: ${fullPath}`);
                        allFilesExist = false;
                    }
                });
            }
            if (script.css) {
                script.css.forEach(cssPath => {
                    const fullPath = path.join('dist', cssPath);
                    if (!fs.existsSync(fullPath)) {
                        console.error(`❌ Manifest引用的CSS文件不存在: ${fullPath}`);
                        allFilesExist = false;
                    }
                });
            }
        });
    }

    return allFilesExist;
}

// 生成构建报告
function generateBuildReport(files: FileCheck[]): void {
    const report = {
        timestamp: new Date().toISOString(),
        totalFiles: files.length,
        filesChecked: 0,
        filesMissing: 0,
        filesWithSizeIssues: 0,
        hashes: {} as { [key: string]: string }
    };

    files.forEach(file => {
        const filePath = file.path;
        if (!fs.existsSync(filePath)) {
            if (file.required) {
                console.error(`❌ 必需文件不存在: ${filePath}`);
                report.filesMissing++;
            } else {
                console.warn(`⚠️ 可选文件不存在: ${filePath}`);
            }
            return;
        }

        report.filesChecked++;
        const sizeCheckPassed = checkFileSize(filePath, file.minSize, file.maxSize);
        if (!sizeCheckPassed) {
            report.filesWithSizeIssues++;
        }
        report.hashes[filePath] = calculateFileHash(filePath);
    });

    // 检查manifest引用
    const manifestReferencesValid = checkManifestReferences('dist/manifest.json');

    // 输出报告摘要
    console.log('\n📊 构建检查报告');
    console.log('-------------------');
    console.log(`检查时间: ${report.timestamp}`);
    console.log(`检查的文件总数: ${report.totalFiles}`);
    console.log(`成功检查的文件: ${report.filesChecked}`);
    console.log(`缺失的文件数: ${report.filesMissing}`);
    console.log(`大小异常的文件数: ${report.filesWithSizeIssues}`);
    console.log(`Manifest引用检查: ${manifestReferencesValid ? '✅ 通过' : '❌ 失败'}`);
    
    // 保存报告到文件
    const reportPath = path.join('dist', 'build-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📝 详细报告已保存到: ${reportPath}`);

    // 如果有任何错误，抛出异常
    if (report.filesMissing > 0 || report.filesWithSizeIssues > 0 || !manifestReferencesValid) {
        throw new Error('构建检查失败，请查看上述错误信息');
    }
}

// 运行检查
try {
    console.log('🔍 开始检查构建输出...\n');
    generateBuildReport(filesToCheck);
    console.log('\n✅ 构建检查完成，一切正常！');
} catch (error) {
    console.error('\n❌ 构建检查失败！');
    console.error(error);
    process.exit(1);
} 