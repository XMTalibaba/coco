import React, { Component, Fragment } from 'react';
import {
  EuiPage,
	EuiFlexGroup,
	EuiFlexItem,
	EuiTitle,
	EuiPopover,
	EuiButtonIcon,
	EuiPopoverTitle,
} from '@elastic/eui';
import { withReduxProvider, withGlobalBreadcrumb, withUserAuthorizationPrompt } from '../../components/common/hocs';
import { compose } from 'redux';
import { WAZUH_MODULES } from '../../../common/wazuh-modules';
import { getHttp } from '../../kibana-services';
import { AppState } from '../../react-services/app-state';
import './screen/screen2.scss';
import { Echarts1 } from './screen/echarts1' // 告警等级区间内主要告警分布-饼图
import { Echarts2 } from './screen/echarts2' // 非法网路连接主机分布-饼图
import { Echarts3 } from './screen/echarts3' // 端口开放Top5-柱状图
import { Echarts4 } from './screen/echarts4' // 主机告警分布趋势图-柱状折线图
import { Echarts5 } from './screen/echarts5' // 最新20条告警-轮播图
import { Echarts6 } from './screen/echarts6' // 主机连接状态分布图-饼图
import { Echarts7 } from './screen/echarts7' // 弱口令主机分布图-饼图
import { Echarts8 } from './screen/echarts8' // 系统状态-单个仪表盘
import { Echarts9 } from './screen/echarts9' // 检测主机状态
import { Echarts10 } from './screen/echarts10' // 系统状态-三个仪表盘
import { Echarts11 } from './screen/echarts11' // 主机告警趋势图-折线图
import { Echarts12 } from './screen/echarts12' // 弱口令词云Top5-词云
import { Echarts13 } from './screen/echarts13' // 非法网络连接Top5-折线图
import { Echarts14 } from './screen/echarts14' // 时间同步告警趋势图-折线图
import { Echarts15 } from './screen/echarts15' // 系统状态-三个仪表盘2

