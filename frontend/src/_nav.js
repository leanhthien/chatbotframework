let baseOnRole = (roleId)=>{
  let routes = {items: []}
  routes.items.push(
    {
      name: 'Courses',
      url: '/courses',
      icon: 'icon-speedometer'
    }
  );
  routes.items.push(
    {
      name: 'ChangePass',
      url: '/password/change',
      icon: 'icon-user-follow'
    }
  );
  routes.items.push(
    {
      name: 'Forum',
      url: '/forum/issue',
      icon: 'icon-user-follow'
    }
  );
  routes.items.push(
    {
      name: 'Issue',
      url: '/forum/createIssue',
      icon: 'icon-user-follow'
    }
  );
  if(roleId === 3){
    routes.items.push(
      {
        name: 'Assignees',
        url: '/assignees',
        icon: 'icon-pie-chart'
      }
    );
    routes.items.push(
      {
        name: 'TA',
        url: '/ta/create',
        icon: 'icon-basket-loaded'
      }
    );
    routes.items.push(
      {
        name: 'Create Intent',
        url: '/forum/createIntent',
        icon: 'icon-user-follow'
      }
    );
  }
  else if(roleId === 3 || roleId === 2){
  }
  else if(roleId === 1){
    routes.items.push(
      {
        name: 'Results',
        url: '/results',
        icon: 'icon-speech'
      }
    );
  }
  return routes;
}

export default baseOnRole