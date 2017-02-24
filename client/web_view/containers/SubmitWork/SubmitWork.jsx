import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import FileInput from 'react-file-input';
import { AsyncPostWork } from '../../../redux/work';


const mapDispatchToProps = dispatch => (
  bindActionCreators({
    AsyncPostWork,
  }, dispatch)
);

const mapStateToProps = (state, ownprops) => ({
  assignmentId: ownprops.params.assignmentId,
  userId: ownprops.params.user,
});

class SubmitWork extends Component {
  constructor() {
    super();
    this.state = {
      zipFile: null,
      cantSubmit: true,
    };
    this.handelChange = this.handelChange.bind(this);
    this.submit = this.submit.bind(this);
  }

  handelChange(e) {
    this.setState({ zipFile: e.target.files[0], cantSubmit: false });
  }

  submit(e) {
    e.preventDefault();
    // push data into FormData because files must be sent in FormData
    const { zipFile } = this.state;
    const { assignmentId, userId } = this.props;
    const data = new FormData();
    data.append('zipFile', zipFile, zipFile.name);
    data.append('assignmentId', assignmentId);
    data.append('userId', userId);
    this.props.AsyncPostWork(data);
  }

  render() {
    return (
      <div>
        <form onSubmit={this.submit}>
          <FileInput
            name="zipFile"
            accept=".zip"
            placeholder="zip file"
            className="inputClass"
            onChange={this.handelChange}
          />
          <button disabled={this.state.cantSubmit}>Submit Work</button>
        </form>
      </div>
    );
  }
}

SubmitWork.propTypes = {
  assignmentId: PropTypes.string,
  AsyncPostWork: PropTypes.func.isRequired,
};

SubmitWork.defaultProps = {
  assignmentId: null,
};

export default connect(mapStateToProps, mapDispatchToProps)(SubmitWork);
