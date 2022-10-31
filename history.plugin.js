
(function() { "use strict"
const GITHUB_PAGE = "https://github.com/rbertus2000/sd-ui-plugins"
const VERSION = "1.0.2";
const ID_PREFIX = "history-plugin";
const GITHUB_ID = "rbertus2000-plugins"
console.log('%s Version: %s', ID_PREFIX, VERSION);

const style = document.createElement('style');
style.textContent = `
  #${ID_PREFIX}-historyContainer {
    background: var(--background-color2);
    border: 1px solid var(--background-color3);
    border-radius: 7px;
    padding: 5px;
    margin: 5px;
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.15), 0 6px 20px 0 rgba(0, 0, 0, 0.15);
    max-width: 30%;
    max-height: 800px;
    display:none;
    overflow:hidden;
    overflow-y: hidden;
  }
  #${ID_PREFIX}-historyItemsContainer {
    overflow:hidden;
    overflow-y: scroll;
    max-height: 760px;
    padding: 5px;
    margin: 5px;
  }
  .${ID_PREFIX}-history-item {
    color: var(--text-color);
    padding: 5px;
    cursor: pointer;
    border: 1px solid black;
    margin: 2px;
    border-radius: 3px;
   /* background-color: hsl(var(--accent-hue), 100%, var(--accent-lightness)); */
  }
  .${ID_PREFIX}-history-deletebutton {
    float: right;
    background: rgb(132, 8, 0);
    border: 1px solid rgb(122, 29, 0);
    color: rgb(255, 221, 255);
    padding: 3pt 6pt;
    border-radius: 5px;
    font-size: 10pt;
  }
  .${ID_PREFIX}-history-deletebutton:hover {
    background: rgb(177, 27, 0);
    cursor: pointer;
  }
  .${ID_PREFIX}-history-closebutton {
    background: rgb(132, 8, 0);
    border: 1px solid rgb(122, 29, 0);
    color: rgb(255, 221, 255);
    padding: 3pt 6pt;
    border-radius: 5px;
    font-size: 10pt;
    text-align: center; 
    width: 70px;
  }
  .${ID_PREFIX}-history-closebutton:hover {
    background: rgb(177, 27, 0);
    cursor: pointer;
  }
  .${ID_PREFIX}-history-item:hover {
    background: var(--accent-color-hover);
  }
  
  .${ID_PREFIX}-history-prompt {
  font-size: 11pt;
  }
  .${ID_PREFIX}-history-infos {
  font-size: 11pt;
  }
  .${ID_PREFIX}-history-btn {
    margin: 5px 5px 5px 0px;
  }
  @media only screen and (max-device-width: 600px) {
    #${ID_PREFIX}-historyContainer {
        max-width: 95%;
    }
  }
`;

    document.head.append(style);

    (function() {
        const links = document.getElementById("community-links");
        if (links && !document.getElementById(`${GITHUB_ID}-link`)) {
            // Add link to plugin repo.
            const pluginLink = document.createElement('li');
            pluginLink.innerHTML = `<a id="${GITHUB_ID}-link" href="${GITHUB_PAGE}" target="_blank"><i class="fa-solid fa-code-merge"></i> Rob's Plugins on GitHub</a>`;
            links.appendChild(pluginLink);
        }
    })();
 
    const editorInputs = document.getElementById("editor-inputs");
    
    const buttonsContainer = document.createElement('div');
    buttonsContainer.id = `${ID_PREFIX}-historyButtonContainer`;
    editorInputs.appendChild(buttonsContainer);
     
    
    
    
        
     
    function setSetup(stateObject) {
        promptField.value = stateObject.prompt;
        seedField.value = stateObject.seed;
        seedField.disabled = stateObject.random;
        randomSeedField.checked = stateObject.random;
        stableDiffusionModelField.value = stateObject.model;
        samplerField.value = stateObject.sampler;
        widthField.value = stateObject.width;
        heightField.value = stateObject.height;
        numInferenceStepsField.value = stateObject.steps;
        guidanceScaleField.value = stateObject.guidance;
        outputFormatField.value = stateObject.format;
        negativePromptField.value = stateObject.negative;
        streamImageProgressField.checked = stateObject.preview;
        useFaceCorrectionField.checked = stateObject.facefix;
        useUpscalingField.checked = stateObject.useUpscaling;
        upscaleModelField.value = stateObject.upscale;
        upscaleModelField.disabled = !stateObject.useUpscaling;
        guidanceScaleSlider.value = stateObject.guidance * 10;
        document.getElementById('prompt').dispatchEvent(new Event('input', {bubbles:true}));
    }
     
    function getSetup() {
      let prompts = promptField.value;
			if (prompts.trim() === '') {
				return [''];
			}
		
			prompts = prompts.split('\n');
			prompts = prompts.map(prompt => prompt.trim());
			prompts = prompts.filter(prompt => prompt !== '');
			if (activeTags.length > 0) {
				const promptTags = activeTags.map(x => x.name).join(", ");
				prompts = prompts.map((prompt) => `${prompt}, ${promptTags}`);
				}
        let stateObject = {
            prompt: prompts,
            seed: seedField.value,
            random: randomSeedField.checked,
            model: stableDiffusionModelField.value,
            sampler: samplerField.value,
            width: widthField.value,
            height: heightField.value,
            steps: numInferenceStepsField.value,
            guidance: guidanceScaleField.value,
            format: outputFormatField.value,
            negative: negativePromptField.value,
            preview: streamImageProgressField.checked,
            facefix: useFaceCorrectionField.checked,
            useUpscaling: useUpscalingField.checked,
            upscale: upscaleModelField.value,
        };
        return stateObject;
        //stateCodeField.value = btoa(JSON.stringify(stateObject));
    }
     
    
     
    const buildHistoryItem = (timestamp, item) => {
      return `
      <div class="${ID_PREFIX}-history-datetime">${new Date(timestamp).toLocaleString()}</div>
      <div class="${ID_PREFIX}-history-prompt">${item.prompt}</div>
      <div class="${ID_PREFIX}-history-infos">
        <span>negative: '${item.negative}'</span><br/>
        <span>sampler: '${item.sampler}'</span> <span>w: '${item.width}'</span> <span>h: '${item.height}'</span> <span>steps: '${item.steps}'</span> <span>scale: '${item.guidance}'</span> <span>model: '${item.model}'</span><br/>
        <span>facefix: '${item.facefix}'</span> <span>upscale: '${item.useUpscaling}'</span> <span>seed: ${item.random ? 'random' : item.seed}</span>
      </div>
      
      `;
    }
     
    const loadHistory = () => {
     
      let historyItemsContainer = document.getElementById(`${ID_PREFIX}-historyItemsContainer`);
      historyItemsContainer.innerHTML = "";
      let historyItems = JSON.parse(localStorage.getItem(`${ID_PREFIX}-history`));
      console.log(historyItems);
      let currentItem = null;
      let deletebutton = null;
      for (let item of historyItems) {
        currentItem = document.createElement('div');
        currentItem.id = `${ID_PREFIX}-history-item-`+item.id;
        currentItem.classList.add(`${ID_PREFIX}-history-item`);
        currentItem.innerHTML = buildHistoryItem(item.timestamp, item.setup);
        currentItem.addEventListener('click', () => {setSetup(item.setup);});
        deletebutton = document.createElement('div');
        deletebutton.id = `${ID_PREFIX}-history-deletebutton-`+item.id;
        deletebutton.classList.add(`${ID_PREFIX}-history-deletebutton`);
        deletebutton.innerHTML = `<i class="fa-solid fa-trash"></i> Remove`;
        deletebutton.addEventListener('click', (e) => {
            e.preventDefault();
            if(confirm("Are you sure you want to delete this history item?")) {
              for(let i = 0; i < historyItems.length; i++){
                  if (historyItems[i].id === item.id) {
                    historyItems.splice(i, 1);
                    break;
                  }
              }
              localStorage.setItem(`${ID_PREFIX}-history`, JSON.stringify(historyItems));
              loadHistory();
            }
          });
                    historyItemsContainer.appendChild(deletebutton);
                    historyItemsContainer.appendChild(currentItem);
                    
      }
    
    };
     
    const saveHistoryItem = () => {
      let currentHistory = JSON.parse(localStorage.getItem(`${ID_PREFIX}-history`));
      if (currentHistory.length > 0) {
        let lastItem = currentHistory.at(0);
        let newId = lastItem.id + 1;
        let newItem = {
          id: newId,
          timestamp: Date.now(),
          setup: getSetup()
        };
        let a = {...lastItem.setup};
        let b = {...newItem.setup};
        if (JSON.stringify(a) !== JSON.stringify(b)) localStorage.setItem(`${ID_PREFIX}-history`, JSON.stringify([newItem, ...currentHistory]));
      } else {
        let newItem = {
          id: 0,
          timestamp: Date.now(),
          setup: getSetup()
        };
        localStorage.setItem(`${ID_PREFIX}-history`, JSON.stringify([newItem]));
      }
      
      loadHistory();
    };
     
    const toggleHistoryAction = () => {
      let historyContainer = document.getElementById(`${ID_PREFIX}-historyContainer`);
      if (historyContainer.style.display == 'block') {
        historyContainer.style.display = 'none';
        toggleHistory.innerText = 'show history';
      } else {
        historyContainer.style.display = 'block';
        toggleHistory.innerText = 'hide history';
      }
    };
     
    
    
        if (localStorage.getItem(`${ID_PREFIX}-history`) === null) localStorage.setItem(`${ID_PREFIX}-history`, "[]");
        const historyContainer = document.createElement('div');
        historyContainer.id = `${ID_PREFIX}-historyContainer`;
        const editor = document.getElementById('editor');
        editor.parentNode.insertBefore(historyContainer, editor);
        
        
        

        const makeImage = document.getElementById('makeImage');
        makeImage.addEventListener('click', saveHistoryItem);
        
        const toggleHistory = document.createElement('button');
        toggleHistory.id = `${ID_PREFIX}-togglehistoryButton`;
        toggleHistory.innerText = "show history";
        toggleHistory.classList.add(`${ID_PREFIX}-history-btn`);
        toggleHistory.addEventListener('click', toggleHistoryAction);
        buttonsContainer.appendChild(toggleHistory);

        const save = document.createElement('button');
        save.id = `${ID_PREFIX}-savehistoryButton`;
        save.innerText = "save";
        save.classList.add(`${ID_PREFIX}-history-btn`);
        save.addEventListener('click', saveHistoryItem);
        buttonsContainer.appendChild(save);
        
        const closebutton = document.createElement('div');
      closebutton.id = `${ID_PREFIX}-history-closebutton`;
      closebutton.classList.add(`${ID_PREFIX}-history-closebutton`);
      closebutton.addEventListener('click', toggleHistoryAction);
      closebutton.innerHTML = `<i class="fa-solid fa-xmark"></i> Close`;
      historyContainer.appendChild(closebutton);
      const historyItemsContainer = document.createElement('div');
        historyItemsContainer.id = `${ID_PREFIX}-historyItemsContainer`;
        historyContainer.appendChild(historyItemsContainer);
        
        loadHistory();
    
})();