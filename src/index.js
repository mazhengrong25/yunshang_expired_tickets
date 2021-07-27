/*
 * @Description:
 * @Author: mzr
 * @Date: 2021-07-08 10:22:52
 * @LastEditTime: 2021-07-27 10:24:19
 * @LastEditors: wish.WuJunLong
 */
import React from "react";
import ReactDOM from "react-dom";
import "./index.scss";
import { BrowserRouter as Router, Route } from "react-router-dom";

// 引入页面
import Index from "./page/index"; // 登录
import searchList from "./page/searchList/searchList"; // 首页

import zhCN from "antd/es/locale/zh_CN";
import { ConfigProvider } from "antd"; // 全局化配置

import axios from "./api/api";
import moment from "moment";
import "moment/locale/zh-cn";
moment.locale("zh-cn");


React.Component.prototype.$axios = axios;
React.Component.prototype.$moment = moment;

React.$filterUrlParams = function () {
  let str = window.location.search.replace("?", "");
  let arr = str.split("&");
  let obj = {};
  arr.forEach((e) => {
    let key = e.split("=");
    obj[key[0]] = key[1];
  });
  return obj;
};

ReactDOM.render(
  <ConfigProvider locale={zhCN}>
    <Router>
      {/* 登录页 */}
      <Route exact path="/" component={Index}></Route>
      {/* 分页查询 */}
      <Route path="/expiredList" component={searchList}></Route>
    </Router>
  </ConfigProvider>,
  document.getElementById("root")
);