export const Screen = compose(
	withReduxProvider,
	withGlobalBreadcrumb([{ text: '' }, { text: '首页' }, { text: '安全驾驶仓' }]),
	withUserAuthorizationPrompt(null, AppState.getPagePermission)
)(class Screen extends Component {
  constructor(props) {
    super(props);
    this.offset = 180;
    this.state = {
      isDescPopoverOpen: false,
      isFullScreen: false,
      isChangeSize: false
    }
  }

  componentDidMount() {
    this.height = window.innerHeight - this.offset;
    window.addEventListener('resize', this.updateHeight);
    let timer = setInterval(() => {
      let large = document.getElementById('large-warp'); // 获取容器
      if (large.clientWidth !==0 || large.clientHeight !== 0) {
        clearInterval(timer)
        this.updateHeight();
        this.rainBg()
      }
    }, 100)
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.updateHeight);
  }

  updateHeight = () => {
    this.height = window.innerHeight - this.offset;
    this.forceUpdate();

    let large = document.getElementById('large-warp'); // 获取容器
    let warp = document.getElementById('screen-warp'); // 获取容器
    const designDraftWidth = 1668; //设计稿的宽度
    const designDraftHeight = 743; //设计稿的高度
    const scale = large.clientHeight === 0 || large.clientWidth / large.clientHeight < designDraftWidth / designDraftHeight ?
      (large.clientWidth / designDraftWidth) :
      (large.clientHeight / designDraftHeight);
    // const scale = large.clientWidth / designDraftWidth
    warp.style.transform = `scale(${scale}, 1) translate(-50%)`;
    warp.style.height = `${large.clientHeight}px`;
    const { isChangeSize } = this.state;
    this.setState({ isChangeSize: !isChangeSize })
  };

  rainBg() {
    var c = document.querySelector(".rain");
    var ctx = c.getContext("2d");//获取canvas上下文
    var w = c.width = document.getElementById('large-warp').clientWidth;
    var h = c.height = document.getElementById('large-warp').clientHeight;
    //设置canvas宽、高

    function random(min, max) {
      return Math.random() * (max - min) + min;
    }

    function RainDrop() { }
    //雨滴对象 这是绘制雨滴动画的关键
    RainDrop.prototype = {
      init: function () {
        this.x = random(0, w);//雨滴的位置x
        this.y = h;//雨滴的位置y
        this.color = 'hsl(180, 100%, 50%)';//雨滴颜色 长方形的填充色
        this.vy = random(4, 5);//雨滴下落速度
        this.hit = 0;//下落的最大值
        this.size = 2;//长方形宽度
      },
      draw: function () {
        if (this.y > this.hit) {
          var linearGradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.size * 30)
          // 设置起始颜色
          linearGradient.addColorStop(0, '#1faeea')
          // 设置终止颜色
          linearGradient.addColorStop(1, 'rgba(31, 174, 234, 0.1)')
          // 设置填充样式
          ctx.fillStyle = linearGradient
          ctx.fillRect(this.x, this.y, this.size, this.size * 50);//绘制长方形，通过多次叠加长方形，形成雨滴下落效果
        }
        this.update();//更新位置
      },
      update: function () {
        if (this.y > this.hit) {
          this.y -= this.vy;//未达到底部，增加雨滴y坐标
        } else {
          this.init();
        }
      }
    };

    function resize() {
      w = c.width = document.getElementById('large-warp').clientWidth;
      h = c.height = document.getElementById('large-warp').clientHeight;
    }

    //初始化一个雨滴

    var rs = []
    for (var i = 0; i < 10; i++) {
      setTimeout(function () {
        var r = new RainDrop();
        r.init();
        rs.push(r);
      }, i * 300)
    }

    function anim() {
      ctx.clearRect(0, 0, w, h);//填充背景色，注意不要用clearRect，否则会清空前面的雨滴，导致不能产生叠加的效果
      for (var i = 0; i < rs.length; i++) {
        rs[i].draw();//绘制雨滴
      }
      requestAnimationFrame(anim);//控制动画帧
    }

    window.addEventListener("resize", resize);
    //启动动画
    anim()
  }

  renderTitle() {
		return (
      <EuiFlexGroup>
        <EuiFlexItem className="wz-module-header-agent-title">
          <EuiFlexGroup justifyContent={'spaceBetween'}>
            <EuiFlexItem grow={false}>
              <span style={{ display: 'inline-flex' }}>
                <EuiTitle size="s">
                  <h1>
                    <span>&nbsp;{WAZUH_MODULES['screen'].title}&nbsp;&nbsp;</span>
                  </h1>
                </EuiTitle>
                <EuiPopover
                  button={
                    <EuiButtonIcon
                      iconType="iInCircle"
                      style={{marginTop: 3}}
                      color='primary'
                      aria-label='Open/close'
                      onClick={() => { this.setState({ isDescPopoverOpen: !this.state.isDescPopoverOpen }) }}
                    />
                  }
                  anchorPosition="rightUp"
                  isOpen={this.state.isDescPopoverOpen}
                  closePopover={() => { this.setState({ isDescPopoverOpen: false }) }}>
                  <EuiPopoverTitle>模块说明</EuiPopoverTitle>
                  <div style={{ width: '400px' }}>
                    {WAZUH_MODULES['screen'].description}
                  </div>
                </EuiPopover>
              </span>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
						</EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
	}

  render() {
    const { isFullScreen, isChangeSize } = this.state;
    const title = this.renderTitle();
    return (
      <EuiFlexGroup direction="column">
				<EuiFlexItem grow={false}>
					<div className="wz-module">
						<div className='wz-module-header-agent-wrapper'>
							<div className='wz-module-header-agent'>
								{title}
							</div>
						</div>
						<div className='wz-module-body-notab'>
							<EuiPage>
                <div className={`largeWarp${isFullScreen ? ' fullStyle' : ''}`} style={{ height: isFullScreen ? 'auto' : this.height }} id="large-warp">
                  <canvas className="rain"></canvas>
                  <div id="screen-warp" className="screenWarp">
                    <div className="headerWarp">
                      日志审计
                      <EuiButtonIcon
                        aria-label='full'
                        onClick={() => this.setState({ isFullScreen: !isFullScreen }, this.updateHeight)}
                        iconType={getHttp().basePath.prepend(`/plugins/wazuh/assets/large/${isFullScreen ? 'exitFull' : 'fullScren'}.png`)}
                        className="fullIcon"
                      />
                    </div>
                    <div className="echartsWarp">
                      <div style={{ width: '25%', height: '100%' }}>
                        {/* <div className="echartsItem">
                          <div className="echartsTitle">告警等级区间内主要告警分布</div>
                          <div className="echartsContent"><Echarts1 isChangeSize={isChangeSize} /></div>
                        </div> */}
                        <div className="echartsItem">
                          <div className="echartsTitle">最新20条告警</div>
                          <div className="echartsContent"><Echarts5 isChangeSize={isChangeSize} /></div>
                        </div>
                        <div className="echartsItem">
                          <div className="echartsTitle">非法网络连接Top5</div>
                          <div className="echartsContent">
                            {/* <Echarts2 isChangeSize={isChangeSize} /> */}
                            <Echarts13 isChangeSize={isChangeSize} />
                          </div>
                        </div>
                        <div className="echartsItem">
                          <div className="echartsTitle">端口开放Top5</div>
                          <div className="echartsContent"><Echarts3 isChangeSize={isChangeSize} /></div>
                        </div>
                      </div>
                      <div style={{ width: '50%', margin: '0 10px', height: '100%' }}>
                        <div className="echartsItemCenter">
                          {/* <div className="echartsTitleCenter">主机告警分布趋势图</div>
                          <div className="echartsContentCenter"><Echarts4 isChangeSize={isChangeSize} /></div> */}
                          <Echarts9 />
                        </div>
                        {/* <div className="echartsItem">
                          <div className="echartsTitle">最新20条告警</div>
                          <div className="echartsContent"><Echarts5 isChangeSize={isChangeSize} /></div>
                        </div> */}
                      </div>
                      <div style={{ width: '25%', height: '100%' }}>
                        <div className="echartsItem">
                          <div className="echartsTitle">主机告警趋势图</div>
                          <div className="echartsContent"><Echarts11 isChangeSize={isChangeSize} /></div>
                        </div>
                        <div className="echartsItem">
                          <div className="echartsTitle">时间同步告警趋势图</div>
                          <div className="echartsContent">
                            {/* <Echarts7 isChangeSize={isChangeSize} /> */}
                            <Echarts14 isChangeSize={isChangeSize} />
                          </div>
                        </div>
                        <div className="echartsItem">
                          <div className="echartsTitle">系统状态</div>
                          <div className="echartsContent">
                            {/* <Echarts8 isChangeSize={isChangeSize} /> */}
                            <Echarts15 isChangeSize={isChangeSize} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
							</EuiPage>
						</div>
					</div>
				</EuiFlexItem>
			</EuiFlexGroup>
    )
  }
})