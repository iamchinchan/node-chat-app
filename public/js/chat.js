const socket = io(); 

//Elements
const $messageForm = document.querySelector("#message-form");
const $messageFormInput =  $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");

//Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

//options
const {username,room} = Qs.parse(location.search,{ ignoreQueryPrefix:true})
// console.log(username);


const autoscroll =()=>{
  //New message element
  const $newMessage = $messages.lastElementChild;

  //Height of new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight+newMessageMargin;
  
  //visible height
  const visibleHeight = $messages.offsetHeight;

  //Height of messages container
  const containerHeight= $messages.scrollHeight;

  //how far have i scrolled
  const scrollOffSet = $messages.scrollTop+visibleHeight;

  // console.log(scrollOffSet);
  // console.log(containerHeight-newMessageHeight );
  if(containerHeight-newMessageHeight <= scrollOffSet){
    $messages.scrollTop = $messages.scrollHeight;
  }


  // console.log(newMessageHeight);
}

socket.on('message',(message)=>{
  console.log(message);
  const html = Mustache.render(messageTemplate,{
    usrname:message.username,
    message:message.text,
    createdAt:moment(message.createdAt).format("h:mm:ss a"),
  });
  $messages.insertAdjacentHTML('beforeend',html);
  autoscroll();
})

socket.on('locationMessage',(position)=>{
  console.log(location);
  const html = Mustache.render(locationTemplate,{
    usrname:position.username,
    location:position.location,
    createdAt:moment(position.createdAt).format('h:mm:ss a')
  });
  $messages.insertAdjacentHTML('beforeend',html);
  autoscroll();
})

socket.on('roomData',({room,users})=>{
  const html = Mustache.render(sidebarTemplate,{
    room,
    users
  });
  document.querySelector("#sidebar").innerHTML = html;
})

$messageForm.addEventListener('submit',(e)=>{
  e.preventDefault();

  $messageFormButton.setAttribute('disabled','disabled');

  const message = e.target.elements.message.value;
  // const message  = document.querySelector('input').value;
  socket.emit('sendMessage',message,(error)=>{

    $messageFormButton.removeAttribute('disabled');
    $messageFormInput.value='';
    $messageFormInput.focus();

    if(error){
      return console.log(error);
    }
    console.log("Message delievered!");
  });
})

$sendLocationButton.addEventListener('click',()=>{
  if(!navigator.geolocation){
    return alert('Geolocation is not supported by your browser!');
  }
    $sendLocationButton.setAttribute('disabled','disabled');
    navigator.geolocation.getCurrentPosition((position)=>{
    socket.emit('sendLocation',{
      latitude:position.coords.latitude,
      longitude:position.coords.longitude,
    },(error)=>{
      if(error){
        return alert(error);
      }
      $sendLocationButton.removeAttribute('disabled');
      console.log("Location Shared!");
    });
      

    })
  
})

socket.emit('join',{username,room},(error)=>{
if(error){
alert(error);
location.href="/";
}
console.log("successfully joined room!");
});
