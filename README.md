# Kibana

## 项目描述

Kibana 作为主机安全的前端工程，旨在与 Elasticsearch、Wazuh 服务协同工作，用来搜索、查看交互存储于服务端的数据。

## 项目的基本结构

Kibana 工程结构中值得一提的文件夹功能如下：

packages 提供了一些 es 及 kbn 的工具包。
script 提供一些启动脚本。
src 下为 kibana 核心代码实现。

日常开发重点关注以下位置：
config/kibana.yml 文件配置 kibana 连接 es 的相关信息。
data/wazuh/config/wazuh.yml 文件配置 kibana 连接 wazuh 的相关信息。
plugins/opendistroSecurityKibana 实现登录功能及页面。
plugins/wazuh 为主要业务页面实现代码。

## 项目架构

Kibana 的实现包括 web 层和服务层。日常开发主要在 plugins 文件夹下进行。其中 web 相关实现基本归纳在 public 文件夹下，node 实现在 server 下。

## 项目技术栈

Kibana 的服务层使用 nodejs 实现，主要包括接口的封装与后台服务调用的转接层。web 层涉及 react 和 angular 的混用。编码语言 typescript 与 javascript 并存。

## 项目详细介绍

Kibana 开发可以在 Windows 环境下进行，编译只能在 Linux 环境下进行。

### Windows 开发环境准备

可参考官方文档 [Windows 开发环境准备](https://www.elastic.co/guide/en/kibana/master/development-getting-started.html#development-getting-started)

安装环境记录
  1.安装nvm，nodejs（项目要求使用 node 版本为 v10.23.1，可使用 nvm 来管理 node 版本。注意：要先把原 node 卸载，参考下方链接说明）
    [参考文档](https://docs.microsoft.com/zh-cn/windows/dev-environment/javascript/nodejs-on-windows)
  2.安装 git
  3.安装 Visual C++ Redistributable for Visual Studio 2015
    [参考文档](https://www.microsoft.com/zh-cn/download/details.aspx?id=48145)
  4.需要启用 Windows 开发者模式
    [参考文档](https://docs.microsoft.com/zh-cn/windows/apps/get-started/enable-your-device-for-development)
    1）安装Visual Studio（版本不是非要15，可以2022）
      [参考文档](https://docs.microsoft.com/zh-cn/windows/apps/windows-app-sdk/set-up-your-development-environment?tabs=vs-2022-17-1-a%2Cvs-2022-17-1-b)
    2）安装 Visual C++ 构建环境：安装“使用 C++ 进行桌面开发”工作负载
    3）启动cmd（如果安装2022版vs末尾写2022）
      npm config set msvs_version 2022
    4）启用开发者模式
      [参考文档](https://jingyan.baidu.com/article/0a52e3f4e4bea2bf62ed72da.html)
  5.启用8.3文件名支持
    在具有管理员权限的 Windows 命令提示符中运行以下命令：fsutil 8dot3name set 0
  6.安装 yarn
    npm install --global yarn
  7.设置yarn镜像源
    yarn config set registry https://registry.npm.taobao.org/
  8.安装Python
    [参考文档](https://docs.python.org/3/using/windows.html#the-microsoft-store-package)
  9.设置环境变量来阻止下载 Chromium
    yarn config set PUPPETEER_SKIP_CHROMIUM_DOWNLOAD 1

### 开发项目准备

1.从git仓库拉取源码
2.为项目安装依赖
  在项目目录 git bash 窗口：yarn kbn bootstrap
  Tips：
  安装依赖过程中报错可清除缓存和依赖重新安装
  清除缓存：yarn cache clean
  清除依赖：yarn kbn clean
3.补充插件依赖
  在 kibana/plugins/wazuh 目录：npm i
4.修改连接es服务密码
  kibana/config/kibana.yml 文件内配置连接的es服务信息，需要修改连接es服务的路径和密码（elasticsearch.hosts 与 elasticsearch.password）。可查看测试环境中 /etc/kibana/kibana.yml 文件内 elasticsearch.hosts 与 elasticsearch.password
5.运行项目
  yarn start --run-examples --oss
6.首次运行成功后 kibana/data 文件夹下生成 wazuh 文件夹。kibana/data/wazuh/config/wazuh.yml 文件配置连接的 wazuh 服务信息，默认 url 指向本地，需修改 url 指向测试环境。修改后无需重启即可生效
7.默认登录账密
  账号：master
  密码：Master.123

### Linux 编译环境准备

编译环境准备思路是，通过运行脚本在编译环境内安装固定版本 Centos 环境的 Docker，在 Docker 容器内通过运行脚本安装编译环境。脚本资源与编译环境准备及编译过程可参考交付文档。

## 版本升级说明

版本升级开发完成后，编译出 deb 安装包，执行以下安装部署步骤：
1）将 deb 安装包上传到部署环境，执行安装
  dpkg -i --force-overwrite kibana-oss-7.10.2-amd64.deb
2）将 Kibana 套接字链接到特权端口 443：
  setcap 'cap_net_bind_service=+ep' /usr/share/kibana/node/bin/node
3）启动 Kibana 服务：
  systemctl start kibana
4）查看 Kibana 服务日志：
  journalctl -f -u kibana.service
