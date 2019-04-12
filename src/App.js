import React, { Component } from "react";
import Particles from "react-particles-js";
import Clarifai from "clarifai";
import Navigation from "./Components/Navigation/Navigation";
import SignIn from "./Components/SignIn/SignIn";
import Register from "./Components/Register/Register";
import FaceRecognition from "./Components/FaceRecognition/FaceRecognition";
import Logo from "./Components/Logo/Logo";
import Rank from "./Components/Rank/Rank";
import ImageLinkForm from "./Components/ImageLinkForm/ImageLinkForm";
import "./App.css";
import "tachyons";

const particlesOptions = {
  particles: {
    number: { value: 80, density: { enable: true, value_area: 800 } },
    color: { value: "#ffffff" },
    shape: {
      type: "circle",
      stroke: { width: 0, color: "#000000" },
      polygon: { nb_sides: 5 },
      image: { src: "img/github.svg", width: 100, height: 100 }
    },
    opacity: {
      value: 0.3,
      random: false,
      anim: { enable: false, speed: 0.5, opacity_min: 0.1, sync: false }
    },
    size: {
      value: 3,
      random: true,
      anim: { enable: false, speed: 20, size_min: 0.1, sync: false }
    },
    line_linked: {
      enable: true,
      distance: 150,
      color: "#ffffff",
      opacity: 0.4,
      width: 1
    },
    move: {
      enable: true,
      speed: 3,
      direction: "none",
      random: false,
      straight: false,
      out_mode: "out",
      bounce: false,
      attract: { enable: false, rotateX: 600, rotateY: 1200 }
    }
  },
  retina_detect: true
};

class App extends Component {
  constructor() {
    super();
    this.state = {
      input: "",
      imageUrl: "",
      box: {},
      route: "SignIn",
      isSignedIn: false,
      user: {
        id: "",
        name: "",
        entries: 0,
        joined: ""
      }
    };
  }

  // componentDidMount() {
  //   fetch("http://localhost:3000")
  //     .then(response => response.json())
  //     .then(receivedJSON => console.log(receivedJSON));
  // }

  calculateFaceLocation = response => {
    const clarifaiFace =
      response.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById("inputimage");
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - clarifaiFace.right_col * width,
      bottomRow: height - clarifaiFace.bottom_row * height
    };
  };

  displayFaceBox = box => {
    this.setState({
      box: box
    });
  };

  onInputChange = event => {
    this.setState({
      input: event.target.value
    });
  };

  onButtonSubmit = () => {
    this.setState({
      imageUrl: this.state.input
    });

    //Initialize Clarifai instance
    const app = new Clarifai.App({
      apiKey: "adc4336a7a8749eca7cdd95d594e1620"
    });

    //Send URL to Clarifai
    app.models
      .predict(Clarifai.FACE_DETECT_MODEL, this.state.input)
      .then(response => {
        this.displayFaceBox(this.calculateFaceLocation(response));
      })
      .catch(error => console.log(error));
  };

  onRouteChange = route => {
    if (route === "SignOut") {
      this.setState({ isSignedIn: false });
    } else if (route === "Home") {
      this.setState({ isSignedIn: true });
    }
    else if (route === "SignIn"){
      this.setState({ isSignedIn: false });
    }
    this.setState({
      route: route
    });
  };

  loadUser = data => {
    this.setState({
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined,
        password: data.password
      }
    });
  };

  render() {
    const { isSignedIn, imageUrl, route, box } = this.state;
    return (
      <div className="App">
        <Particles params={particlesOptions} className="particles" />
        <Navigation
          isSignedIn={isSignedIn}
          onRouteChange={this.onRouteChange}
        />

        {route === "Home" ? (
          //Returns Home
          <div>
            <Logo />
            <Rank />
            <ImageLinkForm
              onInputChange={this.onInputChange}
              onButtonSubmit={this.onButtonSubmit}
            />
            <FaceRecognition box={box} imageUrl={imageUrl} />
          </div>
        ) : route === "SignIn" ? (
          //Returns SignIn
          <SignIn onRouteChange={this.onRouteChange} />
        ) : (
          //Returns Register
          <Register
            loadUser={this.loadUser}
            onRouteChange={this.onRouteChange}
          />
        )}
      </div>
    );
  }
}

export default App;