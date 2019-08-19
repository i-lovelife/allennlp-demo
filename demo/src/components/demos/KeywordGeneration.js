import React from 'react';
import HeatMap from '../HeatMap'
import { withRouter } from 'react-router-dom';
import Model from '../Model'
import OutputField from '../OutputField'
import { API_ROOT } from '../../api-config';
import { truncateText } from '../DemoInput'

const title = "Keyword Generation"

const description = (
  <span>
    a keyword generation task implemented with CGMH and GridBeamSearch
  </span>
  )

const taskModels = [
  {
    name: "GridBeamSearch",
    desc: "Hokamp, C., & Liu, Q. (2017)"
  },
  {
    name: "CGMH",
    desc: "Miao, N., Zhou, H., Mou, L., Yan, R., & Li, L. (2019, July)"
  }
]

const taskEndpoints = {
  "GridBeamSearch": "keyword_generation_gbs", // TODO: we should rename tha back-end model to reading-comprehension
  "CGMH": "keyword_generation_cgmh"
};
const modes = [
  {
    name: "hard",
    desc: "require every keywords appeare exactly in the sentence"
  },
  {
    name: "soft",
    desc: "every keywords or its synonym should appeare in the sentence"
  }
]
const fields = [
  {name: "keywords", label: "Keywords", type: "TEXT_INPUT",
   placeholder: `Keywords separated by space. e.g., "美国 政府"`},
  {name: "length", label: "Length", type: "TEXT_INPUT", placeholder:`max generated sentence length`},
  {name: "mode", label: "Mode", type: "RADIO", options: modes, optional: false},
  {name: "model", label: "Model", type: "RADIO", options: taskModels, optional: false}
]

const NoAnswer = () => {
  return (
    <OutputField label="Sentence">
      No sentence generated.
    </OutputField>
  )
}

const MultiSpanHighlight = ({original, highlightSpans, highlightStyles}) => {
  if(original && highlightSpans && highlightStyles) {
    // assumes spans are not overlapping and in order
    let curIndex = 0;
    let spanList = [];
    highlightSpans.forEach((s, sIndex) => {
      if(s[0] > curIndex){
        // add preceding non-highlighted span
        spanList.push(<span key={`${curIndex}_${s[0]}`}>{original.slice(curIndex, s[0])}</span>);
        curIndex = s[0];
      }
      // add highlighted span
      if(s[1] > curIndex) {
        spanList.push(<span key={`${curIndex}_${s[1]}`} className={highlightStyles[sIndex]}>{original.slice(curIndex, s[1])}</span>);
        curIndex = s[1];
      }
    });
    // add last non-highlighted span
    if(curIndex < original.length) {
      spanList.push(<span key={`${curIndex}_${original.length}`}>{original.slice(curIndex)}</span>);
    }
    return (
      <span>
        {spanList.map(s=> s)}
      </span>
    )
  }
  return null;
}


const AnswerByType = ({requestData, responseData}) => {
  if(requestData && responseData) {
    const { keywords, model } = requestData;
    const { generated_sentence, spans } = responseData;
    switch(model) {
      case "GridBeamSearch": {
        if(keywords && generated_sentence) {
          return (
            <section>
              <OutputField label="Generated sentence">
                <MultiSpanHighlight
                  original={generated_sentence}
                  highlightSpans={spans}
                  highlightStyles={spans.map(s => "highlight__answer")}/>
              </OutputField>
            </section>
          )
        }
        return NoAnswer();
      }
      default: { // old best_span_str path used by BiDAF model
        return NoAnswer();
      }
    }
  }
  return NoAnswer();
}

const Output = (props) => {
  return (
    <div className="model__content answer">
      <AnswerByType {...props}/>
    </div>
  )
}

const addSnippet = (example) => {
  return {...example, snippet: truncateText(example.keywords)}
}

const examples = [
  ['Short', [
        {
          keywords: "美国 政府"
        }
      ].map(addSnippet)]
]

const apiUrl = ({model}) => {
  const selectedModel = model || (taskModels[0] && taskModels[0].name);
  const endpoint = taskEndpoints[selectedModel]
  return `${API_ROOT}/predict/${endpoint}`
}

const modelProps = {apiUrl, title, description, fields, examples, Output}

export default withRouter(props => <Model {...props} {...modelProps}/>)
