/*
 * @Description:
 * @Author: mzr
 * @Date: 2021-07-08 10:22:52
 * @LastEditTime: 2022-03-24 16:09:41
 * @LastEditors: mzr
 */
import React from "react";
import ReactDOM from "react-dom";
import "./index.scss";
import { BrowserRouter as Router, Route } from "react-router-dom";

// 引入页面
import Index from "./page/index"; // 登录
import searchList from "./page/searchList/searchList"; // 首页
import TicketExpire from "./page/ticketExpire"; // 票证过期时间设置
import TicketScan from "./page/ticketScan/ticketScan"; // 扫描黑名单
import openList from "./page/openList/openList"; // OPEN处理列表
import openBatch from "./page/openBatch/openBatch"; // OPEN批次

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
      {/* 票证过期时间设置 */}
      <Route path="/ticketExpire" component={TicketExpire}></Route>
      {/* 扫描黑名单 */}
      <Route path="/ticketScan" component={TicketScan}></Route>
      {/* OPEN处理列表 */}
      <Route path="/openList" component={openList}></Route>
      {/* OPEN批次 */}
      <Route path="/openBatch" component={openBatch}></Route>
    </Router>
  </ConfigProvider>,
  document.getElementById("root")
);
