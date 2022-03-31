/*
 * @Description: 分页查询
 * @Author: mzr
 * @Date: 2021-07-08 14:18:29
 * @LastEditTime: 2022-03-30 18:28:56
 * @LastEditors: mzr
 */
import React, { Component } from "react";
import "../searchList/searchList.scss";

import {
  Table,
  Select,
  Radio,
  Input,
  DatePicker,
  message,
  Pagination,
  Button,
  Tooltip,
  Modal,
} from "antd";

import Header from "../../component/header/header"; // 头部横幅

const { Column } = Table;
const { Option } = Select;
export default class searchList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchData: {
        query_type: 2, //类型：Number  必有字段  备注：查询类型 1:出票日期 2:起飞日期 3:实退时间 4:结算时间 5:导入时间 6:扫描时间
        begin_date: this.$moment().subtract(6, "months").format("YYYY-MM-DD"), //类型：String  必有字段  备注：开始日期
        end_date: this.$moment().format("YYYY-MM-DD"), //类型：String  必有字段  备注：结束日期
        intl_flag: false, //类型：Boolean  必有字段  备注：国际标识 true:国际 false:国内
        airline_code: "", //类型：String  必有字段  备注：航司二字码
        yatp_order_no: "", //类型：String  必有字段  备注：YATP订单号
        pnr_code: "", //类型：String  必有字段  备注：PNR
        ticket_no: "", //类型：String  必有字段  备注：票号
        usage_status: [], //类型：String  必有字段  备注：使用状态
        passengers_name: "", //类型：String  必有字段  备注：乘机人
        scaner_topic: null, //类型：String  必有字段  备注：扫描系统
        query_way: 0, // 二次扫描
      },

      recentStatus: false, // 结算审核结果

      reportLoading: false,//报表下载加载

      recentLoading: false, // 审核结果下载加载

      paginationData: {
        pageNo: 1, // 当前页
        pageCount: 10, // 页数
        pageTotal: 0, // 总页数
      },

      listData: [], // 列表数据
      applyData: [], // 使用状态
      scannerData: [], // 扫描系统
      subjectData: [], // 资金科目
      recentData: {}, // 近期审核

      tableLoading: true, // 表格加载

      // 上传文件
      fileList: [],
      uploading: false,

      showModal: false, //  弹窗展示
      modalData: {
        purchase_actual_refund_time: "",
        purchase_actual_refund_price: "",
        purchase_refund_price: "",
        purchase_actual_refund_subject: "",
        settlement_status: "",
      }, // 弹窗数据

      // scanerTopicList: [], // 扫描系统列表

      orderTypeList: [], // 订单类型
    };
  }

  async componentDidMount() {
    await this.getSearchList(); // 列表数据
    await this.getApplyStatus(); // 使用状态
    await this.getOrderType(); // 获取订单类型
    await this.getScannerData(); // 扫描系统
    await this.getRecentSettle(); // 近期审核
    // await this.getScanerTopics()
  }

  // 查询列表
  getSearchList() {
    let searchData = JSON.parse(JSON.stringify(this.state.searchData));
    searchData.usage_status = String(searchData.usage_status);
    let data = {
      page_no: this.state.paginationData.pageNo, //类型：Number  必有字段  备注：页码
      page_size: this.state.paginationData.pageCount, //类型：Number  必有字段  备注：每页显示条数
      condition: searchData,
    };
    this.$axios.post("api/overdueticket/getpage", data).then((res) => {
      if (res.data.status === 0) {
        // 表格分页
        let newPageData = this.state.paginationData;
        newPageData.pageNo = res.data.page_no;
        newPageData.pageTotal = res.data.total_count;

        this.setState({
          tableLoading: false,
          listData: res.data.datas,
          paginationData: newPageData,
        });
      } else {
        message.error(res.data.message);
      }
    });
  }

  // 分页
  changePage = (page, pageSize) => {
    console.log(page, pageSize);
    let data = this.state.paginationData;
    data["pageNo"] = page;
    data["pageCount"] = pageSize;

    this.setState({
      paginationData: data,
    });
    this.getSearchList();
  };

  // 获取使用状态
  getApplyStatus() {
    this.$axios.get("api/common/GetDataMappings?src=UsageStatus").then((res) => {
      if (res.data.status === 0) {
        this.setState({
          applyData: res.data.data,
        });
      }
    });
  }

  // 订单类型
  getOrderType() {
    this.$axios.get("api/common/GetDataMappings?src=OrderType").then((res) => {
      if (res.data.status === 0) {
        this.setState({
          orderTypeList: res.data.data,
        });
      }
    });
  }

  // 获取扫描系统
  getScannerData() {
    this.$axios.get("api/common/GetDataMappings?src=ScanerTopic").then((res) => {
      if (res.data.status === 0) {
        this.setState({
          scannerData: res.data.data,
        });
      }
    });
  }

  // 获取近期审核
  getRecentSettle() {
    this.$axios.get("api/OverdueTicket/GetSettlementResult").then((res) => {
      if (res.data.status === 0) {
        this.setState({
          recentData: res.data.data,
          recentStatus: true,
        });
        console.log(this.state.recentData);
      } else {
        this.setState({
          recentStatus: false,
        });
      }
    });
  }

  // 获取资金科目
  getSalarySubject() {
    this.$axios.get("api/common/getCapitalSubjects").then((res) => {
      if (res.data.status === 0) {
        this.setState({
          subjectData: res.data.data,
        });
        console.log(this.state.subjectData);
      } else {
        message.warning(res.data.message);
      }
    });
  }

  // 获取扫描系统列表
  getScanerTopics() {
    this.$axios.get("api/Common/GetScanerTopics").then((res) => {
      if (res.data.status === 0) {
        this.setState({
          scanerTopicList: res.data.data,
        });
      }
    });
  }

  // 搜索
  searchData = () => {
    this.getSearchList();
  };

  // 文件上传
  // fileUpload = () => {
  //   const { fileList } = this.state;
  //   const formData = new FormData();
  //   fileList.forEach((file) => {
  //     formData.append("files[]", file);
  //   });

  //   this.setState({
  //     uploading: true,
  //   });

  //   this.$axios
  //     .post("api/OverdueTicket/SettlementByFile", formData, { processData: false })
  //     .then((res) => {
  //       this.setState({
  //         uploading: false,
  //       });
  //       if (res.data.status === 0) {
  //         this.setState({
  //           fileList: [],
  //         });
  //         this.getRecentSettle(); // 近期审核
  //         message.success(res.data.message);
  //       } else {
  //         message.warning(res.data.message);
  //       }
  //     });
  // };

  // 删除文件
  // removeFileBtn = (e) => {
  //   e.stopPropagation();
  //   this.setState({
  //     fileList: [],
  //   });
  // };

  // 文件下载
  // fileLoad = () => {
  //   this.setState({
  //     recentLoading: true
  //   })
  //   this.$axios
  //     .get("api/OverdueTicket/DownloadResult", { responseType: "arraybuffer" })
  //     .then((res) => {
  //       this.setState({
  //         recentLoading: false
  //       })
  //       if (res.status === 200) {
  //         const data = res.data;
  //         const url = window.URL.createObjectURL(
  //           new Blob([data], {
  //             type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  //           })
  //         );
  //         const link = document.createElement("a");
  //         link.style.display = "none";
  //         link.href = url;
  //         link.setAttribute("download", this.state.recentData.file_name);
  //         document.body.appendChild(link);
  //         link.click();
  //         document.body.removeChild(link);
  //       } else {
  //         message.error(res.statusText);
  //       }
  //     });
  // };

  // 报表下载
  reportLoad = () => {
    this.setState({
      reportLoading: true,
    });
    let searchData = JSON.parse(JSON.stringify(this.state.searchData));
    searchData.usage_status = String(searchData.usage_status);
    this.$axios
      .post("api/OverdueTicket/DownloadReport", searchData, {
        responseType: "arraybuffer",
      })
      .then((res) => {
        this.setState({
          reportLoading: false,
        });
        if (res.status === 200) {
          const data = res.data;
          const url = window.URL.createObjectURL(
            new Blob([data], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            })
          );
          const link = document.createElement("a");
          link.style.display = "none";
          link.href = url;
          link.setAttribute("download", `报表${this.$moment().format("X")}.xls`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          message.error(res.statusText);
        }
      });
  };

  // 选择器
  changeSelect = (label, val) => {
    console.log(label, val);

    let data = this.state.searchData;
    data[label] = val;
    this.setState({
      searchData: data,
    });
  };

  // 输入框,单选框
  changeInput = (label, val) => {
    console.log(label, val.target.value);

    let data = this.state.searchData;
    data[label] = val.target.value;
    this.setState({
      searchData: data,
    });
  };

  // 日期选择
  changeDate = (label, date, dateString) => {
    console.log(label, dateString);

    let data = this.state.searchData;
    data[label] = dateString ? this.$moment(dateString).format("YYYY-MM-DD") : null;
    this.setState({
      searchData: data,
    });
  };

  // 对话框弹出
  // openModal = (val) => {
  //   console.log("行", val);
  //   this.setState({
  //     modalData: JSON.parse(JSON.stringify(val)),
  //     showModal: true,
  //   });
  //   this.getSalarySubject(); // 资金科目
  // };

  // 对话框关闭
  closeModal = () => {
    this.setState({
      showModal: false,
    });
  };

  // 结算审核
  // getSettlement = () => {
  //   let data = {
  //     key_id: this.state.modalData.key_id, //类型：Number  必有字段  备注：表id
  //     purchase_refund_price: Number(this.state.modalData.purchase_refund_price), //类型：Number  必有字段  备注：采购应退金额
  //     purchase_actual_refund_price: Number(
  //       this.state.modalData.purchase_actual_refund_price
  //     ), //类型：Number  必有字段  备注：采购实退金额
  //     purchase_actual_refund_subject: this.state.modalData.purchase_actual_refund_subject, //类型：String  必有字段  备注：采购实退科目
  //     purchase_actual_refund_time: this.state.modalData.purchase_actual_refund_time, //类型：String  必有字段  备注：采购实退时间
  //     settlement_status: Number(this.state.modalData.settlement_status), //类型：Number  必有字段  备注：结算状态 0-未结算 1-已结算
  //   };

  //   this.$axios.post("api/overdueticket/settlement", data).then((res) => {
  //     if (res.data.status === 0) {
  //       this.setState({
  //         showModal: false,
  //       });
  //       message.info(res.data.message);
  //     } else {
  //       message.error(res.data.message);
  //     }
  //   });
  // };

  // 弹出框 选择器
  changeSelectModal = (label, e) => {
    console.log(label, e);

    let data = this.state.modalData;
    data[label] = e;
    this.setState({
      modalData: data,
    });
  };

  // 弹出框 输入框
  changeInputModal = (label, e) => {
    let data = this.state.modalData;
    data[label] = e.target.value;
    this.setState({
      modalData: data,
    });
  };

  // 弹出框 日期
  changeDateModal = (label, date, dateString) => {
    console.log(label, dateString);

    let data = this.state.modalData;
    data[label] = dateString;
    this.setState({
      modalData: data,
    });
  };

  render() {
    // const { fileList } = this.state;
    // 多选
    // const rowSelection = {
    //   selectedRowKeys,
    //   onChange: this.onSelectChange,
    // };
    // 单选
    // const rowRadioSelection = {
    //   type: "radio",
    //   selectedRowKeys,
    //   onChange: this.onSelectChange,
    // }
    // 手动上传
    // const props = {
    //   onRemove: (file) => {
    //     this.setState((state) => {
    //       const index = state.fileList.indexOf(file);
    //       const newFileList = state.fileList.slice();
    //       newFileList.splice(index, 1);
    //       return {
    //         fileList: newFileList,
    //       };
    //     });
    //   },
    //   beforeUpload: (file) => {
    //     console.log(file);
    //     this.setState((state) => ({
    //       fileList: [...state.fileList, file],
    //     }));
    //     return false;
    //   },
    //   fileList,
    // };

    return (
      <div className="searchList">
        <Header history={this.props.history}></Header>
        <div className="search_content">
          {/* 筛选条件 */}
          <div className="search_condition">
            <div className="condition_div">
              <div className="div_title">订单类型</div>
              <div className="div_input">
                <Radio.Group
                  value={this.state.searchData.intl_flag}
                  onChange={this.changeInput.bind(this, "intl_flag")}
                >
                  <Radio value={true}>国际</Radio>
                  <Radio value={false}>国内</Radio>
                </Radio.Group>
              </div>
            </div>

            <div className="condition_div">
              <div className="div_title">票号</div>
              <div className="div_input">
                <Input
                  placeholder="请输入"
                  style={{ width: 200 }}
                  allowClear
                  onChange={this.changeInput.bind(this, "ticket_no")}
                />
              </div>
            </div>

            <div className="condition_div">
              <div className="div_title">航司二字码</div>
              <div className="div_input">
                <Input
                  placeholder="请输入"
                  style={{ width: 200 }}
                  allowClear
                  onChange={this.changeInput.bind(this, "airline_code")}
                />
              </div>
            </div>

            <div className="condition_div">
              <div className="div_title">YATP订单号</div>
              <div className="div_input">
                <Input
                  placeholder="请输入"
                  style={{ width: 200 }}
                  allowClear
                  onChange={this.changeInput.bind(this, "yatp_order_no")}
                />
              </div>
            </div>

            <div className="condition_div">
              <div className="div_title">PNR</div>
              <div className="div_input">
                <Input
                  placeholder="请输入"
                  style={{ width: 200 }}
                  allowClear
                  onChange={this.changeInput.bind(this, "pnr_code")}
                />
              </div>
            </div>

            <div className="condition_div">
              <div className="div_title">乘机人</div>
              <div className="div_input">
                <Input
                  placeholder="请输入"
                  style={{ width: 200 }}
                  allowClear
                  onChange={this.changeInput.bind(this, "passengers_name")}
                />
              </div>
            </div>

            {/* <div className="condition_div">
              <div className="div_title">查询类型</div>
              <div className="div_input">
                <Select
                  value={this.state.searchData.query_type}
                  style={{ width: 200 }}
                  allowClear
                  placeholder="请选择"
                  onChange={this.changeSelect.bind(this, "query_type")}
                >
                  <Option value={1}>出票日期</Option>
                  <Option value={2}>起飞日期</Option>
                  <Option value={3}>实退时间</Option>
                  <Option value={4}>结算时间</Option>
                  <Option value={5}>导入时间</Option>
                  <Option value={6}>扫描时间</Option>
                </Select>
              </div>
            </div> */}

            <div className="condition_div">
              <Select
                value={this.state.searchData.query_type}
                bordered={false}
                onChange={this.changeSelect.bind(this, "query_type")}
              >
                <Option value={1}>出票日期</Option>
                <Option value={2}>起飞日期</Option>
                <Option value={3}>实退时间</Option>
                <Option value={4}>结算时间</Option>
                <Option value={5}>导入时间</Option>
                <Option value={6}>扫描时间</Option>
                <Option value={7}>客票有效期</Option>
              </Select>
              <div className="div_input">
                <DatePicker
                  allowClear={false}
                  showToday={false}
                  value={
                    this.state.searchData.begin_date
                      ? this.$moment(this.state.searchData.begin_date)
                      : null
                  }
                  onChange={this.changeDate.bind(this, "begin_date")}
                />
                -
                <DatePicker
                  allowClear={false}
                  showToday={false}
                  value={
                    this.state.searchData.end_date
                      ? this.$moment(this.state.searchData.end_date)
                      : null
                  }
                  onChange={this.changeDate.bind(this, "end_date")}
                />
              </div>
            </div>

            <div className="condition_div">
              <div className="div_title">使用状态</div>
              <div className="div_input">
                <Select
                  placeholder="请选择"
                  style={{ width: 200 }}
                  allowClear
                  mode="multiple"
                  value={this.state.searchData.usage_status}
                  onChange={this.changeSelect.bind(this, "usage_status")}
                >
                  {this.state.applyData.map((item) => (
                    <Option value={item.data_code} key={item.key_id}>
                      {item.data_text}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="condition_div">
              <div className="div_title">扫描系统</div>
              <div className="div_input">
                <Select
                  placeholder="请选择"
                  style={{ width: 200 }}
                  allowClear
                  value={this.state.searchData.scaner_topic}
                  onChange={this.changeSelect.bind(this, "scaner_topic")}
                >
                  {this.state.scannerData.map((item) => (
                    <Option value={item.data_code} key={item.key_id}>
                      {item.data_text}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="condition_div">
              <div className="div_title">订单类型</div>
              <div className="div_input">
                <Select
                  placeholder="请选择"
                  style={{ width: 200 }}
                  allowClear
                  value={this.state.searchData.order_type}
                  onChange={this.changeSelect.bind(this, "order_type")}
                >
                  {this.state.orderTypeList.map((item) => (
                    <Option value={item.data_code} key={item.key_id}>
                      {item.data_text}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="condition_div">
              <div className="div_title">是否退票</div>
              <div className="div_input">
                <Select
                  placeholder="请选择"
                  style={{ width: 200 }}
                  allowClear
                  value={this.state.searchData.is_refund}
                  onChange={this.changeSelect.bind(this, "is_refund")}
                >
                  <Option value={true}>已退票</Option>
                  <Option value={false}>未退票</Option>
                </Select>
              </div>
            </div>

            <div className="condition_div">
              <div className="div_title">查询方式</div>
              <div className="div_input">
                <Select
                  placeholder="请选择"
                  style={{ width: 200 }}
                  value={this.state.searchData.query_way}
                  onChange={this.changeSelect.bind(this, "query_way")}
                >
                  <Option value={0}>最后扫描数据</Option>
                  <Option value={1}>第一次扫描数据</Option>
                  <Option value={2}>第二次扫描数据</Option>
                </Select>
              </div>
            </div>

            {/* 表格操作 */}
            <div className="search_action">
              <div className="action_position">
                <Button type="primary" onClick={this.searchData}>
                  查询
                </Button>
              </div>

              {/* {this.state.recentData ? (
                <div className="action_position">
                  <Tooltip
                    placement="bottom"
                    title={() =>
                      this.state.recentData ? (
                        <>
                          <div>{this.state.recentData.file_name}</div>
                          <div>
                            {this.$moment(this.state.recentData.create_time).format(
                              "YYYY-MM-DD HH:mm:ss"
                            )}
                          </div>
                        </>
                      ) : (
                        ""
                      )
                    }
                  >
                    <Button
                      disabled={!this.state.recentStatus}
                      type="primary"
                      loading={this.state.recentLoading}
                      onClick={this.fileLoad}
                    >
                      下载结算审核结果
                    </Button>
                  </Tooltip>
                </div>
              ) : (
                ""
              )}

              <div className="action_position action_upload">
                {this.state.fileList.length > 0 ? (
                  <Button
                    type="primary"
                    loading={this.state.uploading}
                    onClick={this.fileUpload}
                  >
                    确认上传
                  </Button>
                ) : (
                  ""
                )}

                <Upload {...props}>
                  {this.state.fileList.length > 0 ? (
                    <span style={{ marginLeft: 10 }}>
                      {this.state.fileList[0].name}{" "}
                      <span
                        onClick={this.removeFileBtn}
                        style={{ color: "red", fontSize: 12, cursor: "pointer" }}
                      >
                        删除
                      </span>
                    </span>
                  ) : (
                    <Button type="primary">上传结算数据</Button>
                  )}

                </Upload>
              </div> */}

              <div className="action_position">
                <Button loading={this.state.reportLoading} type="primary" onClick={this.reportLoad}>
                  报表下载
                </Button>
              </div>
            </div>
          </div>

          {/* 列表 */}
          <div className="search_list">
            <Table
              size="small"
              rowKey="key_id"
              scroll={{ x: 3300, y: 500 }}
              pagination={false}
              dataSource={this.state.listData}
              loading={this.state.tableLoading}
            >
              {/* <Column
                title="编号"
                width={100}
                render={(text, record, index) => (<div>{index + 1}</div>)}
              /> */}
              {/* <Column
                title="操作"
                width={60}
                fixed
                render={(text, render) => (
                  <>
                    <div className="table_action">
                      <Button type="primary" onClick={() => this.openModal(render)}>
                        审核
                      </Button>
                    </div>
                  </>
                )}
              /> */}
              <Column
                fixed
                title="订单类型"
                width={75}
                dataIndex="intl_flag"
                render={(text) => <>{text ? "国际" : "国内"}</>}
              />
              <Column
                title="票证类型"
                width={75}
                dataIndex="ticket_type"
                render={(text, render) => (
                  <>
                    <div>{text}</div>
                    <div style={{ fontSize: 12 }}>
                      [
                      {this.state.orderTypeList.map((item) => {

                        return item.data_code === render.order_type ? item.data_text : ""

                      })}
                      ]
                    </div>
                  </>
                )}
              />
              <Column
                title="是否退票"
                width={75}
                dataIndex="is_refund"
                render={(text) => (text ? "已退票" : text === false ? "未退票" : "-")}
              />
              <Column title="票号" width={120} dataIndex="ticket_no" />
              <Column
                title="出票时间"
                width={150}
                dataIndex="issue_time"
                render={(text) => <>{this.$moment(text).format("YYYY-MM-DD HH:mm:ss")}</>}
              />
              <Column title="航司二字码" width={80} dataIndex="airline_code" />
              <Column title="YATP订单号" width={100} dataIndex="yatp_order_no" />
              <Column
                title="PNR"
                width={65}
                dataIndex="pnr_code"
                render={(text) => (
                  <>
                    <Tooltip
                      title={() => (
                        <>
                          <p style={{ fontSize: "14px", marginBottom: "5px" }}>PNR状态</p>
                          <p
                            style={{
                              fontSize: "12px",
                              color: "#fff",
                              minWidth: "90px",
                              marginBottom: "5px",
                            }}
                          >
                            {text}
                          </p>
                        </>
                      )}
                    >
                      {text}
                    </Tooltip>
                  </>
                )}
              />
              <Column title="乘机人" width={75} dataIndex="passengers_name" />
              <Column title="乘机人类型" width={80} dataIndex="passengers_type" />
              <Column title="行程" width={80} dataIndex="trip_code" />
              <Column title="航班号" width={80} dataIndex="flight_no" />
              <Column
                title="使用状态"
                width={80}
                dataIndex="usage_status"
                render={(text) => (
                  <>
                    <Tooltip
                      title={() => (
                        <>
                          <p style={{ fontSize: "14px", marginBottom: "5px" }}>
                            使用状态
                          </p>
                          <p
                            style={{
                              fontSize: "12px",
                              color: "#fff",
                              minWidth: "90px",
                              marginBottom: "5px",
                            }}
                          >
                            {text}
                          </p>
                        </>
                      )}
                    >
                      <div
                        style={{
                          color:
                            text && text.indexOf("全部") !== -1
                              ? "#5AB957"
                              : text && text.indexOf("部分") !== -1
                                ? "#0070E2"
                                : "",
                        }}
                      >
                        {text}
                      </div>
                    </Tooltip>
                  </>
                )}
              />
              <Column
                title="实退科目"
                width={120}
                dataIndex="purchase_actual_refund_subject"
                render={(text) => <>{text || "--"}</>}
              />
              {/* <Column title="应退金额" width={50} dataIndex="purchase_refund_price" />
              <Column
                title="实退金额"
                width={50}
                dataIndex="purchase_actual_refund_price"
              />
              <Column
                title="实退时间"
                width={150}
                dataIndex="purchase_actual_refund_time"
                render={(text) => <>{this.$moment(text).format("YYYY-MM-DD HH:mm:ss")}</>}
              />
              <Column
                title="结算状态"
                width={75}
                dataIndex="settlement_status"
                render={(text) => (
                  <>
                    <Tooltip
                      title={() => (
                        <>
                          <p style={{ fontSize: "14px", marginBottom: "5px" }}>
                            结算状态
                          </p>
                          <p
                            style={{
                              fontSize: "12px",
                              color: "#fff",
                              minWidth: "90px",
                              marginBottom: "5px",
                            }}
                          >
                            {text === 0 ? "未结算" : text === 1 ? "已结算" : ""}
                          </p>
                        </>
                      )}
                    >
                      <div
                        style={{
                          color: text === 0 ? "#FF0000" : text === 1 ? "#5AB957" : "",
                        }}
                      >
                        {text === 0 ? "未结算" : text === 1 ? "已结算" : ""}
                      </div>
                    </Tooltip>
                  </>
                )}
              />
              <Column
                title="结算时间"
                width={150}
                dataIndex="settlement_time"
                render={(text) => <>{this.$moment(text).format("YYYY-MM-DD HH:mm:ss")}</>}
              /> */}
              <Column
                title="起飞时间"
                width={150}
                dataIndex="departure_time"
                render={(text) => <>{this.$moment(text).format("YYYY-MM-DD HH:mm:ss")}</>}
              />
              <Column
                title="导入时间"
                width={150}
                dataIndex="create_time"
                render={(text) => <>{this.$moment(text).format("YYYY-MM-DD HH:mm:ss")}</>}
              />
              <Column title="扫描系统" width={75} dataIndex="scaner_topic" />
              <Column
                title="扫描时间"
                dataIndex="scan_time"
                width={150}
                render={(text) => <>{this.$moment(text).format("YYYY-MM-DD HH:mm:ss")}</>}
              />
            </Table>

            {/* 分页 */}
            <div className="search_list_page">
              <Pagination
                showTotal={(total) => `共 ${total} 条`}
                showSizeChanger
                current={this.state.paginationData.pageNo}
                pageSize={this.state.paginationData.pageCount}
                total={this.state.paginationData.pageTotal}
                pageSizeOptions={[10, 30, 50, 100, 500]}
                onChange={this.changePage}
              />
            </div>
          </div>

          {/* 结算审核 */}
          <Modal
            centered
            title="结算审核"
            width={520}
            closable={false}
            visible={this.state.showModal}
            onCancel={() => this.closeModal()}
            onOk={() => this.getSettlement()}
          >
            <div className="settle_modal">
              <div className="modal_item">
                <div className="modal_title">结算状态</div>
                <div className="modal_input">
                  <Select
                    placeholder="请选择"
                    style={{ width: 120 }}
                    allowClear
                    value={this.state.modalData.settlement_status}
                    onChange={this.changeSelectModal.bind(this, "settlement_status")}
                  >
                    <Option value={0}>未结算</Option>
                    <Option value={1}>已结算</Option>
                  </Select>
                </div>
              </div>

              <div className="modal_item">
                <div className="modal_title">采购实退科目</div>
                <div className="modal_input">
                  <Select
                    placeholder="请选择"
                    style={{ width: 120 }}
                    allowClear
                    showSearch
                    value={this.state.modalData.purchase_actual_refund_subject}
                    onChange={this.changeSelectModal.bind(
                      this,
                      "purchase_actual_refund_subject"
                    )}
                  >
                    {this.state.subjectData.map((item) => (
                      <Option value={item.name} key={item.payMentId}>
                        {item.name}
                      </Option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="modal_item">
                <div className="modal_title">采购应退金额</div>
                <div className="modal_input">
                  <Input
                    placeholder="请输入"
                    style={{ width: 120 }}
                    allowClear
                    value={this.state.modalData.purchase_refund_price}
                    onChange={this.changeInputModal.bind(this, "purchase_refund_price")}
                  />
                </div>
              </div>

              <div className="modal_item">
                <div className="modal_title">采购实退金额</div>
                <div className="modal_input">
                  <Input
                    placeholder="请输入"
                    style={{ width: 120 }}
                    allowClear
                    value={this.state.modalData.purchase_actual_refund_price}
                    onChange={this.changeInputModal.bind(
                      this,
                      "purchase_actual_refund_price"
                    )}
                  />
                </div>
              </div>

              <div className="modal_item">
                <div className="modal_title">采购实退时间</div>
                <div className="modal_input">
                  <DatePicker
                    style={{ width: 120 }}
                    value={this.$moment(this.state.modalData.purchase_actual_refund_time)}
                    onChange={this.changeDateModal.bind(
                      this,
                      "purchase_actual_refund_time"
                    )}
                  />
                </div>
              </div>
            </div>
          </Modal>
        </div>
      </div>
    );
  }
}
