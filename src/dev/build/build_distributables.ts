/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { ToolingLog } from '@kbn/dev-utils';

import { Config, createRunner } from './lib';
import * as Tasks from './tasks';

export interface BuildOptions {
  isRelease: boolean;
  buildOssDist: boolean;
  buildDefaultDist: boolean;
  downloadFreshNode: boolean;
  createArchives: boolean;
  createRpmPackage: boolean;
  createDebPackage: boolean;
  createDockerPackage: boolean;
  createDockerUbiPackage: boolean;
  versionQualifier: string | undefined;
  targetAllPlatforms: boolean;
}

export async function buildDistributables(log: ToolingLog, options: BuildOptions) {
  log.verbose('building distributables with options:', options);

  const config = await Config.create(options);

  const run = createRunner({
    config,
    log,
    buildDefaultDist: options.buildDefaultDist,
    buildOssDist: options.buildOssDist,
  });

  /**
   * 验证、重置和初始化构建环境
   */
  await run(Tasks.VerifyEnv); // 环境确认
  await run(Tasks.Clean); // 上次编译文件清除
  await run(options.downloadFreshNode ? Tasks.DownloadNodeBuilds : Tasks.VerifyExistingNodeBuilds); // 下载node环境资源
  await run(Tasks.ExtractNodeBuilds); // 构建node节点

  /**
   * 运行平台通用的构建任务
   */
  await run(Tasks.CopySource); // 复制文件到编译目录
  await run(Tasks.CopyBinScripts); // 复制bin脚本到编译目录
  await run(Tasks.CreateEmptyDirsAndFiles); // 创建空目录和文件
  await run(Tasks.CreateReadme); // 创建Readme
  await run(Tasks.BuildPackages); // 构建软件包
  await run(Tasks.CreatePackageJson); // 创建PackageJson
  await run(Tasks.InstallDependencies); // 为编译目录文件安装依赖
  await run(Tasks.BuildKibanaPlatformPlugins); // 构建kibana平台插件
  await run(Tasks.TranspileBabel); // 解析转译器文件
  await run(Tasks.RemoveWorkspaces); // 删除工作空间
  await run(Tasks.CleanPackages); // 清除工具包
  await run(Tasks.CreateNoticeFile); // 创建公告文件
  await run(Tasks.UpdateLicenseFile); // 更新许可证文件
  await run(Tasks.RemovePackageJsonDeps); // 删除PackageJson依赖
  await run(Tasks.CleanTypescript); // 清除ts
  await run(Tasks.CleanExtraFilesFromModules); // 清除模块中多余文件
  await run(Tasks.CleanEmptyFolders); // 清除空文件夹

  /**
   * 将通用构建输出复制到特定于平台的构建目录中，并执行特定于平台/体系结构的步骤
   */
  await run(Tasks.CreateArchivesSources); // 创建平台资源
  await run(Tasks.PatchNativeModules); // 补丁原生模块
  await run(Tasks.InstallChromium); // 安装浏览器插件
  await run(Tasks.CleanExtraBinScripts); // 清除多余bin脚本
  await run(Tasks.CleanNodeBuilds); // 清除node节点

  await run(Tasks.PathLength);
  await run(Tasks.UuidVerification);

  /**
   * 将特定于平台的构建包打包到归档文件中，或者将特定于操作系统的包打包到目标目录中
   */
  if (options.createArchives) {
    // control w/ --skip-archives
    await run(Tasks.CreateArchives);
  }
  if (options.createDebPackage) {
    // control w/ --deb or --skip-os-packages
    await run(Tasks.CreateDebPackage); // 创建deb包
  }
  if (options.createRpmPackage) {
    // control w/ --rpm or --skip-os-packages
    await run(Tasks.CreateRpmPackage);
  }
  if (options.createDockerPackage) {
    // control w/ --docker or --skip-docker-ubi or --skip-os-packages
    await run(Tasks.CreateDockerPackage);
    if (options.createDockerUbiPackage) {
      await run(Tasks.CreateDockerUbiPackage);
    }
  }

  /**
   * 将每个工件的sha1sum写入目标目录
   */
  await run(Tasks.WriteShaSums); // 写入sha1sum验证
}
