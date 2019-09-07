import React, { useState, useEffect, useRef } from 'react';
import * as mobilenet from '@tensorflow-models/mobilenet';
import VegaLite from 'react-vega-lite';

import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import 'bootstrap/dist/css/bootstrap.min.css';

import './App.css';

function App() {

  const videoEl = useRef(null);
  const [predictions, setPredictions] = useState([]);
  const [model, setModle] = useState(null);

  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode: 'environment'}})
      .then(stream => {
        let video = videoEl.current;
        video.srcObject = stream;
        window.stream = stream;
        video.play();
      });
    };

    mobilenet.load().then(loaded => setModle(loaded));
  }, []);

  useEffect(() => {

    const mediaElement = document.getElementById('videoPlayer');
    
    if (model&&videoEl) {
      const interval = setInterval(() => {
        model.classify(mediaElement, 3)
        .then(results => results.map(prediction => ({className: prediction.className.split(', ')[0], probability: prediction.probability})))
        .then(cleanArray => setPredictions(JSON.stringify(cleanArray)))
      }, 250);
      return () => clearInterval(interval);
    }

  }, [model, videoEl]);

  return (
    <div className="App">
      <Container>
        <hr/>
          <h1>Image Classification Demo</h1>
        <hr/>
        <Row>
          <Col>
            <video id="videoPlayer" ref={videoEl} height={250} autoplay playsinline/> 
            <VegaLite spec={vegaLiteSpec} data={{"values": predictions}} />
          </Col>
        </Row>
        <hr/>
        {model ? <p>Using Tensorflow.js pretrained <a href="https://github.com/tensorflow/tfjs-models/tree/master/mobilenet">MobileNet model</a></p>: <p>loading model...</p>}
      </Container>
    </div>
  );
}


const vegaLiteSpec = {
  usermeta: {embedOptions: {actions: false}},
  width: 400,
  height:200,
  autosize: {type: "none", contains: "content"},
  padding: {left:100, right:10, bottom:50, top:5},
  mark: "bar",
  encoding: {
    "x": {
      "field": "probability", 
      "type": "quantitative", 
      "scale": {"domain": [0,1]},
      axis: {title: "Probability", format: ".0%", tickCount:5}
    },
    "y": {"field": "className", "type": "ordinal", "sort": "-x", title:null}
  }
}

export default App;