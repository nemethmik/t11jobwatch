class Timer extends React.Component {
  constructor(props) {
    super(props)
    this.state = {secondsElapsed: (props.start ?? 0)}
  }
  tick() {
    this.setState({secondsElapsed: this.state.secondsElapsed + 1})
  }
//  componentDidMount() {this.interval = setInterval(() => this.tick(), 1000)}
  componentDidMount() {this.interval = setInterval(this.tick.bind(this), 1000)}
  componentWillUnmount() {clearInterval(this.interval)}
  render() {
    const timeStr = new Date(this.state.secondsElapsed * 1000).toISOString().substr(11, 8)
    return React.createElement("div",{children:timeStr,})
  }
}

$(document).on("pagebeforeshow", e => {
  if(e.target.id === "runningJobPage") {
    const job = getRunningJobFromLocalStore()
    resourceCodeAndNameDisplayText.textContent = `${job.ItemName} (${job.ItemCode})`
    routStageStatusDisplayText.textContent = (job.Status === "I" ? "In Progress" : (job.Status === "C" ? "Completed" : "Planned"))
    operationNameDisplayText.textContent = job.RSName ? job.RSName : job.ItemName
    openQtyDisplayText.textContent = `[ ${parseInt(job.OpenQty)} ]`
    productNameDisplayText.textContent = job.ProdName
    operationIDDisplayText.textContent = `${job.DocNum} / ${job.SeqNum} / ${job.VisOrder}`
    starttime.textContent = formatTime(job.BeginTime)
    const runningMinutes = minuteDiff(sapDTToDate(job.Recontact,job.BeginTime),new Date())
    //runningtime.textContent = formatMinDiff(runningMinutes) + ` (${(runningMinutes/60).toFixed(2)}h)`
    ReactDOM.render(React.createElement(Timer,{start: runningMinutes * 60}), runningtime)
  }
})

