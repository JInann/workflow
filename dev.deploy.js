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

client.useBucket("jyb-site");
readDir("./pre").forEach((file) => {
  client.put("workflow/" + file.split("./dist/")[1], file).then(() => {
    console.log("上传成功:", file);
  });
});
