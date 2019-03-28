import React from 'react';
import DefaultLayout from './containers/DefaultLayout';

const Dashboard = React.lazy(() => import('./views/Dashboard'));
const Student = React.lazy(() => import('./views/Student/Student'));
const Teacher = React.lazy(() => import('./views/Teacher/Teacher'));
const Exercise = React.lazy(() => import('./views/Exercises/Exercise'));
const Course = React.lazy(() => import('./views/Courses/Course'));
const CourseCreate = React.lazy(() => import('./views/Courses/Create'));
const CourseUpdate = React.lazy(() => import('./views/Courses/Update'));
const ExerciseCreate = React.lazy(() => import('./views/Exercises/Create'));
const ExerciseUpdate = React.lazy(() => import('./views/Exercises/Update'));
const ExerciseResult = React.lazy(() => import('./views/Exercises/Results'));
const ExerciseResultByGroup = React.lazy(() => import('./views/Exercises/ResultByGroup'))
const Question = React.lazy(() => import('./views/Questions/Question'));
const QuestionCreate = React.lazy(() => import('./views/Questions/Create'));
const QuestionUpdate = React.lazy(() => import('./views/Questions/Update'));
const QuestionReview = React.lazy(() => import('./views/Questions/Review'));
const Assignee = React.lazy(() => import('./views/Assignees/Assignee'));
const CreateTA = React.lazy(() => import('./views/Teacher/Register'));
const ChangePass = React.lazy(() => import('./views/Password/Change'));
const Group = React.lazy(() => import('./views/Groups/Group'));
const GroupCreate = React.lazy(() => import('./views/Groups/Create'));
const GroupUpdate = React.lazy(() => import('./views/Groups/Update'));
const GroupAssign = React.lazy(() => import('./views/Groups/Assign'));
const Result = React.lazy(() => import('./views/Student/Result'));
const Permission = React.lazy(() => import('./views/Teacher/Permission'));
const Permissions = React.lazy(() => import('./views/Teacher/PermissionMany'));
const Issue = React.lazy(() => import('./views/Forum/Issue'));
const ReplyIssue = React.lazy(() => import('./views/Forum/ReplyIssue'));
const Intent = React.lazy(() => import('./views/Forum/Intent'));
const CreateIntent = React.lazy(() => import('./views/Forum/CreateIntent'));

// https://github.com/ReactTraining/react-router/tree/master/packages/react-router-config
const routes = [
  { path: '/teacher', exact: true, name: 'Teacher', component: Teacher },
  { path: '/student', exact: true, name: 'Student', component: Student },
  { path: '/', exact: true, name: 'Home', component: DefaultLayout },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/courses/:courseId/exercises/:exerciseId/questions/:id/permission', name: 'Permission', component: Permission },
  { path: '/courses/:id/exercises/:exerciseId/questions/create', name: 'QuestionCreate', component: QuestionCreate },
  { path: '/courses/:id/exercises/:exerciseId/questions/update/:questionId', name: 'QuestionUpdate', component: QuestionUpdate },
  { path: '/courses/:id/exercises/:exerciseId/questions/:questionId/review', name: 'QuestionReview', component: QuestionReview },
  { path: '/courses/:courseId/exercises/:exerciseId/questions/permissions', name: 'Permissions', component: Permissions },
  { path: '/courses/:id/exercises/:exerciseId/questions', name: 'Question', component: Question },
  { path: '/courses/:id/exercises/resultgroup/:exerciseId/:groupId', name: 'ResultByGroup', component: ExerciseResultByGroup },
  { path: '/courses/:id/exercises/result/:exerciseId', name: 'Result', component: ExerciseResult },
  { path: '/courses/:id/exercises/create', name: 'ExerciseCreate', component: ExerciseCreate },
  { path: '/courses/:id/exercises/update/:exerciseId', name: 'ExerciseUpdate', component: ExerciseUpdate },
  { path: '/courses/:id/exercises', name: 'Exercise', component: Exercise },
  { path: '/assignees', exact: true, name: 'Assignees', component: Assignee },
  { path: '/ta/create', exact: true, name: 'TA', component: CreateTA },
  { path: '/password/change', exact: true, name: 'ChangePass', component: ChangePass },
  { path: '/courses/:id/teacher', name: 'Teacher', component: Teacher },
  { path: '/courses/:id/groups/create', name: 'GroupCreate', component: GroupCreate },
  { path: '/courses/:id/groups/update/:groupId', name: 'GroupUpdate', component: GroupUpdate },
  { path: '/courses/:id/groups/assign/:groupId', name: 'GroupAssign', component: GroupAssign },
  { path: '/courses/:courseId/groups/:groupId/exercises/:exerciseId/permissions', name: 'Permissions', component: Permissions },
  { path: '/courses/:id/groups/:groupId/exercise', name: 'Choose Exercise', component: Exercise },
  { path: '/courses/:id/groups', name: 'Groups', component: Group },
  { path: '/courses/create', name: 'CourseCreate', component: CourseCreate },
  { path: '/courses/update/:id', name: 'CourseUpdate', component: CourseUpdate },
  { path: '/courses', name: 'Courses', component: Course },
  { path: '/results', name: 'Results', component: Result },
  { path: '/forum/issue', name: 'Issue', component: Issue },
  { path: '/forum/allIssues', name: 'All Issues', component: Issue },
  { path: '/forum/replyIssues', name: 'Reply Issue', component: ReplyIssue },
  { path: '/forum/intent', name: 'Intent', component: Intent },
  { path: '/forum/createIntent', name: 'Create Intent', component: CreateIntent },
 

];

export default routes;
