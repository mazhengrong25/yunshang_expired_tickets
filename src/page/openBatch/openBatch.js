/*
 * @Description: OPEN批次表
 * @Author: mzr
 * @Date: 2022-03-24 16:05:26
 * @LastEditTime: 2022-04-14 17:27:37
 * @LastEditors: mzr
 */
import React, { useState, useEffect } from "react";
import './openBatch.scss'
import {
  Table,
  Tooltip,
  Select,
  Pagination,
  Form,
  Radio,
  Input,
  Button,
  Row,
  Col,
  DatePicker,
  Modal,
  message,
  Upload
} from "antd";

import Header from "../../component/header/header"; // 头部横幅
import axios from "../../api/api";

import moment from "moment";
import "moment/locale/zh-cn";
moment.locale("zh-cn");

const { Column } = Table;
const { Option } = Select;
const { RangePicker } = DatePicker;

function OpenBatch() {
  const [dataConfig, setDataConfig] = useState({
    page_no: 1,
    page_size: 10,
    condition: {

      query_type: 7, //类型：Number  必有字段  备注：查询类型 1:出票日期 2:起飞日期 3:实退时间 4:结算时间 5:导入时间 6:扫描时间
      begin_date: moment().subtract(24, "days").format("YYYY-MM-DD"), //类型：String  必有字段  备注：开始日期
      end_date: moment().add(1, "months").format("YYYY-MM-DD"), //类型：String  必有字段  备注：结束日期
      intl_flag: false, //类型：Boolean  必有字段  备注：国际标识 true:国际 false:国内
      airline_code: "", //类型：String  必有字段  备注：航司二字码
      yatp_order_no: "", //类型：String  必有字段  备注：YATP订单号
      pnr_code: "", //类型：String  必有字段  备注：PNR
      ticket_no: "", //类型：String  必有字段  备注：票号
      usage_status: "全部未使用", //类型：String  必有字段  备注：使用状态
      passengers_name: "", //类型：String  必有字段  备注：乘机人
      scan_topic: "", //类型：String  必有字段  备注：扫描系统
      order_type: null, // 订单类型  为空时 placeholder没有效果
    },

  });

  const [dataList, setDataList] = useState([]); // 数据列表
  const [dataListLoading, setDataListLoading] = useState(false); // 数据列表加载

  const [verifyData, setVerifyData] = useState({}); // 近期审核
  const [verifyStatus, setVerifyStatus] = useState(false); // 审核状态

  const [applyStatus, setApplyStatus] = useState([]); //使用状态
  const [scanerSystem, setScanerSystem] = useState([]); //扫描系统
  const [orderType, setOrderType] = useState([]); // 订单类型

  const [isConfigModal, setIsConfigModal] = useState(false); // 结算审核弹窗
  const [modalLoading, setModalLoading] = useState(false); // 结算审核弹窗确定加载
  const [reportLoading, setReportLoading] = useState(false); // 报表下载加载
  const [verifyLoading, setVerifyLoading] = useState(false); // 审核结果下载加载
  const [upLoading, setUpLoading] = useState(false); // 上传结算数据加载

  const [fileList, setFileList] = useState([]); // 文件上传


  useEffect(() => {
    getDataList();
  }, [dataConfig]); //eslint-disable-line

  // 获取列表
  function getDataList() {
    setDataListLoading(true);
    let data = {
      page_no: dataConfig.page_no,
      page_size: dataConfig.page_size,
      condition: {
        query_type: dataConfig.condition.query_type, //类型：Number  必有字段  备注：查询类型 1:出票日期 2:起飞日期 3:实退时间 4:结算时间 5:导入时间 6:扫描时间
        begin_date: dataConfig.condition.begin_date, //类型：String  必有字段  备注：开始日期
        end_date: dataConfig.condition.end_date, //类型：String  必有字段  备注：结束日期
        intl_flag: dataConfig.condition.intl_flag, //类型：Boolean  必有字段  备注：国际标识 true:国际 false:国内
        airline_code: dataConfig.condition.airline_code, //类型：String  必有字段  备注：航司二字码
        yatp_order_no: dataConfig.condition.yatp_order_no, //类型：String  必有字段  备注：YATP订单号
        pnr_code: dataConfig.condition.pnr_code, //类型：String  必有字段  备注：PNR
        ticket_no: dataConfig.condition.ticket_no, //类型：String  必有字段  备注：票号
        usage_status: dataConfig.condition.usage_status, //类型：String  必有字段  备注：使用状态
        passengers_name: dataConfig.condition.passengers_name, //类型：String  必有字段  备注：乘机人
        scan_topic: dataConfig.condition.scan_topic, //类型：String  必有字段  备注：扫描系统
        order_type: dataConfig.condition.order_type, // 二次扫描
      }
    }
    axios.post("api/overdueticket/GetStatementPage", data)
      .then((res) => {
        setDataListLoading(false);
        if (res.data.status === 0) {
          if (applyStatus.length < 1) {
            getApplyStatus()
          }
          if (scanerSystem.length < 1) {
            getScanerSystem()
          }
          if (orderType.length < 1) {
            getOrderType()
          }

          if (verifyData) {
            recentVerify();
          }
          setDataList({
            data: res.data.datas,
            count: res.data.total_count
          })
        } else {
          message.error(res.data.message)
        }
      })
  }

  // 筛选
  const openSearch = (val) => {

    let condition = {
      query_type: val.query_type,
      begin_date: val.query_date ? moment(val.query_date[0]).format("YYYY-MM-DD") : moment().subtract(6, "months").format("YYYY-MM-DD"),
      end_date: val.query_date ? moment(val.query_date[1]).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD"),
      intl_flag: val.intl_flag,
      airline_code: val.airline_code,
      yatp_order_no: val.yatp_order_no,
      pnr_code: val.pnr_code,
      ticket_no: val.ticket_no,
      usage_status: val.usage_status ? `/${String(val.usage_status).replace(/,/g, '/')}/` : "",
      passengers_name: val.passengers_name,
      scaner_topic: val.scaner_topic,
      query_way: val.query_way,
      order_type: val.order_type,
    }
    setDataConfig({
      ...dataConfig,
      condition: condition
    })
  }

  // 使用状态
  function getApplyStatus() {
    axios.get("api/common/GetDataMappings?src=UsageStatus")
      .then((res) => {
        if (res.data.status === 0) {
          setApplyStatus(res.data.data)
        } else {
          message.error(`获取使用状态：${res.data.message}`)
        }
      })
  }

  // 扫描系统
  function getScanerSystem() {
    axios.get("api/common/GetDataMappings?src=ScanerTopic")
      .then((res) => {
        if (res.data.status === 0) {
          setScanerSystem(res.data.data)
        } else {
          message.error(`获取扫描系统：${res.data.message}`)
        }
      })
  }

  // 订单类型
  function getOrderType() {
    axios.get("api/common/GetDataMappings?src=OrderType")
      .then((res) => {
        if (res.data.status === 0) {
          setOrderType(res.data.data)
        } else {
          message.error(`获取订单类型：${res.data.message}`)
        }
      });
  }

  // 分页器
  const changePage = (page, pageSize) => {
    setDataConfig({ ...dataConfig, page_no: page, page_size: pageSize });
  };

  // 报表下载
  function reportLoad() {
    setReportLoading(true)
    let searchData = JSON.parse(JSON.stringify(dataConfig.condition))
    axios.post("api/OverdueTicket/DownloadStatementReport", searchData, {
      responseType: "arraybuffer",
    })
      .then((res) => {
        setReportLoading(false)
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
          link.setAttribute("download", `报表${moment().format("X")}.xls`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          message.error(res.statusText);
        }
      });
  }

  // 审核结果下载
  function verifyLoad() {
    setVerifyLoading(true)
    axios.get("api/OverdueTicket/DownloadResult",
      { responseType: "arraybuffer" }
    ).then((res) => {
      setVerifyLoading(false)
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
        link.setAttribute("download", `报表${moment().format("X")}.xls`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        message.error(res.statusText);
      }
    })
  }

  // 获取近期审核文件 
  function recentVerify() {
    axios.get("api/OverdueTicket/GetSettlementResult")
      .then((res) => {
        if (res.data.status === 0) {
          setVerifyData({
            verifyData: res.data.data
          })
          setVerifyStatus(true);
          message.success(res.data.message)
        } else {
          setVerifyStatus(false);
          message.error(`近期审核文件获取失败：${res.data.message}`)
        }
      })
  }

  // 上传结算数据
  function upLoad() {

    const formData = new FormData();
    fileList && fileList.forEach((file) => {
      formData.append("files[]", file);
    });
    setUpLoading(true);
    axios
      .post("api/OverdueTicket/SettlementByFile", formData, { processData: false })
      .then((res) => {
        setUpLoading(false);
        if (res.data.status === 0) {
          setFileList([]);
          recentVerify(); // 近期审核
          message.success(res.data.message);
        } else {
          message.warning(res.data.message);
        }
      });
  }

  // 删除文件
  function removeFileBtn(e) {
    e.stopPropagation();
    setFileList([]);
  };

  const [configForm] = Form.useForm();

  //  打开审核弹窗
  function openModal(val) {
    setIsConfigModal(true);
    if (val.purchase_actual_refund_time) {
      val.purchase_actual_refund_time = moment(val.purchase_actual_refund_time)
    }
    configForm.setFieldsValue(val)
  }

  // 提交审核结果
  function submitModal() {
    setIsConfigModal(true);
    setModalLoading(true);
    let modalData = configForm.getFieldValue();
    let data = {
      key_id: modalData.key_id,                //类型：Number  必有字段  备注：表id
      purchase_refund_price: Number(modalData.purchase_refund_price),                //类型：Number  必有字段  备注：采购应退金额
      purchase_actual_refund_price: Number(modalData.purchase_actual_refund_price),                //类型：Number  必有字段  备注：采购实退金额
      purchase_actual_refund_subject: modalData.purchase_actual_refund_subject,                //类型：String  必有字段  备注：采购实退科目
      purchase_actual_refund_time: moment(modalData.purchase_actual_refund_time).format('YYYY-MM-DD'),                //类型：String  必有字段  备注：采购实退时间
      settlement_status: modalData.settlement_status                //类型：Number  必有字段  备注：结算状态 0-未结算 1-已结算
    }
    axios.post("api/overdueticket/settlement", data)
      .then((res) => {
        setIsConfigModal(false);
        if (res.data.status === 0) {
          message.success(res.data.message)
          setModalLoading(false);
        } else {
          message.error(res.data.message)
        }
      })
  }

  const props = {
    onRemove: (file) => {
      setFileList([])
    },
    beforeUpload: (file) => {
      let data = []
      data.push(file)
      setFileList(data)
      return false;
    },
    fileList,
  };
  return (
    <div className="openBatch">
      <Header />
      <div className="openBatch_content">
        <div className="openBatch_content_form">
          <Form
            layout="inline"
            onFinish={openSearch}
            initialValues={dataConfig.condition}
          >

            <Form.Item label="国际标识" name="intl_flag">
              <Radio.Group>
                <Radio value={true}>国际</Radio>
                <Radio value={false}>国内</Radio>
              </Radio.Group>
            </Form.Item>



            <Form.Item label="票号" name="ticket_no">
              <Input placeholder="请输入票号" allowClear />
            </Form.Item>

            <Form.Item label="航司" name="airline_code">
              <Input placeholder="请输入航司二字码" allowClear />
            </Form.Item>

            <Form.Item label="YATP订单号" name="yatp_order_no">
              <Input placeholder="请输入YATP订单号" allowClear />
            </Form.Item>

            <Form.Item name="query_type">
              <Select
                bordered={false}
              >
                <Option value={1}>出票日期</Option>
                <Option value={2}>起飞日期</Option>
                <Option value={3}>实退时间</Option>
                <Option value={4}>结算时间</Option>
                <Option value={5}>导入时间</Option>
                <Option value={6}>扫描时间</Option>
                <Option value={7}>客票有效期</Option>
              </Select>
            </Form.Item>
            <Form.Item name="query_date">
              <RangePicker
              />
            </Form.Item>
            <Form.Item label="PNR" name="pnr_code">
              <Input placeholder="请输入pnr" allowClear />
            </Form.Item>

            <Form.Item label="乘机人" name="passengers_name">
              <Input placeholder="请输入乘机人" allowClear />
            </Form.Item>

            <Form.Item label="使用状态" name="usage_status">
              <Select
                allowClear
                mode="multiple"
                placeholder="请选择使用状态"
                style={{ width: 250 }}
              >
                {
                  applyStatus && applyStatus.map((item) => (<Option value={item.data_text} key={item.key_id}>{item.data_text}</Option>))
                }
              </Select>
            </Form.Item>

            <Form.Item label="扫描系统" name="scaner_topic">
              <Select
                allowClear
                placeholder="请选择扫描系统"
              >
                {
                  scanerSystem && scanerSystem.map((item) => (<Option value={item.data_text} key={item.key_id}>{item.data_text}</Option>))
                }
              </Select>
            </Form.Item>

            <Form.Item label="订单类型" name="order_type">
              <Select
                allowClear
                placeholder="请选择订单类型"
                style={{ width: 150 }}
              >
                {
                  orderType && orderType.map((item) => (<Option value={item.data_code} key={item.key_id}>{item.data_text}</Option>))
                }
              </Select>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                查询
              </Button>
            </Form.Item>


          </Form>
          <div className="openBatch_content_action">
            <div className="action_item">
              <Button type="primary" onClick={() => reportLoad()} loading={reportLoading}>
                报表下载
              </Button>
            </div>
            {verifyData ? (
              <div className="action_item">
                <Tooltip
                  placement="bottom"
                  title={() =>
                    verifyData ? (
                      <>
                        <div>{verifyData.file_name}</div>
                        <div>
                          {moment(verifyData.create_time).format(
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
                    type="primary"
                    onClick={() => verifyLoad()}
                    loading={verifyLoading}
                    disabled={!verifyStatus}
                  >
                    下载审核结果
                  </Button>
                </Tooltip>
              </div>
            ) : ("")}
            <div className="action_item">
              {fileList && fileList.length > 0 ? (

                <Button type="primary" onClick={() => upLoad()} loading={upLoading}>
                  确认上传
                </Button>
              ) : ("")}
              <Upload {...props} showUploadList={false}>
                {fileList && fileList.length > 0 ? (
                  <span style={{ marginLeft: 10 }}>
                    {fileList[0].name}{" "}
                    <span
                      onClick={(e) => removeFileBtn(e)}
                      style={{ color: "red", fontSize: 12, cursor: "pointer" }}
                    >
                      删除
                    </span>
                  </span>
                ) : (
                  <Button type="primary">上传结算数据</Button>
                )}

              </Upload>
            </div>

          </div>


        </div>

        <Table
          size="small"
          rowKey="key_id"
          dataSource={dataList.data}
          pagination={false}
          loading={dataListLoading}
          scroll={{ x: 2500, y: 550 }}
        >
          <Column
            fixed
            title="操作"
            render={(text, render) => (
              <>
                <Button type="primary" size="small" onClick={() => openModal(render)}>审核</Button>
              </>
            )}
          />
          <Column
            title="出票时间"
            width={150}
            fixed
            dataIndex="issue_time"
            render={(text) => <>{moment(text).format("YYYY-MM-DD HH:mm:ss")}</>}
          />
          <Column
            width={150}
            fixed
            title="客票有效期"
            dataIndex="ticket_validity"
            render={(text, render) => (
              <>
                <div style={{ color: (moment(text).diff(moment(), 'd') <= 3 && moment(text).diff(moment(), 'd') >= 0) ? "#ff6161" : "" }}>
                  {text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : "--"}
                </div>
              </>
            )}
          />
          <Column
            title="订单类型"
            dataIndex="intl_flag"
            render={(text) => <>{text ? "国际" : "国内"}</>}
          />
          <Column
            title="票证类型"
            dataIndex="ticket_type"
            render={(text, render) => (
              <>
                <div>{text}</div>
                <div>
                  {render.order_type === "TicketsOrder" ? "正常票"
                    : render.order_type === "ChangeOrder" ? "改期票" : "--"
                  }
                </div>
              </>
            )}
          />
          <Column
            title="使用状态"
            width={120}
            dataIndex="usage_status"
            render={(text, render) => (
              <>
                <Tooltip
                  title={() => (
                    <>
                      <div>
                        <div style={{ fontSize: "14px", marginBottom: "5px" }}>
                          扫描状态
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#fff",
                            minWidth: "90px",
                            marginBottom: "5px",
                          }}
                        >
                          <div>首次:{render.scan_msg ? render.scan_msg : "--"}</div>
                          <div>再次:{render.second_scan_msg ? render.second_scan_msg : "--"}</div>
                        </div>
                      </div>
                    </>
                  )}
                >
                  <div>
                    <div style={{ color: "#24e3bd" }}>
                      首次:
                      <span style={{ color: "#000000d9" }}>{text ? text : "--"}</span>
                    </div>
                    <div style={{ color: "#ff6161" }}>
                      再次:
                      <span style={{ color: "#000000d9" }}>{render.second_usage_status ? render.second_usage_status : "--"}</span>


                    </div>
                  </div>
                </Tooltip>
              </>
            )}
          />
          <Column
            width={120}
            title="客票状态"
            dataIndex="ticket_status"
            render={(text, render) => (
              <>
                <Tooltip
                  title={() => (
                    <>
                      <div>
                        <p style={{ fontSize: "14px", marginBottom: "5px" }}>
                          客票状态
                        </p>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#fff",
                            minWidth: "90px",
                            marginBottom: "5px",
                          }}
                        >
                          <div>首次:{text ? text : "--"}</div>
                          <div>再次:{render.second_ticket_status ? render.second_ticket_status : "--"}</div>
                        </div>
                      </div>
                    </>
                  )}
                >
                  <div>
                    <div style={{ color: "#24e3bd" }}>
                      首次:
                      <span style={{ color: "#000000d9" }}>{text ? text : "--"}</span>
                    </div>
                    <div style={{ color: "#ff6161" }}>
                      再次:
                      <span style={{ color: "#000000d9" }}>{render.second_ticket_status ? render.second_ticket_status : "--"}</span>
                    </div>
                  </div>
                </Tooltip>
              </>
            )}
          />
          <Column
            title="采购票面价\税金"
            width={120}
            dataIndex="purchase_face"
            render={(text, render) => (
              <>
                <div>
                  票面价:{text}
                </div>
                <div>
                  税金:{render.purchase_tax}
                </div>
              </>
            )}
          />
          <Column title="利润中心" width={100} dataIndex="profit_center_name" />
          <Column title="销售渠道" width={150} dataIndex="sales_channel_name" />
          <Column title="航司" dataIndex="airline_code" />
          <Column title="航班号" dataIndex="flight_no" />
          <Column title="票号" width={120} dataIndex="ticket_no" />
          <Column
            title="PNR"
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
          <Column
            title="乘机人"
            dataIndex="passengers_name"
            render={(text, render) => (
              <>
                <div>{render.passengers_type}</div>
                <div>{text}</div>
              </>
            )}
          />
          <Column
            title="行程"
            dataIndex="trip_code"
            render={(text) => (

              text ? text : "--"
            )
            }
          />
          <Column
            title="订座OFFICE"
            dataIndex="office_no"
            render={(text) => (text ? text : "--")}
          />
          <Column
            title="起飞时间"
            width={150}
            dataIndex="departure_time"
            render={(text) => <>{moment(text).format("YYYY-MM-DD HH:mm:ss")}</>}
          />
          <Column
            title="导入时间"
            width={150}
            dataIndex="create_time"
            render={(text) => <>{moment(text).format("YYYY-MM-DD HH:mm:ss")}</>}
          />
          <Column title="扫描系统" dataIndex="scan_topic" />
          <Column
            title="扫描时间"
            dataIndex="scan_time"
            width={150}
            render={(text, render) => (

              <>
                <div>
                  {moment(text).format("YYYY-MM-DD HH:mm:ss") ? moment(text).format("YYYY-MM-DD HH:mm:ss") : "--"}
                </div>
                <div>

                  {moment(render.second_scan_time).format("YYYY-MM-DD HH:mm:ss") ? moment(render.second_scan_time).format("YYYY-MM-DD HH:mm:ss") : "--"}
                </div>
              </>
            )}
          />
        </Table>
        <div className="openBatch_page">
          <Pagination
            total={dataList.count}
            current={dataConfig.page_no}
            pageSize={dataConfig.page_size}
            onChange={changePage}
            showTotal={(total) => `共 ${total} 条`}
          ></Pagination>
        </div>

        {/* 审核弹窗 */}
        <Modal
          title="结算审核"
          centered
          width={650}
          visible={isConfigModal}
          onOk={() => submitModal()}
          onCancel={() => setIsConfigModal(false)}
          confirmLoading={modalLoading}
        >
          <Form
            layout="inline"
            form={configForm}
          >
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item
                  label="应退金额"
                  name="purchase_refund_price"
                >
                  <Input placeholder="请输入应退金额" allowClear />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="实退金额"
                  name="purchase_actual_refund_price"
                >
                  <Input placeholder="请输入实退金额" allowClear />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="实退科目"
                  name="purchase_actual_refund_subject"
                >
                  <Input placeholder="请输入实退科目" allowClear />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="结算状态"
                  name="settlement_status"
                >
                  <Select
                    placeholder="请选择结算状态"
                  >

                    <Option value={0}>未结算</Option>
                    <Option value={1}>已结算</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="实退时间"
                  name="purchase_actual_refund_time"
                >
                  <DatePicker
                    allowClear={false}
                    placeholder="请选择实退时间"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>

      </div>
    </div>
  )
}

export default OpenBatch