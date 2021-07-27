/*
 * @Description: 页面 --- 头部
 * @Author: mzr
 * @Date: 2021-07-23 17:56:42
 * @LastEditTime: 2021-07-26 09:32:44
 * @LastEditors: mzr
 */
import React, { Component } from 'react'

import '../header/header.scss'

import { Dropdown, Menu } from "antd"

import headerLogo from "../../static/logo.png"

import { DownOutlined } from '@ant-design/icons';

export default class header extends Component {
  constructor(props) {
    super(props);
    this.state = {

    }
  }

  async componentDidMount() {
    this.setState({
      userName: localStorage.getItem('username')
    })

  }

  // 返回登录页
  goBack() {
    localStorage.clear()
    this.props.history.push("/")
  }

  render() {
    return (
      <div className="search_header">
        <img src={headerLogo} alt="头部图标" />
        <div className="header_down">
          <Dropdown
            placement="bottomCenter"
            trigger="click"
            overlay={() => (
              <Menu>
                <Menu.Item key="1" onClick={() => this.goBack()}>退出登录</Menu.Item>
              </Menu>
            )}>
            <div className="down_title">{this.state.userName}<DownOutlined /></div>
          </Dropdown>
        </div>
      </div>
    )
  }
}
