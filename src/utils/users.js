const users = [] ;

// addser, removeUser, getUser , getUsersInRoom

const addUser=({id, username, room})=>{
  //clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  //validate the data
  if(!username || !room){
    return {
      error:"Username and room are required!",
    }
  }
  //else

  //check for existing user..
  const existingUser = users.find((user)=>{
    return(user.room === room && user.username === username);
  })

  //validate username
  if(existingUser){
    return {
      error:"Username is in use! try something else",
    }
  }

  //user is ready to be stored and join a room 

    const user={id,username,room}
    users.push(user);
    return{ user}
}

const removeUser =(id)=>{
  const index = users.findIndex(user=> user.id === id)
  if(index !==-1){
    //found a match
    return users.splice(index,1)[0];
  }
}

const getUser = (id)=>{
  return (users.find((user)=>user.id===id));
}

const getUsersInRoom =(room)=>{
  return( users.filter((user)=>{
    room = room.trim().toLowerCase();
    return(user.room==room);
  }));
}

module.exports={
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
}