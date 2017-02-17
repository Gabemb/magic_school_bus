import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { DisplayClasses, LessonDropDown, MakeLesson } from '../../components';
import fileWatcher from '../../utils/fileWatcher';
import style from './WatchLessonStyles';

const mapStateToProps = state => ({
  folderPath: state.lesson.folderPath,
  classname: state.lesson.classname,
  lessonId: state.lesson.lessonId,
  lessonname: state.lesson.lessonname,
  classCode: state.lesson.classCode,
});

class WatchLesson extends Component {
  constructor() {
    super();
    this.state = {
      isMakeLessonVisible: false,
      isWatchingFiles: false,
    };
    this.startWatchingFiles = this.startWatchingFiles.bind(this);
    this.stopWatchingFiles = this.stopWatchingFiles.bind(this);
    this.readyToStartLesson = this.readyToStartLesson.bind(this);
    this.showMakeLessonForm = this.showMakeLessonForm.bind(this);
  }

  startWatchingFiles(e) {
    e.preventDefault();
    const { folderPath, classname, lessonId, lessonname, classCode } = this.props;
    console.log(this.props);
    fileWatcher("/Users/Joshua/Desktop/projects/test_watching", "Chemistry 123", 1);
    this.setState({ isWatchingFiles: true });
  }
  stopWatchingFiles(e) {
    e.preventDefault();
    this.setState({ isWatchingFiles: false });
  }

  readyToStartLesson() {
    // make sure all required info is available before starting lesson
    const { folderPath, classname, lessonId } = this.props;
    return !(folderPath && classname && lessonId);
  }

  showMakeLessonForm() {
    this.setState(prevState => ({
      isMakeLessonVisible: !prevState.isMakeLessonVisible,
    }));
  }

  render() {
    const { folderPath } = this.props;
    const { isMakeLessonVisible, isWatchingFiles } = this.state;
    return (
      <div style={style.lesson}>
        <DisplayClasses />
        <div>
          <div>
            <LessonDropDown />
            <button onClick={this.showMakeLessonForm}>
              {isMakeLessonVisible ? 'x' : '+'}
            </button>
          </div>
          {isMakeLessonVisible && <MakeLesson />}
          {folderPath
            ? <p>You are watching folder: {folderPath}</p>
            : <p>You are not watching any files</p>
          }
          <button
            onClick={this.startWatchingFiles}
          >
            Start Lesson
          </button>
          <button
            onClick={this.stopWatchingFiles}
            disabled={!isWatchingFiles}
          >
            Stop Lesson
          </button>
        </div>
      </div>
    );
  }
}

WatchLesson.propTypes = {
  folderPath: PropTypes.string,
  classname: PropTypes.string,
  lessonId: PropTypes.string,
  lessonname: PropTypes.string,
  classCode: PropTypes.string,
};

WatchLesson.defaultProps = {
  folderPath: '',
  classname: '',
  lessonId: '',
  lessonname: '',
  classCode: '',
};

export default connect(mapStateToProps)(WatchLesson);
