/*
 * @Description: 登录页面
 * @Author: mzr
 * @Date: 2021-07-08 11:19:33
 * @LastEditTime: 2021-07-26 09:46:06
 * @LastEditors: mzr
 */
import React, { Component } from 'react'
import '../index/index.scss'

import {
  Input,
  message,
  Button 
} from 'antd';

import logo from "../../static/logo.png" // 登录图标

export default class index extends Component {
  constructor(props) {
    super(props);
    this.state = {

      userMessage : {
        userName:"", // 用户名
        password:"", // 密码
      }
    };
  }

  async componentDidMount() {
    
  }

  // 登录
  getLogin() {
    let data = {
      userName : this.state.userMessage.userName,
      password : this.state.userMessage.password
    }
    this.$axios.post("api/Token/Login",data).then((res) => {
      if(res.data.status === 0) {
        localStorage.setItem('token',res.data.token)
        localStorage.setItem('username',this.state.userMessage.userName)
        this.props.history.push({
          pathname:'/expiredList',
 
        })
      }else {
        message.warning(res.data.message);
      }
    })
  }

  // 改变输入框值
  inputChange = (label,val) => {
    let data = this.state.userMessage
    data[label] = val.target.value
    this.setState({
      userMessage:data,
    })
  }

  render() {
    return (
      <div className="index">
        <div className="container">

          <div className="title">
            <img src={logo} alt="登录图标"/>
            <p>过期票管理</p>
          </div>

          <div className="login_form">
            <div className="login_form_box">
              <Input 
                placeholder="用户名"
                value={this.state.userMessage.userName}
                onChange={this.inputChange.bind(this,'userName')}
                allowClear
              />
              <Input.Password
                placeholder="密码" 
                value={this.state.userMessage.password}
                onChange={this.inputChange.bind(this,'password')}
                allowClear
              />
            </div>
            <div className="login_btn_box">
              <Button onClick={() => this.getLogin()}>登录</Button>
            </div>
          </div>

        </div>
      </div>
    )
  }
}
