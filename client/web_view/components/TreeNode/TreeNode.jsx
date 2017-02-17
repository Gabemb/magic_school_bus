import React, { Component, PropTypes } from 'react';
import { withRouter } from 'react-router';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import shortid from 'shortid';
import { AsyncGetInstructorCode } from '../../../redux/lesson';

const mapDispatchToProps = dispatch => (
  bindActionCreators({
    AsyncGetInstructorCode,
  }, dispatch)
);

const mapStateToProps = state => ({
  state,
});

class TreeNode extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      currentPath: '/',
    };
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.setState(prevState => ({
      visible: !prevState.visible,
    }));
    if (this.props.node.path) {
      this.props.AsyncGetInstructorCode(this.props.node.path, 'Chemistry 123', 'Making things explode is science and is rad');
      this.props.router.push(`/instructorcode/${this.props.node.path}`);
    }
  }

  render() {
    let childNodes;

    if (this.props.node.childNodes != null) {
      childNodes = this.props.node.childNodes.map((node) => {
        if (node.path) {
          return <li key={shortid.generate()} onClick={this.handleClick}><TreeNode AsyncGetInstructorCode={this.props.AsyncGetInstructorCode} router={this.props.router} node={node} /></li>;
        } else {
          return <li key={shortid.generate()}><TreeNode AsyncGetInstructorCode={this.props.AsyncGetInstructorCode} router={this.props.router} node={node} /></li>; 
        }
      });
    }

    let style;
    if (!this.state.visible) {
      style = { display: 'none' };
    }
    return (
      <div>
        <h5 onClick={this.handleClick}>
          {this.props.node.title}
        </h5>
        <ul style={style}>
          {childNodes}
        </ul>
      </div>
    );
  }
}

TreeNode.propTypes = {
  node: PropTypes.object.isRequired,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(TreeNode));
