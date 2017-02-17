import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router';
import CodeMirror from 'react-codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript';

const mapDispatchToProps = dispatch => (
  bindActionCreators({

  }, dispatch)
);

const mapStateToProps = state => ({
  instructorCode: state.lesson.instructorCode,
});

class TextEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      language: 'javascript',
      readOnly: true,
    };
  }

  render() {
    const { language, readOnly } = this.state;
    const options = {
      lineNumbers: true,
      mode: language,
      readOnly,
    };
    return (
      <div>
        <CodeMirror value={this.props.instructorCode} options={options} />
      </div>
    );
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(TextEditor));
