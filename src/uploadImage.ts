import net from 'net';
import InterconnectClient from '@xiaou66/interconnect-client';
import { type } from "node:os";
// 解构 ServiceClient
const { ServiceClient } = InterconnectClient;

/**
 * 上传图片接口返回结果
 */
export interface UploadResult {
  /**
   * 上传成功的图片URL
   */
  url: string;
  /**
   * 上传是否成功
   */
  success: boolean;
  /**
   * 错误信息（如果有）
   */
  error?: string;
}

/**
 * 上传图片选项
 */
export interface UploadOptions {
  /**
   * 图床源ID
   */
  uploadId: string;
  /**
   * 超时时间（毫秒）
   */
  timeout?: number;
}

/**
 * 上传图片到uTools图床Plus
 *
 * @param imagePath 图片路径
 * @param options 上传选项
 * @returns 上传结果
 */
export async function uploadImage(imagePath: string, options: UploadOptions): Promise<UploadResult> {
  const { uploadId, timeout = 15000 } = options;
  try {
    const serviceClient = new ServiceClient(net, 'picture-bed-plus',
      'command',
      type() === 'Windows_NT');

    const result = await serviceClient.callServiceMethod<{url: string}>('service.upload.file.sync', {
      filePath: imagePath,
      uploadWay: uploadId,
    }, { timeout });

    return {
      url: result?.url || '',
      success: !!result?.url
    };
  } catch (error: any) {
    if (error.message.includes('ECONNREFUSED')) {
      return {
        url: '',
        success: false,
        error: 'uTools 图床Plus 服务未启动，请先在 uTools 中打开 图床Plus 插件'
      };
    }
    return {
      url: '',
      success: false,
      error: error.message || '未知错误'
    };
  }
}

/**
 * 批量上传图片到uTools图床Plus
 *
 * @param imagePaths 图片路径数组
 * @param options 上传选项
 * @returns 上传结果数组
 */
export async function uploadImages(imagePaths: string[], options: UploadOptions): Promise<UploadResult[]> {
  const results: UploadResult[] = [];

  for (const imagePath of imagePaths) {
    const result = await uploadImage(imagePath, options);
    results.push(result);
  }

  return results;
}
