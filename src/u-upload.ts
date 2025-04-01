import { program } from "commander";
import pkg from "../package.json";
import { uploadImages } from './uploadImage';
import { execSync } from 'node:child_process'
program.version(pkg.version)
  .description(pkg.description)


function openURL(url: string) {
  let command;
  // 根据操作系统选择合适的命令
  switch (process.platform) {
    case 'darwin': // macOS
      command = `open "${url}"`;
      break;
    case 'win32': // Windows
      command = `start "${url}"`;
      break;
    case 'linux': // Linux
      command = `xdg-open "${url}"`;
      break;
    default:
      console.error('Unsupported platform');
      return
  }

  execSync(command);
}
program
  .arguments("<imagePaths...>")
  .description("图片地址，可传多个")
  .option('-u, --uploadId <uploadId>', '图床源,需要和「utools」图床Plus 填写存储源id')
  .option('-t, --timeout <timeout>', '上传超时时间（毫秒），默认15000', '15000')
  .action(async (imagePaths: string[], { uploadId, timeout }, command) => {
    try {
      const results = await uploadImages(imagePaths, {
        uploadId,
        timeout: parseInt(timeout, 10)
      });

      // 输出结果
      let successCount = 0;
      results.forEach((result, index) => {
        if (result.success) {
          console.log(result.url);
          successCount++;
        } else {
          if (result.error?.includes('服务未启动')) {
            openURL('utools://图床 Plus/图床');
          }
          console.log(result.error)
        }
      });
      process.exit(successCount > 0 ? 0 : 1);
    } catch (e) {
      console.error('上传过程出现错误:', e instanceof Error ? e.message : String(e));
      process.exit(1);
    }
  });

program.parse();
