配置github工作流

1. GitHub创建仓库

2. 创建GitHub工作流文件

   github的工作流文件保存在：.github/workflows/*.yml。

   yml文件主要包含以下信息：

   1. 流水线的名称
   2. 流水线的触发条件
   3. 流水线包含的job

   ```yaml
   name: deploy dev # 流水线名称
   
   on: 
     push:
       branches: [ dev ] # 当dev分支触发推送事件时，运行流水线
       
   jobs:
     build: # job名称
     	# ... job内容
   ```

   其中每个job包含以下内容

   1. job名称

      ```yaml
      jobs:
        build: # job名称
        	# ... job内容
      ```

   2. 运行容器

      ```yaml
      build: 
          runs-on: ubuntu-latest # job运行容器
      ```

   3. 所属环境

      ```yaml
      build: 
          environment: dev # 环境 测试环境、生产环境等。
      ```

   4. 运行步骤/脚本列表(steps)

      ```yaml
      jobs:
        build: # job名称
          # ...
          steps: # 步骤
            - uses: actions/checkout@v3 # 切出代码
              with:
                fetch-depth: 2
            - name: Use Node.js 16.x # 使用nodejs
              uses: actions/setup-node@v3
              with:
                node-version: 16.x # node 16.x
            - run: npm install # 安装依赖
            - run: npm run pre --if-present # 打包
            - run: node dev.deploy # 上传打包后的文件
      ```

   5. step信息：脚本、step名称、使用的组件及组件参数、暴露的环境变量等。

      ```yaml
      jobs:
        build: # job名称
         	# ...
          steps: # 步骤
            # ...
            - name: Use Node.js 16.x # 使用nodejs
              uses: actions/setup-node@v3 
              with:
                node-version: 16.x # node 16.x
            - run: npm install # 安装依赖
            - run: npm run pre --if-present # 打包
            - name: upload dist # 上传打包后的文件
              env:
                ACCESSKEYID: ${{secrets.ACCESSKEYID}}
                ACCESSKEYSECRET: ${{secrets.ACCESSKEYSECRET}}
              run: node dev.deploy
      ```

   6. 完整文件如下

   ```yaml
   # .github/workflows/dev.yml
   
   name: deploy dev # 名称
   
   on: 
     push:
       branches: [ dev ] # 当dev分支触发推送事件时，运行流水线
       
   jobs:
     build: # job名称
       runs-on: ubuntu-latest # job运行容器
       environment: dev # 环境 测试环境、生产环境等。
       steps: # 步骤
         - uses: actions/checkout@v3 # 切出代码
           with:
             fetch-depth: 2
         - name: Use Node.js 16.x # 使用nodejs
           uses: actions/setup-node@v3
           with:
             node-version: 16.x # node 16.x
         - run: npm install # 安装依赖
         - run: npm run pre --if-present # 打包
         - name: upload dist # 上传打包后的文件
           env:
             ACCESSKEYID: ${{secrets.ACCESSKEYID}}
             ACCESSKEYSECRET: ${{secrets.ACCESSKEYSECRET}}
             BUILD_DIR: pre
             TARGET_DIR: workflow_dev
           run: node dev.deploy
   
   ```

3. 创建完工作流文件后，需要开发上传文件脚本及配置相关环境变量。

   1. 以阿里云oss为例，新建一个bucket，已有可跳过，其他oss服务器配置思路一样。

      ->对象存储OSS

      ->Bucket列表

      ->创建Bucket

      创建好Bucket之后，需要配置权限。

      ->访问控制RAM

      ->身份管理

      ->用户，创建用户

      ->**勾选OpenAPI调用访问**，确认

      ->**保存AccessKey**，忘记保存，可以之后再新建一个

      ->用户详情权限，新增授权**AliyunOSSFullAccess**授予创建的这个用户oss的所有权限（上传）

   2. 把保存的AccessKey配置到Github项目的环境变量中。

      ->Github项目Settings

      ->Environments

      ->New enviroment

      ->输入环境名称

      ->Deployment branches and tags配置发布环境关联的分支或tag

      ->Environment secrets中新增ACCESSKEYID、ACCESSKEYSECRET

   3. 阿里云上传oss脚本

       ```typescript
      // dev.deploy.js
      import OSS from "ali-oss";
      import fs from "fs";
      const readDir = (path) => {
          let arr = [];
          let temp = fs.readdirSync(path);
          temp.forEach((v) => {
              if (fs.statSync(path + "/" + v).isDirectory()) {
                  arr.push(...readDir(path + "/" + v));
              } else {
                  arr.push(path + "/" + v);
              }
          });
          return arr;
      };
      
      let client = new OSS({
          region: "oss-cn-hongkong",
          accessKeyId: process.env.ACCESSKEYID,
          accessKeySecret: process.env.ACCESSKEYSECRET,
      });
      // bucket名称
      client.useBucket("jyb-site");
      // 读取打包后的文件
      readDir("./"+process.env.BUILD_DIR).forEach((file) => {
          // put函数，第一个参数是上传后的路径，第二个是要上传文件的路径
          client.put(process.env.TARGET_DIR+"/" + file.split("./"+process.env.BUILD_DIR+"/")[1], file).then(() => {
              console.log("上传成功:", file);
        });
      });
         
      ```