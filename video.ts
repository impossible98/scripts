#!/usr/bin/env node

// import built-in modules
import fs from 'fs';
import path from 'path';
// import third-party modules
const argv = require('minimist')(process.argv.slice(2));

const bilibiliURL: string = 'https://www.bilibili.com/video/';
const youtubeURL: string = 'https://www.youtube.com/watch';
const file: string = argv['file'];
const ARGVURL: string = argv['url'];
const bilibiliRegex: RegExp =
  /(https:\/\/www\.bilibili\.com\/video\/)(BV[a-zA-Z0-9]{10})/;
const youtubeRegex: RegExp =
  /(https:\/\/www\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/;
function parseBilibiliID(url: string) {
  const id = url.match(bilibiliRegex)?.[2];
  return id;
}

function parseYoutubeID(url: string) {
  const id = url.match(youtubeRegex)?.[2];
  return id;
}

async function fetchData(id: string): Promise<string | undefined> {
  try {
    const response = await fetch(
      'https://api.bilibili.com/x/web-interface/view?bvid=' + id.slice(2),
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.text(); // 假设返回的是 JSON 数据
    return data;
  } catch (error) {
    console.error('Failed to fetch:', error);
  }
}
// 移动文件并重命名
function moveFile(
  file: string,
  timestamp: number,
  name: string,
  uid: string,
  uname: string,
) {
  // 修改文件的创建时间
  fs.utimes(file, timestamp, timestamp, function (err: any) {
    if (err) {
      throw err;
    }
    console.log('文件创建时间已修改为 ' + formatDate(timestamp));
  });
  const oldPath = path.resolve(file);
  const newPath = path.join(
    path.dirname(file),
    'completed',
    `${uname}(${uid}) - bilibili.com`,
    `${name}${path.extname(file)}`,
  );
  // 创建文件夹如果不存在
  if (
    !fs.existsSync(
      path.join(
        path.dirname(file),
        'completed',
        `${uname}(${uid}) - bilibili.com`,
      ),
    )
  ) {
    fs.mkdirSync(
      path.join(
        path.dirname(file),
        'completed',
        `${uname}(${uid}) - bilibili.com`,
      ),
      { recursive: true },
    );
  }
  // 移动文件并重命名
  fs.rename(oldPath, newPath, function (err: any) {
    if (err) {
      throw err;
    }
    console.log('File renamed!');
  });
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const year = date.getFullYear().toString();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  // return
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function main() {
  if (ARGVURL.startsWith(bilibiliURL)) {
    let id = parseBilibiliID(ARGVURL);
    if (id) {
      fetchData(id).then((data) => {
        if (data) {
          let id = JSON.parse(data).data.bvid.slice(2);
          let publishTime = JSON.parse(data).data.pubdate;
          let title = JSON.parse(data).data.title;
          let uid = JSON.parse(data).data.owner.mid;
          let name = JSON.parse(data).data.owner.name;
          console.log(`ID:          ` + id);
          console.log(`Title:       ` + title);
          console.log(`PublishTime: ` + formatDate(publishTime));
          let safeTitle = title.replace(/[/|\\:?<>*"]/g, '');
          moveFile(file, publishTime, safeTitle, uid, name);
        }
      });
    }
  } else if (ARGVURL.startsWith(youtubeURL)) {
    console.log(parseYoutubeID(ARGVURL));
  } else {
    console.log('other');
  }
}

main();
