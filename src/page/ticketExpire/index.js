/*
 * @Description: 客票有效期规则
 * @Author: wish.WuJunLong
 * @Date: 2021-09-27 09:50:57
 * @LastEditTime: 2022-04-15 09:06:21
 * @LastEditors: mzr
 */

import React, { Component } from "react";

import {
  Input,
  Select,
  Button,
  Table,
  Pagination,
  Modal,
  message,
  DatePicker,
  Tooltip
} from "antd";

import { ExclamationCircleOutlined } from "@ant-design/icons";

import "./ticketExpire.scss";

import Header from "../../component/header/header"; // 头部横幅

const { Option } = Select;
const { confirm } = Modal;
const { Column } = Table;

let timeout;
let currentValue;
export default class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchData: {
        page_no: 1, //类型：Number  必有字段  备注：当前页码
        page_size: 10, //类型：Number  必有字段  备注：每页显示条数
        condition: {
          //类型：Object  可有字段  备注：无
          intl_flag: 0, //类型：Number  可有字段  备注：国际标识 0:国内/国际;1:国内;2:国际
          part_open: 0, //是否部分使用 0:所有;1:全程未使用;2:部分未使用;3:弃程部分使用;
          airline_code: "", //   可有字段  备注：航司二字码
          sales_channal_name: null, // 新增销售渠道
        },
      },

      tableData: {}, // 分页数据

      tableLoading: true, // 分页数据加载

      ticketModalStatus: false, // 新增/编辑弹窗
      ticketModalData: {}, // 新增编辑弹窗数据

      ticketModalType: "新增",


      saleChannelList: [], // 销售渠道列表

    };
  }

  // 获取分页数据
  getDataList() {
    this.setState({
      tableLoading: true,
    });
    this.$axios.post("api/TicketExpire/GetPage", this.state.searchData).then((res) => {
      this.setState({
        tableLoading: false,
      });
      if (res.data.status === 0) {
        this.setState({
          tableData: res.data,
        });
      }
    });
  }

  // 表格分页
  changePage = (page, pageSize) => {
    let data = this.state.searchData;
    data["page_no"] = page;
    data["page_size"] = pageSize;

    this.setState({
      searchData: data,
    });
    this.getDataList();
  };

  changeSearchSelect = (label, val) => {
    let data = this.state.searchData;
    data.condition[label] = val;
    this.setState({
      searchData: data,
    });
  };
  changeSearchInput = (label, val) => {
    let data = this.state.searchData;
    data.condition[label] = val.target.value;
    this.setState({
      searchData: data,
    });
  };

  // 编辑/删除数据
  editTableData(data, type) {
    if (type === "remove") {
      let _that = this;
      confirm({
        centered: true,
        title: "是否确认删除该数据？",
        icon: <ExclamationCircleOutlined />,
        content: "当前数据删除将不可恢复，请检查是否需要删除该数据",
        okText: "确认删除",
        okType: "danger",
        cancelText: "取消",
        onOk() {
          let removeData = {
            key_id: data.key_id,
          };
          _that.$axios.post("api/TicketExpire/delete", removeData).then((res) => {
            if (res.data.status === 0) {
              message.success(res.data.message);
              _that.getDataList();
            } else {
              message.warning(res.data.message);
            }
          });
        },
      });
    } else {
      // 处理销售渠道id
      let channelList = []
      data.sales_channal_id && data.sales_channal_id.split('/').map(item => {
        return item ? channelList.push(item) : ''
      })
      let newVal = JSON.parse(JSON.stringify(data))
      newVal.sales_channal_id = channelList

      this.setState({
        ticketModalData: JSON.parse(JSON.stringify(newVal)),
        ticketModalType: "编辑",
        ticketModalStatus: true,
      });
    }
  }

  // 新增数据
  addTicketModalData() {
    let data = {
      intl_flag: 0, //类型：Number  必有字段  备注：国际标识 0:国内/国际;1:国内;2:国际
      airline_code: "", //类型：String  必有字段  备注：航司二字码
      part_open: 0, //类型：Number  必有字段  备注：是否部分使用 0:不限;1:全程未使用;2:部分未使用;3:弃程部分使用;
      date_target: 0, //类型：Number  必有字段  备注：使用节点 0:开票时间;1:未使用起飞时间
      expire_days: 1, //类型：Number  必有字段  备注：过期时间（天数）
      effective_start: "", //类型：String  可有字段  备注：规则生效时间 为空表示不限
      effective_end: "", //类型：String  可有字段  备注：规则过期时间 为空表示不限
      sales_channal_id: null, // 销售渠道
    };
    this.setState({
      ticketModalData: data,
      ticketModalType: "新增",
      ticketModalStatus: true,
    });
  }

  // 弹窗数据修改
  changeModalDataSelect = (label, val) => {
    let data = this.state.ticketModalData;
    data[label] = val;
    this.setState({
      ticketModalData: data,
    });
  };
  changeModalDataInput = (label, val) => {
    let data = this.state.ticketModalData;
    data[label] = val.target.value;
    this.setState({
      ticketModalData: data,
    });
  };

  // 弹窗内容提交
  submitModalData() {
    if (!this.state.ticketModalData.airline_code) {
      return message.warning("请输入航司二字码");
    }

    let url;
    if (this.state.ticketModalType === "新增") {
      url = "api/TicketExpire/Save";
    } else {
      url = "api/TicketExpire/UpDate";
    }
    let data = this.state.ticketModalData;

    data.expire_days = data.expire_days ? Number(data.expire_days) : 0;
    data.effective_start = data.effective_start
      ? this.$moment(data.effective_start).format("YYYY-MM-DDTHH:mm:ss")
      : null;
    data.effective_end = data.effective_end
      ? this.$moment(data.effective_end).format("YYYY-MM-DDTHH:mm:ss")
      : null;
    // 销售渠道
    data.sales_channal_id = String(data.sales_channal_id).replace(/,/g, '/')



    this.$axios.post(url, data).then((res) => {
      if (res.data.status === 0) {
        message.success(res.data.message);
        this.setState({
          ticketModalStatus: false,
        });
        this.getDataList();
      } else {
        message.warning(res.data.message);
      }
    });
  }



  // 获取销售渠道
  fetch(value, callback) {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    currentValue = value;
    let _that = this
    function fake() {
      let data = {
        Limit: 12,                //类型：Number  必有字段  备注：返回数据条数
        Keywords: value                //类型：String  可有字段  备注：检索关键字
      };
      _that.$axios.post("api/common/SearchSalesChannels", data)
        .then((res) => {
          if (res.data.status === 0) {
            if (currentValue === value) {

              const dataList = [];
              res.data.data.forEach(r => {
                dataList.push({
                  value: r.value,
                  text: r.text,
                });
              });
              callback(dataList);
            }
          }
        })
    }

    timeout = setTimeout(fake, 300);
  }

  handleSearch = (value) => {
    if (value) {
      this.fetch(value, saleChannelList => this.setState({ saleChannelList }));
    } else {
      this.setState({ saleChannelList: [] });
    }
  };

  componentDidMount() {
    this.getDataList();
  }

  render() {
    return (
      <div className="ticket_expire">
        <Header history={this.props.history}></Header>

        <div className="ticket_expire_content">
          <div className="search_box">
            <div className="box_list">
              <div className="list_title">国际标识</div>
              <div className="list_input">
                <Select
                  value={this.state.searchData.condition.intl_flag}
                  onChange={this.changeSearchSelect.bind(this, "intl_flag")}
                >
                  <Option value={0}>国内/国际</Option>
                  <Option value={1}>国内</Option>
                  <Option value={2}>国际</Option>
                </Select>
              </div>
            </div>

            <div className="box_list">
              <div className="list_title">航司二字码</div>
              <div className="list_input">
                <Input
                  onChange={this.changeSearchInput.bind(this, "airline_code")}
                  value={this.state.searchData.condition.airline_code}
                  placeholder="请输入航司二字码"
                  allowClear
                ></Input>
              </div>
            </div>

            <div className="box_list">
              <div className="list_title">部分使用</div>
              <div className="list_input">
                <Select
                  value={this.state.searchData.condition.part_open}
                  onChange={this.changeSearchSelect.bind(this, "part_open")}
                >
                  <Option value={0}>不限</Option>
                  <Option value={1}>全程未使用</Option>
                  <Option value={2}>部分未使用</Option>
                  <Option value={3}>弃程部分使用</Option>
                </Select>
              </div>
            </div>

            <div className="box_list">
              <div className="list_title">销售渠道</div>
              <div className="list_input">
                <Select
                  onSearch={this.handleSearch}
                  showSearch
                  style={{ width: 350 }}
                  showArrow={false}
                  allowClear
                  filterOption={false}
                  notFoundContent={null}
                  placeholder="请选择销售渠道 支持模糊筛选"
                  value={this.state.searchData.condition.sales_channal_name}
                  onChange={this.changeSearchSelect.bind(this, "sales_channal_name")}
                >
                  {this.state.saleChannelList && this.state.saleChannelList.map((item) =>
                    (<Option value={item.text} key={item.text}>{item.text}</Option>)
                  )}
                </Select>
              </div>
            </div>
            <div className="box_list">
              <Button type="primary" onClick={() => this.getDataList()}>
                搜索
              </Button>
            </div>
            <div className="box_list">
              <Button type="primary" onClick={() => this.addTicketModalData()}>
                新增
              </Button>
            </div>
          </div>

          <div className="ticket_expire_table">
            <Table
              rowKey="key_id"
              dataSource={this.state.tableData.datas}
              pagination={false}
              loading={this.state.tableLoading}
            >
              <Column
                title="国际标识"
                dataIndex="intl_flag"
                render={(text) =>
                  text === 0
                    ? "国内/国际"
                    : text === 1
                      ? "国内"
                      : text === 2
                        ? "国际"
                        : text
                }
              />
              <Column title="航司二字码" dataIndex="airline_code" />
              <Column
                title="是否部分使用"
                dataIndex="part_open"
                render={(text) =>
                  text === 0
                    ? "不限"
                    : text === 1
                      ? "全程未使用"
                      : text === 2
                        ? "部分未使用"
                        : text === 3
                          ? "弃程部分使用"
                          : text
                }
              />
              <Column
                title="销售渠道"
                dataIndex="sales_channal_id"
                width={250}
                render={(text) => (
                  <>
                    <Tooltip
                      title={() => (
                        <>
                          <p style={{ fontSize: "14px", marginBottom: "5px" }}>销售渠道</p>
                          <p
                            style={{
                              fontSize: "12px",
                              color: "rgba(255, 255, 255, .8)",
                              minWidth: "200px",
                              marginBottom: "5px",
                            }}
                          >
                            {text ? text : "--"}
                          </p>
                        </>
                      )}
                    >
                      <span className="sales_channal_id">{text ? text : "--"}</span>
                    </Tooltip>
                  </>

                )}
              />
              <Column
                title="使用节点"
                dataIndex="date_target"
                render={(text) =>
                  text === 0 ? "开票时间" : text === 1 ? "未使用起飞时间" : text
                }
              />
              <Column
                title="过期时间"
                dataIndex="expire_days"
                render={(text) => text + " 天"}
              />
              <Column
                title="规则生效时间"
                dataIndex="effective_start"
                render={(text) =>
                  text ? this.$moment(text).format("YYYY-MM-DD HH:mm:ss") : "不限"
                }
              />
              <Column
                title="规则过期时间"
                dataIndex="effective_end"
                render={(text) =>
                  text ? this.$moment(text).format("YYYY-MM-DD HH:mm:ss") : "不限"
                }
              />
              <Column
                title="操作"
                render={(render) => (
                  <>
                    <Button
                      onClick={() => this.editTableData(render, "edit")}
                      type="link"
                      size="small"
                    >
                      编辑
                    </Button>
                    <Button
                      onClick={() => this.editTableData(render, "remove")}
                      type="link"
                      danger
                      size="small"
                    >
                      删除
                    </Button>
                  </>
                )}
              />
            </Table>

            <Pagination
              showTotal={(total) => `共${total}条`}
              showSizeChanger
              current={this.state.tableData.page_no}
              total={this.state.tableData.total_count}
              onChange={this.changePage}
            ></Pagination>
          </div>
        </div>

        <Modal
          title="过期票设置"
          visible={this.state.ticketModalStatus}
          onOk={() => this.submitModalData()}
          onCancel={() => this.setState({ ticketModalStatus: false })}
          getContainer={false}
          centered
          width={650}
        >
          <div className="ticket_modal">
            <div className="modal_list">
              <div className="list_title">国际标识</div>
              <div className="list_input">
                <Select
                  disabled={this.state.ticketModalType === '编辑'}
                  value={this.state.ticketModalData.intl_flag}
                  onChange={this.changeModalDataSelect.bind(this, "intl_flag")}
                >
                  <Option value={0}>国内/国际</Option>
                  <Option value={1}>国内</Option>
                  <Option value={2}>国际</Option>
                </Select>
              </div>
            </div>

            <div className="modal_list">
              <div className="list_title">航司二字码</div>
              <div className="list_input">
                <Input
                  disabled={this.state.ticketModalType === '编辑'}
                  value={this.state.ticketModalData.airline_code}
                  onChange={this.changeModalDataInput.bind(this, "airline_code")}
                  placeholder="航司二字码"
                  allowClear
                ></Input>
              </div>
            </div>

            <div className="modal_list">
              <div className="list_title">部分使用</div>
              <div className="list_input">
                <Select
                  value={this.state.ticketModalData.part_open}
                  onChange={this.changeModalDataSelect.bind(this, "part_open")}
                >
                  <Option value={0}>不限</Option>
                  <Option value={1}>全程未使用</Option>
                  <Option value={2}>部分未使用</Option>
                  <Option value={3}>弃程部分使用</Option>
                </Select>
              </div>
            </div>
            <div className="modal_list">
              <div className="list_title">销售渠道</div>
              <div className="list_input">
                <Select
                  mode="multiple"
                  onSearch={this.handleSearch}
                  showSearch
                  style={{ width: 505 }}
                  showArrow={false}
                  allowClear
                  filterOption={false}
                  notFoundContent={null}
                  placeholder="请选择销售渠道 支持模糊筛选"
                  value={this.state.ticketModalData.sales_channal_id}
                  onChange={this.changeModalDataSelect.bind(this, "sales_channal_id")}
                >
                  {this.state.saleChannelList && this.state.saleChannelList.map((item) =>
                    (<Option value={item.text} key={item.text}>{item.text}</Option>)
                  )}
                </Select>
              </div>
            </div>
            <div className="modal_list">
              <div className="list_title">使用节点</div>
              <div className="list_input">
                <Select
                  value={this.state.ticketModalData.date_target}
                  onChange={this.changeModalDataSelect.bind(this, "date_target")}
                >
                  <Option value={0}>开票时间</Option>
                  <Option value={1}>未使用起飞时间</Option>
                </Select>
              </div>
            </div>

            <div className="modal_list">
              <div className="list_title">过期天数</div>
              <div className="list_input">
                <Input
                  value={this.state.ticketModalData.expire_days}
                  onChange={this.changeModalDataInput.bind(this, "expire_days")}
                  placeholder="过期天数（单位：天）"
                  allowClear
                ></Input>
              </div>
            </div>

            <div className="modal_list">
              <div className="list_title">生效时间</div>
              <div className="list_input">
                <DatePicker
                  placeholder="不限"
                  onChange={this.changeModalDataSelect.bind(this, "effective_start")}
                  showTime
                  style={{ width: 200 }}
                  value={
                    this.state.ticketModalData.effective_start
                      ? this.$moment(this.state.ticketModalData.effective_start)
                      : ""
                  }
                />
              </div>
            </div>

            <div className="modal_list">
              <div className="list_title">过期时间</div>
              <div className="list_input">
                <DatePicker
                  placeholder="不限"
                  onChange={this.changeModalDataSelect.bind(this, "effective_end")}
                  showTime
                  style={{ width: 200 }}
                  value={
                    this.state.ticketModalData.effective_end
                      ? this.$moment(this.state.ticketModalData.effective_end)
                      : ""
                  }
                />
              </div>
            </div>



          </div>
        </Modal>
      </div>
    );
  }
}
