---
title: 使用 GitHub Pages 和 Travis CI 搭建自动构建的 Hexo 博客
date: 2020-02-22 23:29:02
tags: 
  - Hexo
  - GitHub
  - Travis CI
---

## 简介
  Hexo 是个好东西，GitHub Pages 也是个好东西，那如何将这两个好东西放在一起用呢？那就是用 Travis CI 了。

  <!-- more -->

  本文的目的是使用 Travis CI 来自动生成并提交 Hexo 生成的静态页面到 GitHub Pages 仓库。


## 准备工作
  - 一个良好的网络
  - 一个 [GitHub](https://github.com) 账号
  - 配置好 Git 
  - 参考 Hexo 文档装好 hexo-cli （[文档地址](https://hexo.io/zh-cn/docs/#安装)）


## 启用 Travis CI
  使用 GitHub 账号登录 [Travis CI](https://travis-ci.com/) ，授权 Travis CI 获取 GitHub 账户的资料。完成后，会跳转到 Travis CI 的页面，页面里面应该会提示你 **Activate all repositories using GitHub Apps** （对所有 GitHub 项目启用 Travis CI 自动构建），点击按钮后授权，以后新建的项目就都会自动启用 Travis CI 了。


## 创建 GitHub Repositories
  在 GitHub 上创建 GP 仓库（仓库名为 GitHub 用户名 + `.github.io` ）和博客源码仓库（以下为 `blog-factory` ），均设置为公开仓库即可。

  > *Note*: 如果你不被人看到源码，那源码仓库也可以为私密仓库，但是 Travis CI 的自动构建只对公开仓库免费，私密仓库据说只有前一百次免费。

  创建完仓库后，将源码仓库克隆至本地。


## 准备博客源码
  - 在本地创建一个空文件夹（这里为 `blog-temp` ），用来生成博客的源码。

  > *Note*: 之所以要另起一个文件夹是因为 Hexo 的 init 指令只能作用于空文件夹。

  - 在终端中打开 `blog-temp` 并执行以下命令：
    `hexo init .`
    执行完毕后，将 `blog-temp` 的内容复制到源码仓库 `blog-factory` 的文件夹中。（ `.git` 文件夹不要复制。）



## 修改博客配置
  Hexo 博客的配置文件是项目根目录的 `_config.yml` ，根据需求修改配置文件。
  如果要安装主题、插件之类，也在这里配置好。


## 测试博客
  - 执行 `hexo server --debug`
    确认是否能正常生成博客文件。
  - 访问 http://localhost:4000
    确定博客能正常访问，没有 404 或者其他错误。

  完成后 Ctrl + C 结束进程，执行 `hexo clean` 清理无用文件。


## 编写 Travis CI 配置文件
  在项目根目录创建文件 `.travis.yml` 。（注意，是以 **.** 开头的文件，在一些文件管理器中可能不会直接显示，需要打开相关设置。）
  接下来在这个文件里面写入以下内容：
  ```
  language: node_js # 设置语言类型
  node_js: stable # 选择版本
  sudo: false # 设置权限

  branches: # 设置触发 CI 运行的分支
    only:
      - source

  cache: # 设置缓存，可以有效提高 CI 编译的速度
    directories:
      - node_modules
   
  before_install: # 设置在安装之前的一些操作
    - export TZ='Asia/Shanghai' # 设置时区，于本地时间同步，防止一些时间的错误
  
  install: # 安装需要的工具
    - npm install -g hexo-cli # 安装 Hexo 
    - npm install # 安装 Hexo 依赖
    # 如果有需要安装的插件，或者是主题需要安装的依赖，也一并在在这里安装
    # 切换目录后最终需要回到根目录，注意返回

  script:
    - hexo g # 生成静态 HTML 文件

  after_script:
    - cd ./public
    - git init
    - git config user.name "${GH_NAME}"
    - git config user.email "${GH_EMAIL}"
    - git add .
    - git commit -m "Travis CI Auto Builder at $(date +'%Y-%m-%d %H:%M:%S')"
    - git push --force --quiet "https://${GH_TOKEN}@${GH_REPO}" master:master
  ```

  这样，整个构建和推送的流程脚本就编写完成了，到时候 Travis CI 就会按照上面的顺序执行，将生成的 HTML 文件推送到指定仓库指定分支。

## 生成 GitHub Token
  打开 Github 的 [Settings](https://github.com/settings/) 页面，点击左边的 **Developer settings** ，然后选择 **Personal access tokens** ，点击 Generate new token ，生成一个 Token 。
  在新页面中填入 Note ，设置一个名字或者其他有助于你记忆这个 Token 用途的信息，然后勾选下方 **repo** 的勾，会连带勾上四个子选项。
  之后就拉到最下面直接保存，在新页面中会显示这个 token ，保存好，下一步要用到。

## 设置 Travis CI 环境变量
  在上面的配置文件中，出现了 `${GH_NAME}` ， `${GH_EMAIL}` ， `${GH_TOKEN}` ， `${GH_REPO}` 这几个字符串，其实这个是 Travis CI 的变量引用，在执行的时候会被自动替换成已经设置好的值，现在就要来设置这几个值。

  - 打开 [Travis CI](https://travis-ci.com/) ，登录后点击右上角设置，在设置界面可以看到 GitHub 里面所有的 Repositories ，如果没有，请检查你的授权，让 Travis CI 可以获取到你的 Repositories 。

  - 点击 `blog-factory` 右边的设置按钮，可以看到设置的页面，里面有一项名为 Environment Variables 的设置类。
  - 依次添加名为 `GH_NAME` ， `GH_EMAIL` ， `GH_TOKEN` ，`GH_REPO` ，填入对应的值。

  | NAME       | VALUE                                      |
  | :-         | :-                                         |
  | `GH_NAME`  | `xMuu`                                     |
  | `GH_EMAIL` | `leon@ilve.me`                             |
  | `GH_TOKEN` | `421ddfe66ed5a56ba19d6d1e1***************` |
  | `GH_REPO`  | `github.com/xMuu/xmuu.github.io`           |
  
  > *Note* : `GH_TOKEN` 应该保存好，避免泄漏，在设置的时候不要打开 **DISPLAY VALUE IN BUILD LOG** 。


## 上传博客源码
  首先整理一下目录的内容，删除没有用的各种文件。顺便执行一次 Hexo 的清理程序：
  `hexo clean`
  之后，检查安装的主题，是否有 `.git` 文件夹，有的话需要删除。
  一切检查完毕后就在 `blog-factory` 目录下，执行以下命令，将博客源码上传至 GitHub 。
  ```
  git add .
  git commit -m "upload blog source"
  git push
  ```

## 查看结果
  上传过后，可以到 Travis CI 看看构建的过程，也可以直接等待 Travis CI 的邮件然后访问 GitHub Pages 查看结果。
  

## 附录

  ### 1. 主题有 npm 依赖
  如果主题需要安装 npm 依赖，如果依赖多的话，建议在 Travis CI 构建的时候使用 `npm install` 安装，记得在上传源码的时候在 `.gitignore` 中排除主题目录下的 `node_modules` 文件夹；不多的话则可以直接将 `node_modules` 附带上去。

