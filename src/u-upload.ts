import { program } from "commander";
import pkg from "../package.json";
import { uploadImages } from './uploadImage';

program.version(pkg.version)
  .description(pkg.description)

program
  .arguments("<imagePaths...>")
  .description("图片地址，可传多个")
  .option('-u, --uploadId <uploadId>', '图床源,需要和「utools」图床Plus 填写存储源id')
  .option('-t, --timeout <timeout>', '上传超时时间（毫秒），默认15000', '15000')
  .action(async (imagePaths: string[], { uploadId, timeout }, command) => {
    if (!uploadId) {
      console.error('错误：必须提供 uploadId 参数');
      process.exit(1);
    }

    console.log(`开始上传 ${imagePaths.length} 个文件到图床...`);
    
    try {
      const results = await uploadImages(imagePaths, {
        uploadId,
        timeout: parseInt(timeout, 10)
      });
      
      // 输出结果
      let successCount = 0;
      results.forEach((result, index) => {
        if (result.success) {
          console.log(`${imagePaths[index]}: ${result.url}`);
          successCount++;
        } else {
          console.error(`${imagePaths[index]}: 上传失败 - ${result.error}`);
        }
      });
      
      console.log(`上传完成，成功: ${successCount}/${imagePaths.length}`);
      process.exit(successCount > 0 ? 0 : 1);
    } catch (e) {
      console.error('上传过程出现错误:', e instanceof Error ? e.message : String(e));
      process.exit(1);
    }
  });

program.parse();
