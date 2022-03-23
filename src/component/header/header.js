/*
 * @Description: 页面 --- 头部
 * @Author: mzr
 * @Date: 2021-07-23 17:56:42
 * @LastEditTime: 2022-03-23 15:15:23
 * @LastEditors: mzr
 */
import React, { Component } from "react";

import "../header/header.scss";

import { Dropdown, Menu } from "antd";

import headerLogo from "../../static/logo.png";

import { DownOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

export default class header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pathname: '',
      userName: ''
    };
  }

  async componentDidMount() {
    this.setState({
      pathname: window.location.pathname,
      userName: localStorage.getItem("username"),
    });
  }

  // 返回登录页
  goBack() {
    localStorage.clear();
    this.props.history.push({
      pathname: '/'
    });
  }

  render() {
    return (
      <div className="search_header">
        <div className="menu_box">
          <img src={headerLogo} alt="头部图标" />
          <div className="menu_list">
            <Link to="/expiredList" className={this.state.pathname === '/expiredList' ? 'list_btn active' : "list_btn"}>首页</Link>
            <Link to="/ticketExpire" className={this.state.pathname === '/ticketExpire' ? 'list_btn active' : "list_btn"}>客票有效期</Link>
            <Link to="/ticketScan" className={this.state.pathname === '/ticketScan' ? 'list_btn active' : "list_btn"}>扫描黑名单</Link>
          </div>
        </div>

        <div className="header_down">
          <Dropdown
            placement="bottomCenter"
            trigger="click"
            overlay={() => (
              <Menu>
                <Menu.Item key="1" onClick={() => this.goBack()}>
                  退出登录
                </Menu.Item>
              </Menu>
            )}
          >
            <div className="down_title">
              {this.state.userName}
              <DownOutlined />
            </div>
          </Dropdown>
        </div>
      </div>
    );
  }
}
