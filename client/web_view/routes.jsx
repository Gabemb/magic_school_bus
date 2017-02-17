import React from 'react';
import { Route, IndexRoute } from 'react-router';
import { App, Modal, LoginOrSignUp, HomePage, StudentOrTeacher, Dashboard, Lesson, Overview, ViewInstructorCode, AddAssignment, AddLesson } from './containers';
import { getTitlebarInfo } from '../redux/titlebar';
import { enterGetLessons } from '../redux/lesson';

export default (
  <Route component={App} >
    <Route path="/" component={HomePage}>
      <Route component={Modal}>
        <Route path="login" component={LoginOrSignUp} />
        <Route path="student-or-teacher" component={StudentOrTeacher} />
      </Route>
    </Route>
    <Route path="/instructorcode/*" component={ViewInstructorCode} />
    <Route path="dashboard/:user/:currentClassCode" onEnter={getTitlebarInfo} component={Dashboard}>
      <IndexRoute component={Overview} />
      <Route path="lesson/:classId" component={AddLesson} />
      <Route path=":lesson" component={Lesson} />
      <Route path="assignment/:classId" component={AddAssignment} onEnter={enterGetLessons} />
    </Route>
  </Route>
);

