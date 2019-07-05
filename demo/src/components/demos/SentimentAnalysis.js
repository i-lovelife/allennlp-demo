import React from 'react';
import { API_ROOT } from '../../api-config';
import { withRouter } from 'react-router-dom';
import Model from '../Model'
import { Accordion } from 'react-accessible-accordion';
import OutputField from '../OutputField'
import SaliencyComponent from '../Saliency'
import InputReductionComponent from '../InputReduction'
import HotflipComponent from '../Hotflip'

// APIs. These link to the functions in app.py
const apiUrl = () => `${API_ROOT}/predict/sentiment-analysis`
const hotflipUrl = () => `${API_ROOT}/hotflip/sentiment-analysis`
const inputReductionUrl = () => `${API_ROOT}/input-reduction/sentiment-analysis`
const apiUrlInterpret = ({interpreter}) => `${API_ROOT}/interpret/sentiment-analysis/${interpreter}`

// title of the page
const title = "Sentiment Analysis"

// The interpreters
const GRAD_INTERPRETER = 'simple_gradients_interpreter'
const IG_INTERPRETER = 'integrated_gradients_interpreter'
const SG_INTERPRETER = 'smooth_gradient_interpreter'

// Text shown in the UI
const description = (
  <span> Sentiment Analysis predicts whether an input is positive or negative. The model is a simple LSTM using GloVe embeddings that is trained on the binary classification setting of the <a href="https://nlp.stanford.edu/sentiment/treebank.html">Stanford Sentiment Treebank</a>. It achieves about 87% accuracy on the test set.</span>
);
const descriptionEllipsed = (  
  <span> Sentiment Analysis predicts whether an input is positive or negative… </span>
);

// Input fields to the model.
const fields = [
  {name: "sentence", label: "Input", type: "TEXT_INPUT",
   placeholder: 'E.g. "amazing movie"'}
]
  
// What is rendered as Output when the user hits buttons on the demo.
const Output = ({ responseData,requestData, interpretData, interpretModel, inputReductionData, hotflipData, reduceInput, hotflipInput}) => {  
    var prediction = "";            
    if (responseData['probs'][1] < responseData['probs'][0]){  // if probability(negative_class) < probability(positive_class)  
        prediction = "Positive";
    }
    else{
      prediction = "Negative";
    }
  
  var t = requestData;                    
  var tokens = t['sentence'].split(' '); // this model expects space-separated inputs
  var task = "sentiment";

  // The "Answer" output field has the models predictions. The other output fields are the reusable HTML/JavaScript for the interpretation methods.
  return (
    <div className="model__content answer">        
      <OutputField label="Answer"> 
      {prediction}
      </OutputField>        

    <OutputField>  
    <Accordion accordion={false}>        
        <SaliencyComponent interpretData={interpretData} input1_tokens={tokens}  interpretModel = {interpretModel} requestData = {requestData} interpreter={GRAD_INTERPRETER}/>
        <SaliencyComponent interpretData={interpretData} input1_tokens={tokens}  interpretModel = {interpretModel} requestData = {requestData} interpreter={IG_INTERPRETER}/>
        <SaliencyComponent interpretData={interpretData} input1_tokens={tokens} interpretModel = {interpretModel} requestData = {requestData} interpreter={SG_INTERPRETER}/>
        <InputReductionComponent inputReductionData={inputReductionData} reduceInput={reduceInput} requestDataObject={requestData}/>                              
        <HotflipComponent hotflipData={hotflipData} hotflipInput={hotflipInput} requestDataObject={requestData} task={task} />                             
    </Accordion>
    </OutputField>
  </div>
  );
}

// Examples the user can choose from in the demo
const examples = [
  { sentence: "a very well-made, funny and entertaining picture." },
  { sentence: "so unremittingly awful that labeling it a dog probably constitutes cruelty to canines" },  
  { sentence: "all the amped up tony hawk style stunts and thrashing rap-metal can't disguise the fact that, really, we've been here, done that."},  
  { sentence: "visually imaginative, thematically instructive and thoroughly delightful, it takes us on a roller-coaster ride from innocence to experience without even a hint of that typical kiddie-flick sentimentality."}
]

// A call to a pre-existing model component that handles all of the inputs and outputs. We just need to pass it the things we've already defined as props:
const modelProps = {apiUrl, apiUrlInterpret, inputReductionUrl, hotflipUrl,title, description, descriptionEllipsed, fields, examples, Output}
export default withRouter(props => <Model {...props} {...modelProps}/>)