
(function() { "use strict"
const GITHUB_PAGE = "https://github.com/rbertus2000/sd-ui-plugins"
const VERSION = "1.0.8";
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
  #${ID_PREFIX}-history-closebutton {
    background: rgb(132, 8, 0);
    border: 1px solid rgb(122, 29, 0);
    color: rgb(255, 221, 255);
    padding: 3pt 6pt;
    border-radius: 5px;
    font-size: 10pt;
    text-align: center; 
    width: 70px;
    display: inline-block;
  }
  #${ID_PREFIX}-history-closebutton:hover {
    background: rgb(177, 27, 0);
    cursor: pointer;
  }
  #${ID_PREFIX}-usedspace {
    width: 180px;
    height: 1.5rem;
    display: inline-block;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
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
 
    /* inject new settings in the existing system settings popup table */
		let settings = [
			{
				id: "history-plugin-autosave",
				type: ParameterType.checkbox,
				label: "Add entry to history plugin automatically",
				note: "Add entry to history plugin with click on Make Images",
				icon: "fa-solid fa-list",
				default: true
			}
		];
	
		function injectParameters(parameters) {
			parameters.forEach(parameter => {
				var element = getParameterElement(parameter)
				var note = parameter.note ? `<small>${parameter.note}</small>` : "";
				var icon = parameter.icon ? `<i class="fa ${parameter.icon}"></i>` : "";
				var newRow = document.createElement('div')
				newRow.innerHTML = `
					<div>${icon}</div>
					<div><label for="${parameter.id}">${parameter.label}</label>${note}</div>
					<div>${element}</div>`
				parametersTable.appendChild(newRow)
				//parametersTable.insertBefore(newRow, parametersTable.children[13])
				parameter.settingsEntry = newRow
			})
		}
		injectParameters(settings)
		prettifyInputs(document);
		let autosaveentries = document.querySelector("#history-plugin-autosave");

    const editorInputs = document.getElementById("editor-inputs");
    
    const buttonsContainer = document.createElement('div');
    buttonsContainer.id = `${ID_PREFIX}-historyButtonContainer`;
    editorInputs.appendChild(buttonsContainer);
     
    
    function* getUsedSpace() {
        let charCount = 0;
        for (const key of Object.keys(window.localStorage)) {
            if (window.localStorage.hasOwnProperty(key)) {
                yield charCount = key.length + window.localStorage.getItem(key).length + charCount;
            }
        }
        return charCount;
    }
    function* getFreeSpace() {
        // The closer we are to the real size, the faster it returns.
        let maxCharSize = 10485760; // ~10MBytes
        let minCharSize = 0;
        const stopSize = 1024 * 1; // ~ 1KBytes
        const testKey = 'testQuota';
        let lastRunFailed = false;
        do {
            let trySize = 1;
            try {
                trySize = Math.ceil((maxCharSize - minCharSize) / 2) + minCharSize;
                window.localStorage.setItem(testKey, '1'.repeat(trySize));
                minCharSize = trySize;
                lastRunFailed = false;
            } catch {
                maxCharSize = trySize - 1;
                lastRunFailed = true;
            }
            yield minCharSize + testKey.length - (lastRunFailed ? 1 : 0);
        } while (maxCharSize - minCharSize > stopSize);
        window.localStorage.removeItem(testKey);
        return minCharSize + testKey.length - (lastRunFailed ? 1 : 0);
    }

    function formatBytes(bytes, decimals = 2) {
			if (!+bytes) return '0 Bytes'
		
			const k = 1024
			const dm = decimals < 0 ? 0 : decimals
			const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
		
			const i = Math.floor(Math.log(bytes) / Math.log(k))
		
			return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
		}
    
        
     
    function setSetup(stateObject) {
        promptField.value = stateObject.prompt;
        seedField.value = stateObject.seed;
        seedField.disabled = stateObject.random;
        randomSeedField.checked = stateObject.random;
        stableDiffusionModelField.value = stateObject.model;
        vaeModelField.value = stateObject.vae;
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
        hypernetworkModelField.value = stateObject.hypernetwork===undefined ? '' : stateObject.hypernetwork;
			hypernetworkStrengthField.value = stateObject.hypernetworkStrength===undefined ? 0 : stateObject.hypernetworkStrength;
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
            vae: vaeModelField.value,
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
            hypernetwork: hypernetworkModelField.value,
				    hypernetworkStrength: hypernetworkStrengthField.value,
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
        <span>sampler: '${item.sampler}'</span> <span>w: '${item.width}'</span> <span>h: '${item.height}'</span> <span>steps: '${item.steps}'</span> <span>scale: '${item.guidance}'</span> <span>model: '${item.model}'</span><span>VAE: '${item.vae}'</span><br/>
        <span>facefix: '${item.facefix}'</span> <span>upscale: '${item.useUpscaling}'</span> <span><b>Hypernetwork:</b> '${(item.hypernetwork===undefined|| item.hypernetwork==='') ? 'None' : item.hypernetwork}'</span> <span><b>Hypernetwork Strength:</b> '${item.hypernetworkStrength===undefined ? 0 : item.hypernetworkStrength}'</span> <span><b>seed:</b> ${item.random ? 'random' : item.seed}</span>
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
        currentItem.id = `${ID_PREFIX}-history-item-${item.id}`;
        currentItem.classList.add(`${ID_PREFIX}-history-item`);
        currentItem.innerHTML = buildHistoryItem(item.timestamp, item.setup);
        currentItem.addEventListener('click', () => {setSetup(item.setup);});
        deletebutton = document.createElement('div');
        deletebutton.id = `${ID_PREFIX}-history-deletebutton-${item.id}`;
        deletebutton.classList.add(`${ID_PREFIX}-history-deletebutton`);
        deletebutton.innerHTML = `<i class="fa-solid fa-trash"></i> Remove`;
        deletebutton.addEventListener('click', (e) => {
            e.preventDefault();
            if(e.ctrlKey || confirm("Are you sure you want to delete this history item?")) {
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
        updateStorageDisplay();
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
        
    function updateAutosaveListener() { 
        const makeImage = document.getElementById('makeImage');
        if (autosaveentries.checked==true) {
            makeImage.addEventListener('click', saveHistoryItem);
        }
        else {
          makeImage.removeEventListener('click', saveHistoryItem); 
        }
    }
        
        const toggleHistory = document.createElement('button');
        toggleHistory.id = `${ID_PREFIX}-togglehistoryButton`;
        toggleHistory.innerText = "show history";
        toggleHistory.classList.add(`${ID_PREFIX}-history-btn`);
        toggleHistory.title = `V${VERSION}`;
        toggleHistory.addEventListener('click', toggleHistoryAction);
        buttonsContainer.appendChild(toggleHistory);

        const save = document.createElement('button');
        save.id = `${ID_PREFIX}-savehistoryButton`;
        save.innerText = "save";
        save.classList.add(`${ID_PREFIX}-history-btn`);
        save.title = `V${VERSION}`;
        save.addEventListener('click', saveHistoryItem);
        buttonsContainer.appendChild(save);
        
        const closebutton = document.createElement('div');
      closebutton.id = `${ID_PREFIX}-history-closebutton`;
      closebutton.addEventListener('click', toggleHistoryAction);
      closebutton.innerHTML = `<i class="fa-solid fa-xmark"></i> Close`;
      historyContainer.appendChild(closebutton);

      const deleteallbutton = document.createElement('div');
		  deleteallbutton.id = `${ID_PREFIX}-history-deleteallbutton`;
		  deleteallbutton.classList.add(`${ID_PREFIX}-history-deletebutton`);
		  deleteallbutton.addEventListener('click', (e) => {
			e.preventDefault();
			if(e.ctrlKey || confirm(`Are you sure you want to delete all items?`)) {
			  
			  localStorage.removeItem(`${ID_PREFIX}-history`);
        localStorage.setItem(`${ID_PREFIX}-history`, "[]");
			  loadHistory();
			}
		  });
		  deleteallbutton.innerHTML = `<i class="fa-solid fa-trash"></i> Remove all Entries!`;
		  historyContainer.appendChild(deleteallbutton);

      const spacelabel = document.createElement('div');
		  spacelabel.id = `${ID_PREFIX}-history-spacelabel`;
		  spacelabel.classList.add(`${ID_PREFIX}-history-spacelabel`);
		  spacelabel.style.display = 'inline-block';
		  historyContainer.appendChild(spacelabel);
      const historyItemsContainer = document.createElement('div');
        historyItemsContainer.id = `${ID_PREFIX}-historyItemsContainer`;
        historyContainer.appendChild(historyItemsContainer);
        

    let fsGen = undefined;
    let usGen = undefined;
    function continueStorageUpdate() {
        if (!fsGen) {
            const gen = getFreeSpace();
            fsGen = { next: gen.next.bind(gen) };
        }
        if (!usGen) {
            const gen = getUsedSpace()
            usGen = { next: gen.next.bind(gen) };
        }
        if (!fsGen.done) {
            let freespace = fsGen.next();
            freespace.next = fsGen.next;
            fsGen = freespace;
        }
        if (!usGen.done) {
            let usedspace = usGen.next();
            usedspace.next = usGen.next;
            usGen = usedspace;
        }
        const textMsg = `Used: ${formatBytes(usGen.value)} / ${formatBytes(usGen.value + fsGen.value)}`;
        spacelabel.innerHTML = `<progress id="${ID_PREFIX}-usedspace" class="editor-slider" value="${Math.round((usGen.value / (usGen.value + fsGen.value)) * 100)}" max="100" title="${textMsg}">Storage ${textMsg}</progress>`;
        if (!fsGen.done || !usGen.done) {
            if (typeof requestIdleCallback === 'function') {
                requestIdleCallback(continueStorageUpdate, {timeout: 10});
            } else {
                setTimeout(continueStorageUpdate, 50);
            }
        }
    }
    function updateStorageDisplay() {
        fsGen = undefined;
        usGen = undefined;
        if (typeof requestIdleCallback === 'function') {
            requestIdleCallback(continueStorageUpdate, {timeout: 10});
        } else {
            setTimeout(continueStorageUpdate, 50);
        }
    }
    if (typeof requestIdleCallback === 'function') {
        requestIdleCallback(loadHistory, {timeout: 10});
    } else {
        setTimeout(loadHistory, 50);
    }

    // save/restore the desired method
    autosaveentries.addEventListener('change', (e) => {
      localStorage.setItem(settings[0].id, autosaveentries.checked)
      updateAutosaveListener()
  })
  autosaveentries.checked = localStorage.getItem(settings[0].id) == null ? settings[0].default : localStorage.getItem(settings[0].id) === 'true'
  updateAutosaveListener()	
})();