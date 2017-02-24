import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import style from './ShowAllAssignmentsStyle';

console.log(style);


const mapDispatchToProps = dispatch => (
  bindActionCreators({
  }, dispatch)
);

const mapStateToProps = state => ({
  assignments: state.assignment.assignments,
  position: state.titlebar.userInfo.position,
});

class ShowAllAssignments extends Component {
  constructor() {
    super();
    this.state = {
      showAssignment: false,
      assignment: null,
      assignmentId: null,
    };
    this.assignmentsExist = this.assignmentsExist.bind(this);
    this.showAssignment = this.showAssignment.bind(this);
    this.assignmentsList = this.assignmentsList.bind(this);
    this.clickedAssingmnet = this.clickedAssingmnet.bind(this);
    this.download = this.download.bind(this);
    this.submitWork = this.submitWork.bind(this);
    this.viewWork = this.viewWork.bind(this);
  }

  assignmentsExist() {
    return this.props.assignments;
  }

  showAssignment(e, assignmentId) {
    const idx = e.target.value;
    this.setState({ assignment: idx, assignmentId, showAssignment: true });
  }

  assignmentsList() {
    const { assignments, position } = this.props;
    if (this.assignmentsExist()) {
      return assignments.map((ele, idx) =>
        <li key={ele.id} style={style.padding}>
          <div style={style.main}>
            <div>
              {ele.instructions.slice(0, 49)}
            </div>
            <div style={style.column}>
              <button value={idx} onClick={e => this.showAssignment(e, ele.id)}>
              show Details
              </button>
              {
                position === 'Student' ?
                  <button value={ele.id} onClick={this.submitWork}>
                  submit work
                  </button> :
                  <button value={ele.id} onClick={this.viewWork}>
                    view submited work
                  </button>}
            </div>
          </div>
        </li>);
    } else {
      return <li>NO ASSIGNMENTS FOR THIS CLASS</li>;
    }
  }

  download(e, file) {
    window.open(`/api/download/getfile?file=${file}`);
  }

  clickedAssingmnet() {
    if (this.state.showAssignment) {
      const { assignment } = this.state;
      const { instructions, file, exercises, due } = this.props.assignments[assignment];
      return (
        <div style={style.column}>
          <div style={style.padding}>
            Instructions: {instructions}
          </div>
          <div style={style.padding}>
            {file ? <button onClick={e => this.download(e, file)}>Download file </button> : 'no file for this assignment'}
          </div>
          <div style={style.padding}>
            Exercises: {exercises}
          </div>
          <div style={style.padding}>
            Due: {due}
          </div>
        </div>);
    } else {
      return (<div>
        SELECT ASSIGNMENT
      </div>);
    }
  }

  submitWork(e) {
    const assignmentId = e.target.value;
    const { router } = this.props;
    let currentPath = router.getCurrentLocation().pathname;
    currentPath = currentPath.split('/');
    currentPath = currentPath.slice(1, 6).join('/');
    router.push(`/${currentPath}/submitWork/${assignmentId}`);
  }

  viewWork(e) {
    const assignmentId = e.target.value;
    const { router } = this.props;
    let currentPath = router.getCurrentLocation().pathname;
    currentPath = currentPath.split('/');
    currentPath = currentPath.slice(1, 6).join('/');
    router.push(`/${currentPath}/viewWork/${assignmentId}`);
  }

  render() {
    return (
      <div style={style.main}>
        <ul style={style.width, style.bullets}>
          {this.assignmentsList()}
        </ul>
        <div style={style.width}>
          {this.clickedAssingmnet()}
        </div>
      </div>
    );
  }
}

ShowAllAssignments.propTypes = {
  assignments: PropTypes.array,
  position: PropTypes.string,
  router: PropTypes.object,
};

ShowAllAssignments.defaultProps = {
  assignments: null,
  position: 'Student',
};

export default connect(mapStateToProps, mapDispatchToProps)(ShowAllAssignments);
