/* global chrome */
import React from 'react';
import logo from '../images/aikido.png';
import './Popup.css';
import { Switch, Button, Row, Col } from 'antd';
import {
  blockCurrentWebsite,
  isCurrentWebsiteBlocked,
  unBlockCurrentWebsite
} from '../util/block-site';
import {
  getFromStorage,
  setInStorage,
  addStorageListener,
  setHistoricalFirebase

} from '../util/storage';

class Popup extends React.Component {
  state = {
    currentBlocked: false,
    currentAnInterceptionSite: false,
    enabled: undefined,
    totalTimeSpentLearningData:0,
    totalIntercepts:0,
    rexTitle: "www.br.dk"
  };

  componentDidMount() {
    addStorageListener(() => this.setup());
    this.setup();
  }

  setup() {
    getFromStorage('enabled',  'intercepts',  'timeSpentLearning')
      .then((res) => {
      this.setState(typeof res.enabled === 'boolean' ? 
        res : 
        { enabled: true });
        // default value is enabled. will still undefined in storage untill one
        // turns the switch off.
        let intercepts = res.intercepts || {};
        let totalIntercepts = Object.values(intercepts).reduce(function(a, b) {
          return a + b 
        },0);
        
        let timeSpentLearning = res.timeSpentLearning || {};
        let totalTimeSpentLearningData = Object.values(timeSpentLearning).reduce(function(a, b) {
          return a + b 
        },0);

        this.setState({totalIntercepts, totalTimeSpentLearningData});
    });
    isCurrentWebsiteBlocked().then(currentBlocked => {
      this.setState({ currentBlocked });
    });
  }

  async onSwitchChange(enabled) {
    this.setState({ enabled });
    setHistoricalFirebase({ enabled});
    setInStorage({ enabled });
    await setFirebaseData({ enabled });
  }

  openOptionsPage() {
    if (window.chrome && chrome.runtime && chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.history.pushState({ urlPath: '?page=options' }, '', '?page=options');
      window.location.reload(); // not ideal, but works.
    }
  }

  convertToMinutesAndSeconds(){
    let hours = Math.floor(this.state.totalTimeSpentLearningData / 3600000);
    let minutes = Math.floor((this.state.totalTimeSpentLearningData / 60000)%60);
    let seconds = ((this.state.totalTimeSpentLearningData % 60000) / 1000).toFixed(0);
    if(hours < 1) {
      return minutes + " min " + seconds + " sec";
    } else {
      return hours + " hours " + minutes + " min " + seconds + " sec";
    }
  }

  render() {
    return (
      <div className="Popup">
        <header className="Popup-header">
          <Row>
           <Col span={6}>
             <img src={logo} className="Popup-logo" alt="logo" />
           </Col>
           <Col>
              Distraction Shield
           </Col>
          </Row>
        </header>
        <Row className="Popup-body">
          <Col span={4}>
            Settings:
          </Col>
          <Col style={{ textAlign: 'right'}}>
            <Button type="default" shape="circle" icon="setting"
              onClick={() => this.openOptionsPage()}
            />
          </Col>
        </Row>
        <Row className="Popup-body">
          <Col className="Popup-statistics-title">
            Intercepting:
          </Col>
          <Col style={{ textAlign: 'center'}}>
            <Switch
                    loading={this.state.enabled === undefined}
                    checked={this.state.enabled}
                    onChange={checked => this.onSwitchChange(checked)} 
                    checkedChildren="Enabled" 
                    unCheckedChildren="Disabled"/>
          </Col>
        </Row>   
        <Row className="Popup-body">
          <Col className="Popup-statistics-title">
            Total intercepts: 
          </Col>
          <Col className="Popup-statistics">
            {this.state.totalIntercepts}
          </Col>         
        </Row>
        <Row className="Popup-body">
          <Col className="Popup-statistics-title">
            Time spent learning:
          </Col>
          <Col className="Popup-statistics">
            {this.convertToMinutesAndSeconds()}
          </Col>      
        </Row>
        <Row className="Popup-current">
          <Col>
            <Button ghost={this.state.currentBlocked}
              type="primary" onClick={() => {
                !this.state.currentBlocked && blockCurrentWebsite();
                this.state.currentBlocked && unBlockCurrentWebsite();
              }}>
              {this.state.currentBlocked ? 'Don\'t intercept this' : 'Intercept this page'}
            </Button>
          </Col>
        </Row>      
      </div>
    );
  }
}

export default Popup;
