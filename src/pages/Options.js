import { Button, Card, Col, Input, Layout, Row, Switch, Table, Tag } from 'antd';
import moment, { duration } from 'moment';
import React from 'react';
import ExerciseOptions from '../components/options/ExerciseOptions';
import Statistics from '../components/options/Statistics';
import { blockWebsite, setTimeout, unblockWebsite } from '../util/block-site';
import { defaultTimeoutInterval, s2 } from '../util/constants';
import { addStorageListener, getFromStorage } from '../util/storage';
import './Options.css';
const { Header, Content, Footer } = Layout;

let b = false;
const columns = [
  {
    title: 'Page Name',
    dataIndex: 'name',
    render: (name, site) => (
      <div>
        <img alt='favicon' className='site-favicon' src={`${s2}${site.hostname}`} />
        {name}
      </div>
    ),
    width: 150,
    ellipsis: true, 
  },
  {
    title: 'Page Url',
    dataIndex: 'hostname',
    render: hostname => (
      <code>{hostname}</code>
    ),
    width: 225,
    ellipsis: true,
  },
  {
    title: 'Timeout',
    dataIndex: 'timeout',
    render: (timeout, site) => {
      
      const start = moment() // now
      const end = moment(timeout);
      
      let timedout = timeout && start.isSameOrBefore(end);
      
      const tillStr = end.format('HH:mm');

      const defTiInt = defaultTimeoutInterval / 60 / 1000;
      
      let now = new Date().valueOf();
      
      return (
        <div style={{ display: 'flex' }}>
          <Switch size="small" 
            checked={timedout}
            onChange={checked => 
              setTimeout(site, checked ? now + defaultTimeoutInterval : now)
            }
            style={{ marginRight: '5px' }}
            title="Toggle timeout of blockade" />
          {timedout === true && (
            <>
              <small style={{ display: 'flex', flexDirection: 'column' }}>
                <Tag color="blue" style={{
                  borderColor: 'transparent',
                  backgroundColor: 'transparent'
                }} title = {"Timed out untill " + tillStr } >
                  Untill {tillStr}
                </Tag>
              </small>
              <Button icon="minus" size="small" type="link"
                style={{ color: '#8c8c8c' }}
                onClick={() => setTimeout(site, timeout - defaultTimeoutInterval)} 
                title = {"Minus "+ defTiInt + " minutes to the timeout"}/>
              <Button icon="plus" size="small" type="link"
                style={{ color: '#8c8c8c' }}
                onClick={() => setTimeout(site, timeout + defaultTimeoutInterval)} 
                title = {"Add "+ defTiInt + " minutes to the timeout"}/>
            </>
          )}
        </div>
      );
    }
  },
  {
    title: 'Remove interception',
    dataIndex: 'hostname',
    render: hostname => (
      <Button type="link" shape="circle" icon="close"
        onClick={() => unblockWebsite(hostname)}
        className="remove-button"
        title="Remove interception"/>
    ),
    align: 'right'
  },
];

class Options extends React.Component {
  constructor(props) {
    super(props);
    this.addBlockedWebsiteInput = new React.createRef();
  }

  state = {
    blockedUrls: []
  }

  async componentDidMount() {
    if(b){
      firstTimeRunStorage("2");
      b = false;
    }
    addStorageListener(() => this.setup());
    this.setup();
  }

  setup() {
    getFromStorage('blockedUrls').then(res => {
      let blockedUrls = res.blockedUrls || [];
      this.setState({ blockedUrls });
    });
  }
  
  didAddBlockedWebsite(e) {
    let url = e.target.getAttribute('value');
    this.addBlockedWebsiteInput.current.setValue('');
    blockWebsite(url);
  }

  renderLabel({ value }) {
    return duration(value).humanize();
  }

  render() {
    return (
      <Layout style={{ background: 'rgb(248, 249, 250)' }}>
        <Header>
          <header className="Options-header">
            Distraction Shield
          </header>
        </Header>
        <Content style={{ padding: '20px 50px' }}>
          <Row type="flex" justify="center">
            <Col className="grid-col">
              <h4 className="grid-col-title">Intercepted Websites</h4>
              <Card className="grid-card">
                <h4> Type in your distraction sites here:</h4>
                <Input autoFocus ref={this.addBlockedWebsiteInput} style={{border:'1px solid black'}}
                      placeholder="Type the url here..." 
                      onPressEnter={(e) => this.didAddBlockedWebsite(e)}
                      className='block-button'
                      borderColor='black'/>

                <Table columns={columns}
                      dataSource={this.state.blockedUrls.map(
                        (obj, key) => ({ ...obj, key })
                      )} />
              </Card>
            </Col>
          </Row>
          <Row type="flex" justify="center">
            <Col className="grid-col">
              <h4 className="grid-col-title">Exercise settings</h4>
              <Card className="grid-card">
                <ExerciseOptions />
              </Card>
            </Col>
          </Row>
          <Row type="flex" justify="center">
            <Col className="grid-col">
              <h4 className="grid-col-title">Statistics</h4>
              <Card className="grid-card">
                <Statistics />
              </Card>
            </Col>
          </Row>
        </Content>
        <Footer style={{ textAlign: 'center' }}>University of Groningen © 2019</Footer>
      </Layout>
    );
  }
}

export default Options;
