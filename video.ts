#!/usr/bin/env node

// import built-in modules
import fs from 'fs';
import path from 'path';
// import third-party modules
import axios from 'axios';
const argv = require('minimist')(process.argv.slice(2));
require('dotenv').config();

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

async function fetchBilibiliData(id: string) {
  try {
    const response = await axios.get(
      `https://api.bilibili.com/x/web-interface/view?bvid=${id.slice(2)}`,
    );
    if (response.status !== 200) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.data;
    // return
    return data;
  } catch (error) {
    console.error('Failed to fetch:', error);
  }
}

async function fetchYoutubeData(id: string) {
  const key = process.env.YOUTUBE_KEY;
  const PROXY_HOST = process.env.PROXY_HOST;
  const PROXY_PORT = process.env.PROXY_PORT;
  if (!key) {
    console.error('Please set the YOUTUBE_KEY environment variable.');
    return;
  }
  if (!PROXY_HOST || !PROXY_PORT) {
    console.error(
      'Please set the PROXY_HOST and PROXY_PORT environment variables.',
    );
    return;
  }
  try {
    const response = await axios.get(
      `https://youtube.googleapis.com/youtube/v3/videos?part=snippet&id=${id}&key=${key}`,
      {
        proxy: {
          protocol: 'http',
          host: PROXY_HOST,
          port: parseInt(PROXY_PORT, 10),
        },
      },
    );
    if (response.status !== 200) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.data;
    // return
    return data;
  } catch (error) {
    console.error('Failed to fetch:', error);
  }
}

async function fetchYoutubeChannelData(channelId: string) {
  const key = process.env.YOUTUBE_KEY;
  const PROXY_HOST = process.env.PROXY_HOST;
  const PROXY_PORT = process.env.PROXY_PORT;
  if (!key) {
    console.error('Please set the YOUTUBE_KEY environment variable.');
    return;
  }
  if (!PROXY_HOST || !PROXY_PORT) {
    console.error(
      'Please set the PROXY_HOST and PROXY_PORT environment variables.',
    );
    return;
  }
  try {
    const response = await axios.get(
      `https://youtube.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${key}`,
      {
        proxy: {
          protocol: 'http',
          host: PROXY_HOST,
          port: parseInt(PROXY_PORT, 10),
        },
      },
    );
    if (response.status !== 200) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.data;
    // return
    return data;
  } catch (error) {
    console.error('Failed to fetch:', error);
  }
}

function moveBilibiliFile(
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
    console.log('文件创建时间已修改为 ' + formatBilibiliDate(timestamp));
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

function moveYoutubeFile(
  file: string,
  publishTime: string,
  name: string,
  uid: string,
  uname: string,
) {
  let timestamp: number = new Date(publishTime).getTime() / 1000;
  // 修改文件的创建时间
  fs.utimes(file, timestamp, timestamp, function (err: any) {
    if (err) {
      throw err;
    }
    console.log('文件创建时间已修改为 ' + formatYoutubeDate(publishTime));
  });
  const oldPath = path.resolve(file);
  const newPath = path.join(
    path.dirname(file),
    'completed',
    `${uname}(${uid}) - youtube.com`,
    `${name}${path.extname(file)}`,
  );
  // 创建文件夹如果不存在
  if (
    !fs.existsSync(
      path.join(
        path.dirname(file),
        'completed',
        `${uname}(${uid}) - youtube.com`,
      ),
    )
  ) {
    fs.mkdirSync(
      path.join(
        path.dirname(file),
        'completed',
        `${uname}(${uid}) - youtube.com`,
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

function formatBilibiliDate(timestamp: number): string {
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

function formatYoutubeDate(date: string): string {
  const dateObj = new Date(date);
  const year = dateObj.getFullYear().toString();
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const day = dateObj.getDate().toString().padStart(2, '0');
  const hours = dateObj.getHours().toString().padStart(2, '0');
  const minutes = dateObj.getMinutes().toString().padStart(2, '0');
  const seconds = dateObj.getSeconds().toString().padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
function main() {
  if (ARGVURL.startsWith(bilibiliURL)) {
    let id = parseBilibiliID(ARGVURL);
    if (id) {
      fetchBilibiliData(id).then((data) => {
        if (data) {
          let id: string = data.data.bvid.slice(2);
          let publishTime: number = data.data.pubdate;
          let title: string = data.data.title;
          let uid: string = data.data.owner.mid;
          let name: string = data.data.owner.name;
          console.log(`ID:          ` + id);
          console.log(`Title:       ` + title);
          console.log(`PublishTime: ` + formatBilibiliDate(publishTime));
          let safeTitle = title.replace(/[/|\\:?<>*"]/g, '');
          moveBilibiliFile(file, publishTime, safeTitle, uid, name);
        }
      });
    }
  } else if (ARGVURL.startsWith(youtubeURL)) {
    let id = parseYoutubeID(ARGVURL);
    if (id) {
      fetchYoutubeData(id).then((data) => {
        if (data) {
          let channelId: string = data.items[0].snippet.channelId;
          fetchYoutubeChannelData(channelId).then((data2) => {
            if (data2) {
              let id: string = data.items[0].id;
              let publishTime: string = data.items[0].snippet.publishedAt;
              let title: string = data.items[0].snippet.title;
              let uid = data2.items[0].snippet.customUrl.slice(1)
              let name: string = data.items[0].snippet.channelTitle;
              console.log(`ID:          ` + id);
              console.log(`Title:       ` + title);
              console.log(`PublishTime: ` + formatYoutubeDate(publishTime));
              let safeTitle = title.replace(/[/|\\:?<>*"]/g, '');
              moveYoutubeFile(file, publishTime, safeTitle, uid, name);
            }
          });

        }
      });
    }
  } else {
    console.log('other');
  }
}

main();
