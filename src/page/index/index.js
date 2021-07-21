/*
 * @Description: 初始加载页
 * @Author: mzr
 * @Date: 2021-07-08 11:19:33
 * @LastEditTime: 2021-07-08 14:11:35
 * @LastEditors: mzr
 */
import React, { Component } from 'react'
import '../index/index.scss'

import { Spin , message} from 'antd';

import axios from "../../api/api"

export default class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      url: '',
      key_id: '',
    };
  }

  async componentDidMount() {
    let data = React.$filterUrlParams(this.props.location.search)
    console.log(data)
    await this.setState({
      url: data.url,
      key_id: data.token
    });
    await this.getToken();
  }

  // 
  getToken() {
    let data = {
      key: this.state.key_id || 0,
    };
    
    axios.get('api/token/Authenticate', { params: data },{type: 'Auth'}).then((res) => {
      console.log(res);
      if (res.data.status === 0) {
        localStorage.setItem('token', res.data.token);
        this.props.history.push(this.state.url);
      } else {
        message.warning(res.data.message);
      }
    });
  }

  render() {
    return (
      <div className="index">
        <Spin tip="正在进入过期票管理系统" />
      </div>
    )
  }
}
