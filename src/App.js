import './App.css';
import React, {Component} from "react";
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';
import Navigation from './components/Navigation/Navigation';
import Logo from "./components/Logo/Logo";
import ImageLinkForm from "./components/ImageLinkForm/ImageLinkForm";
import Rank from "./components/Rank/Rank";
import FaceRecognition from "./components/FaceRecognition/FaceRecognition";
import Signin from './components/Singin/Signin';
import Register from './components/Register/Register';

const app = new Clarifai.App({
  apiKey: "3ddd157b3e9148e5a93c0ce13cac2ba5"
})

const partcilesOptions = {  
    particles: {
      number:{
        value:30,
        density: {
          enable:true,
          value_area: 800
        }
      }
    }
}

const initialState = {
  input:'',
  imageUrl:'',
  box:{},
  route: 'signin',
  isSignedIn: false,
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: ''
  }
}

class App extends Component {
  constructor(){
      super();
      this.state = initialState;         
    }
  

  loadUser = (data) => {
    this.setState({user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined,
    }})
  }
  
  calculateFaceLocation = (data) => {
    const clarifaiFace = 
        data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  displayFaceBox = (box) => {
    console.log(box);
    this.setState({ box : box })
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input})
    app.models
      .predict(
        Clarifai.FACE_DETECT_MODEL,
        this.state.input)
        .then(
          response => {
            if (response) {
              fetch("http://localhost:3003/image",{
                method: 'put',
                headers: {'content-type' : 'application/json'},
                body: JSON.stringify({
                    id: this.state.user.id,                    
                })
              })
              .then (response => response.json())
              .then (count => {
                //console.log("Fornt end " + count.entries);
                this.setState(Object.assign(this.state.user,
                  { entries: count.entries}))
              })
            }
          this.displayFaceBox(this.calculateFaceLocation(response))
        })    
        .catch(err => console.log(err));  
  }

  onRouteChange = (route) => {
    if(route === 'signout'){
      this.setState(initialState)
    }else if(route === 'home'){ 
      this.setState({ isSignedIn:true });
    }
    this.setState({ route: route });
  }

  render(){
    const {isSignedIn, route, box, imageUrl } = this.state;
    return(
      <div className="App">
        <Particles className="particles"
          params={partcilesOptions}              
        />
        <Navigation isSignedIn={isSignedIn} 
            onRouteChange = {this.onRouteChange}/>
        { route === 'home'
          ? <div>
              <Logo/>
              <Rank name={this.state.user.name} 
                    entries={this.state.user.entries}/>
              <ImageLinkForm  
                    onInputChange={this.onInputChange} 
                    onButtonSubmit={this.onButtonSubmit} />
              <FaceRecognition box={box} 
                          imageUrl={imageUrl}/>
            </div>
          : (
            route === "signin"
            ? <Signin loadUser={this.loadUser} 
                      onRouteChange={this.onRouteChange}/>
            : <Register loadUser={this.loadUser} 
                        onRouteChange={this.onRouteChange}/>
          )           
          
        }
      </div>
    )
  }
  }

export default App;
