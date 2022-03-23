/*
 * @Description:
 * @Author: mzr
 * @Date: 2021-07-08 14:01:46
 * @LastEditTime: 2022-03-21 16:54:49
 * @LastEditors: mzr
 */
import axios from "axios";

import { message } from "antd";

let baseUrl = "http://192.168.0.212:6991";
// if (process.env.NODE_ENV === "development") {

//   baseUrl = "";
// } else if (process.env.NODE_ENV === "production") {
//   baseUrl = "";
// }

axios.defaults.baseURL = baseUrl;

let instance = axios.create({
  // timeout: 1000 * 12,
});

// 取消请求操作
const allPendingRequestsRecord = [];
const pending = {};
const removeAllPendingRequestsRecord = () => {
  allPendingRequestsRecord &&
    allPendingRequestsRecord.forEach((func) => {
      // 取消请求（调用函数就是取消该请求）
      func("路由跳转了取消所有请求");
    });
  // 移除所有记录
  allPendingRequestsRecord.splice(0);
};

// 取消同一个重复的ajax请求
const removePending = (key, isRequest = false) => {
  if (pending[key] && isRequest) {
    pending[key]("取消重复请求");
  }
  delete pending[key];
};

// 取消所有请求的函数
export const getConfirmation = (mes = "", callback = () => { }) => {
  removeAllPendingRequestsRecord();
  callback();
};

// http request 拦截器
instance.interceptors.request.use(
  (config) => {
    if (config.url.indexOf("Authenticate") > 0) {
      return config;
    }
    const token = localStorage.getItem("token");
    token && (config.headers.Authorization = "Bearer " + token);

    // 在请求发送前执行一下取消操作，防止连续点击重复发送请求(例如连续点击2次按钮)
    let reqData = "";
    // 处理如url相同请求参数不同时上一个请求被屏蔽的情况
    if (config.method === "get") {
      reqData = config.url + config.method + JSON.stringify(config.params);
    } else {
      reqData = config.url + config.method + JSON.stringify(config.data);
    }
    // 如果用户连续点击某个按钮会发起多个相同的请求，可以在这里进行拦截请求并取消上一个重复的请求
    removePending(reqData, true);
    // 设置请求的 cancelToken（设置后就能中途控制取消了）
    config.cancelToken = new axios.CancelToken((c) => {
      pending[reqData] = c;
      allPendingRequestsRecord.push(c);
    });

    // application/x-www-form-urlencoded
    if (config.resType === "form") {
      config.headers["Content-Type"] = "application/x-www-form-urlencoded";
      config.data = JSON.stringify(config.data);
      return config;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// http response 拦截器
instance.interceptors.response.use(
  (response) => {
    if (response.data.status === 6) {
      message.warning(response.data.message)
    }
    return response;
  },
  (error) => {
    if (String(error).indexOf("Network Error") > 0) {
      message.destroy();
      message.error("登陆失效，请重新获取权限");
      localStorage.removeItem("token");
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } else {
      message.destroy();
      message.error(error.response ? error.response.data.msg : "请求失败，请联系管理员");
    }
    return Promise.reject(error);
  }
);

export default instance;
