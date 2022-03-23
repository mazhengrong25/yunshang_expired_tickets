/*
 * @Description: 票证扫描 --- 黑名单
 * @Author: mzr
 * @Date: 2022-03-21 16:29:28
 * @LastEditTime: 2022-03-23 15:11:06
 * @LastEditors: mzr
 */
import React, { useState, useEffect } from "react";
import './ticketScan.scss'
import {
  Input,
  Select,
  Button,
  Table,
  Pagination,
  Modal,
  Form,
  message
} from "antd";

import Header from "../../component/header/header"; // 头部横幅
import axios from "../../api/api";

const { Column } = Table;
const { confirm } = Modal;
const { Option } = Select;

function TicketScan() {
  const [dataConfig, setDataConfig] = useState({

    page_no: 1,                //类型：Number  必有字段  备注：当前页码
    page_size: 10,                //类型：Number  必有字段  备注：每页显示条数
    condition: {                //类型：Object  可有字段  备注：无
      airline_code: "",                //类型：String  可有字段  备注：航司代码
      sales_channal_id: ""                //类型：String  可有字段  备注：销售渠道ID
    },

    Limit: 12,                //类型：Number  必有字段  备注：返回数据条数
    Keywords: "",                //类型：String  可有字段  备注：检索关键字
  }); // 原始数据
  const [dataList, setDataList] = useState([]); // 数据列表
  const [dataListLoading, setDataListLoading] = useState(false); // 数据列表加载
  const [saleList, setSaleList] = useState([]); // 销售渠道列表
  const [isConfigModal, setIsConfigModal] = useState(false); // 数据弹窗
  const [configOldData, setConfigOldData] = useState(undefined); // 原始数据
  const [isDeleteLoading, setIsDeleteLoading] = useState(false); // 删除数据加载



  useEffect(() => {
    getDataList();
  }, [dataConfig]); //eslint-disable-line

  // 获取列表数据
  function getDataList() {
    setDataListLoading(true);
    let data = {
      page_no: dataConfig.page_no,                //类型：Number  必有字段  备注：当前页码
      page_size: dataConfig.page_size,                //类型：Number  必有字段  备注：每页显示条数
      condition: {                //类型：Object  可有字段  备注：无
        airline_code: dataConfig.condition.airline_code,                //类型：String  可有字段  备注：航司代码
        sales_channal_id: dataConfig.condition.sales_channal_id               //类型：String  可有字段  备注：销售渠道ID
      }
    }
    axios.post("api/ScanBlackListSetting/GetPage", data)
      .then((res) => {
        setDataListLoading(false);
        if (res.status === 200) {
          setDataList({
            data: res.data.datas,
            count: res.data.page_count
          })
        }
      })
  }

  const handleSearch = (value) => {
    if (value) {
      fetch(value, data => {
        setSaleList(data)
      });
    } else {
      setSaleList([]);
    }
  }

  let timeout;
  let currentValue;
  // 获取销售渠道
  function fetch(value, callback) {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    currentValue = value;

    function fake() {
      let data = {
        Limit: dataConfig.Limit,                //类型：Number  必有字段  备注：返回数据条数
        Keywords: value                //类型：String  可有字段  备注：检索关键字
      }
      axios.post("api/common/SearchSalesChannels", data)
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

  // 数据弹窗
  const [configForm] = Form.useForm();


  // 打开弹窗
  function openModal(val) {
    if (val) {
      let data = []
      val.sales_channal_id && val.sales_channal_id.split('/').map(item => {
        return item ? data.push(item) : ''
      })
      let newVal = JSON.parse(JSON.stringify(val))
      newVal.sales_channal_id = data

      configForm.setFieldsValue(newVal)
      // configForm.setFieldsValue(val)

      console.log('弹窗', val)
    } else {
      configForm.resetFields();
    }

    setConfigOldData(val);
    setIsConfigModal(true);
  }

  // 删除所选数据
  function deleteModal(val) {
    confirm({
      title: "敏感操作",
      centered: true,
      content: "是否确认删除该条数据？",
      confirmLoading: isDeleteLoading,
      okText: "确认删除",
      okType: "danger",
      cancelText: "取消",
      onOk() {
        setIsDeleteLoading(true);

        let data = {
          key_id: val.key_id
        };

        axios
          .post("api/ScanBlackListSetting/delete", data)
          .then((res) => {
            if (res.data.status === 0) {
              setIsDeleteLoading(false);
              message.success(res.data.message)
              getDataList();
            } else {
              message.warning(res.data.message);
            }
          })
          .catch((err) => {
            setIsDeleteLoading(false);
          });
      },
    });
  }

  // 提交弹窗信息
  function submitModal() {
    setIsConfigModal(true);
    let data;
    let modalData = configForm.getFieldsValue();
    let idList = `/${String(modalData.sales_channal_id).replace(/,/g, '/')}/`

    if (configOldData) {
      data = {
        key_id: configOldData.key_id,
        airline_codes: modalData.airline_codes,                //类型：String  必有字段  备注：航司集合(多个用/隔开)
        sales_channal_id: idList               //类型：String  必有字段  备注：销售渠道id集合(多个用/隔开)
      }
    } else {
      data = {
        airline_codes: modalData.airline_codes,                //类型：String  必有字段  备注：航司集合(多个用/隔开)
        sales_channal_id: idList               //类型：String  必有字段  备注：销售渠道id集合(多个用/隔开)
      }
    }
    axios({
      method: "POST",
      url: configOldData ? 'api/ScanBlackListSetting/Update' : 'api/ScanBlackListSetting/Save',
      data: data,
    }).then((res) => {
      if (res.data.status === 0) {
        message.success(res.data.message)
        setIsConfigModal(false);
        getDataList();
      } else {
        message.error(res.data.message)
      }
    })
  }

  // 处理销售渠道id
  // function getSalesText(val) {
  //   let data = []
  //   let textName = ""
  //   if (val) {
  //     val && val.split('/').map(item => {
  //       return item ? data.push(item) : ''
  //     })
  //     for (let i = 0; i < saleList.length; i++) {
  //       for (let o = 0; o < data.length; o++) {
  //         if (saleList[i].value === data[o]) {
  //           textName += saleList[i].text + ' / '
  //           break;
  //         }
  //       }
  //     }
  //   }



  //   return textName || val
  // }

  // 分页器
  const changePage = (page, pageSize) => {
    setDataConfig({ ...dataConfig, page_no: page, page_size: pageSize });
  };

  // 列表筛选
  const openSearch = (val) => {

    let condition = {
      airline_code: "",
      sales_channal_id: ""
    }
    if (val.airline_code) {
      condition.airline_code = val.airline_code;

    }
    if (val.sales_channal_id) {
      condition.sales_channal_id = val.sales_channal_id;
    }
    setDataConfig({ ...dataConfig, condition: condition });
  };

  return (
    <div className="ticket_scan">
      <Header />
      <div className="ticket_scan_content">
        <div className="search_box">
          <Form layout="inline" onFinish={openSearch}>
            <Form.Item label="航司代码" name="airline_code">
              <Input
                allowClear
                placeholder="请输入航司二字码"
              />
            </Form.Item>
            <Form.Item label="销售渠道" name="sales_channal_id">
              <Select
                onSearch={handleSearch}
                showSearch
                style={{ width: 350 }}
                showArrow={false}
                allowClear
                filterOption={false}
                notFoundContent={null}
                placeholder="请选择销售渠道 支持模糊筛选"
              >
                {
                  saleList && saleList.map((item) => <Option value={item.text} key={item.text}>{item.text}</Option>)
                }
              </Select>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                搜索
              </Button>
            </Form.Item>
          </Form>
          <div className="box_list">
            <Button type="primary" onClick={() => openModal()}>
              新增
            </Button>
          </div>
        </div>
        <div className="ticket_scan_table">
          <Table
            dataSource={dataList.data}
            rowKey="key_id"
            // scroll={{ x: 3300, y: "calc(100% - 50px)" }}
            pagination={false}
            loading={dataListLoading}
          >
            <Column title="航司代码" dataIndex="airline_codes" width={270} />
            {/*  render={text => getSalesText(text)}  */}
            <Column title="销售渠道" dataIndex="sales_channal_id" />
            <Column
              title="操作"
              width={135}
              render={(render) => (
                <>
                  <Button
                    size="small"
                    type="link"
                    onClick={() => openModal(render)}
                  >
                    编辑
                  </Button>
                  <Button
                    danger
                    type="link"
                    style={{ marginRight: 5 }}
                    size="small"
                    onClick={() => deleteModal(render)}
                  >
                    删除
                  </Button>
                </>
              )}
            />

          </Table>

          <Pagination
            total={dataList.count}
            current={dataConfig.page_no}
            pageSize={dataConfig.page_size}
            onChange={changePage}
          ></Pagination>

          <Modal
            title="票证扫描设置"
            centered
            width={650}
            visible={isConfigModal}
            onOk={() => submitModal()}
            onCancel={() => setIsConfigModal(false)}
          >
            <Form
              layout="vertical"
              form={configForm}
            >

              <Form.Item
                label="航司代码"
                name="airline_codes"
              >
                <Input placeholder="请输入航司代码" allowClear />
              </Form.Item>

              <Form.Item
                label="销售渠道"
                name="sales_channal_id"
              >
                <Select
                  mode="multiple"
                  onSearch={handleSearch}
                  showSearch
                  showArrow={false}
                  allowClear
                  filterOption={false}
                  notFoundContent={null}
                  placeholder="请选择销售渠道 支持模糊筛选"
                >
                  {
                    saleList && saleList.map((item) => (<Option value={item.text} key={item.text}>{item.text}</Option>))
                  }
                </Select>
              </Form.Item>

            </Form>

          </Modal>
        </div>
      </div>
    </div>
  )
}

export default TicketScan