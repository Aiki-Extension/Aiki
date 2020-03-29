import React from 'react';
import { addStorageListener, getFromStorage, setInStorage, setHistoricalFirebase } from '../../util/storage';
import { defaultExerciseSite, defaultExerciseSites, defaultexerciseDuration, s2 } from '../../util/constants';
import { addExerciseSite, parseUrls, removeExerciseSite } from '../../util/block-site';
import { Row, Col, Input, Divider, TimePicker, Icon, Select, Button, Modal } from 'antd';
import moment from 'moment';

const { Option } = Select;

class ExerciseOptions extends React.Component {
  constructor(props) {
    super(props);
    this.addExerciseSiteInput = new React.createRef();
  }

  state = {
    currentExerciseSite: '',
    exerciseSites: [],
    exerciseDuration: 0,
    addSiteModalVisible: false,
    newExerciseSiteUrl: '',
    newExerciseSite: null
  }

  async componentDidMount() {
    addStorageListener(() => this.setup());
    this.setup();
  }

  setup() {
    getFromStorage('currentExerciseSite', 'exerciseSites', 'exerciseDuration')
      .then(async res => {
        let currentExerciseSite = res.currentExerciseSite || defaultExerciseSite.name;
        let exerciseSites = res.exerciseSites || defaultExerciseSites;
        let exerciseDuration = res.exerciseDuration || defaultexerciseDuration;
        if (exerciseSites.length === 0) currentExerciseSite = '';

      this.setState({ currentExerciseSite, exerciseSites, exerciseDuration });
    });
  }
  setCurrentExerciseSite(currentExerciseSite) {
    setHistoricalFirebase({ currentExerciseSite});
    setInStorage({ currentExerciseSite }).then(() => {
      this.setState({ currentExerciseSite });
    });
    await setFirebaseData({ currentExerciseSite }).then(() => {
      this.setState({ currentExerciseSite });
    })
  }

  // time is a moment object
  async setExerciseDuration(time) {
    const exerciseDuration = time.valueOf();
    setHistoricalFirebase({ exerciseDuration });
    setInStorage({ exerciseDuration }).then(() => {
      this.setState({ exerciseDuration });
    });
    await setFirebaseData({ exerciseDuration }).then(() => {
      this.setState({ exerciseDuration });
    });
  }

  setAddSiteModalVisible(visible) {
    this.setState({ addSiteModalVisible: visible });
  }

  addExerciseSite() {
    let { newExerciseSite } = this.state;
    
    // set newly added exercise as current.
    this.setCurrentExerciseSite(newExerciseSite.name);

    addExerciseSite(newExerciseSite);
    this.closeModal();
  }

  setExerciseSiteUrl(e) {
    let newExerciseSiteUrl = e && e.target && e.target.value;

    let { newExerciseSite } = this.state;
    if (!newExerciseSiteUrl) newExerciseSite = null;

    this.setState({ newExerciseSiteUrl, newExerciseSite });
  }

  setExerciseSiteName() {
    if (!this.state.newExerciseSiteUrl) return;

    let urls = parseUrls(this.state.newExerciseSiteUrl);

    if (urls && urls.length === 1) {
      let newExerciseSite = urls[0];
      this.setState({ newExerciseSite });
    }
  }

  closeModal() {
    this.setState({ newExerciseSiteUrl: '', newExerciseSite: null });
    this.setAddSiteModalVisible(false);
  }

  removeCurrentExerciseSite() {
    const { currentExerciseSite, exerciseSites } = this.state;

    removeExerciseSite(currentExerciseSite);
    this.setCurrentExerciseSite(exerciseSites && exerciseSites.length > 0 ? 
        exerciseSites[0].name : '');
  }

  render() {
    return (
      <>
      <Row>
        <Col span={8}>
          Set your exercise website:
        </Col>
        <Col span={16} style={{ textAlign: 'right' }}>
          <Select
            value={this.state.currentExerciseSite}
            style={{ width: 170 }}
            onChange={(e) => this.setCurrentExerciseSite(e)}
          >
            {this.state.exerciseSites.map((site, i) => {
                return (
                  <Option value={site.name} key={i}>
                    <img alt='favicon'
                      src={`${s2}${site.hostname}`} />&nbsp;
                    {site.name}
                  </Option>
                )
              }
            )}
          </Select><br/>
          <Button ghost 
            onClick={() => this.setAddSiteModalVisible(true)}
            style={{ margin:'5px', color: '#40a9ff' }}>
            Add
          </Button>
          <Button ghost 
            onClick={() => this.removeCurrentExerciseSite()}
            style={{ margin:'5px', color: '#40a9ff' }}>
            Remove
          </Button>
          <Modal
            title="Add an exercise website"
            centered
            visible={this.state.addSiteModalVisible}
            onOk={() => this.addExerciseSite()}
            onCancel={() => this.closeModal()}
            width={350}
            cancelText=''
          >
            <Input placeholder="Exercise site url..."
                  onChange={e => this.setExerciseSiteUrl(e)}
                  onBlur={() => this.setExerciseSiteName()}
                  value={this.state.newExerciseSiteUrl}
                  style={{ margin: '20px 0px'}}
                  prefix={<Icon type="global" style={{ color: 'rgba(0,0,0,.25)' }} />}/>
            <Input placeholder="Name..."
                  onChange={e => {
                    let { newExerciseSite } = this.state;
                    newExerciseSite.name = e.target.value;
                    this.setState({ newExerciseSite });
                  }}
                  value={this.state.newExerciseSite && 
                          this.state.newExerciseSite.name}
                  style={{ margin: '20px 0px' }}
                  prefix={this.state.newExerciseSite &&
                    <img
                      alt='favicon'
                      src={`${s2}${this.state.newExerciseSite.hostname}`} />
                  }/>
          </Modal>
        </Col>
      </Row>
      <Divider />
      <Row>
        <Col span={19}>
        </Col>
        <Col span={5}style={{ textAlign: 'center'}}>
          Minutes | Seconds
        </Col>
        <Col span={7}>
          Set your exercise duration:
        </Col>
        <Col span={17} style={{ textAlign: 'right'}}>
            <TimePicker 
                allowClear={false}
                defaultValue={moment('12:08', 'mm:ss')}
                value={moment(this.state.exerciseDuration)}
                secondStep={5}
                suffixIcon={<Icon type="hourglass" />}
                format={'mm:ss'}
                onChange={time => this.setExerciseDuration(time)} />
        </Col>
      </Row> 
      </>
    )
  }
}

export default ExerciseOptions;
