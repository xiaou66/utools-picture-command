const { program } = require('commander');
const InterconnectClient = require('@xiaou66/interconnect-client');
const net = require('net');

const { ServiceClient } = InterconnectClient;

// 版本和描述
const version = '1.0.0';
const description = '用于命令行上传图片到uTools图床Plus插件的工具';

program.version(version)
  .description(description);

program
  .arguments("<imagePaths...>")
  .description("图片地址，可传多个")
  .option('-u, --uploadId <uploadId>', '图床源,需要和「utools」图床Plus 填写存储源id')
  .option('-t, --timeout <timeout>', '上传超时时间（毫秒），默认15000', '15000')
  .action(async (imagePaths, { uploadId, timeout }, command) => {
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

/**
 * 上传图片到uTools图床Plus
 */
async function uploadImage(imagePath, options) {
  const { uploadId, timeout = 15000 } = options;

  try {
    const serviceClient = new ServiceClient(net, 'picture-bed-plus', 'command', false);

    const result = await serviceClient.callServiceMethod('service.upload.file.sync', {
      filePath: imagePath,
      uploadWay: uploadId,
    }, { timeout });

    return {
      url: result?.url || '',
      success: !!result?.url
    };
  } catch (error) {
    return {
      url: '',
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * 批量上传图片到uTools图床Plus
 */
async function uploadImages(imagePaths, options) {
  const results = [];

  for (const imagePath of imagePaths) {
    const result = await uploadImage(imagePath, options);
    results.push(result);
  }

  return results;
}
